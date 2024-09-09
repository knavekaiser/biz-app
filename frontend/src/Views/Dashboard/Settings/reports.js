import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { endpoints } from "config";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import {
  Input,
  Combobox,
  Table,
  TableActions,
  Textarea,
  Select,
  Moment,
} from "Components/elements";
import s from "./settings.module.scss";
import { IoMdArrowForward } from "react-icons/io";

const Reports = () => {
  const [addReport, setAddReport] = useState(false);
  const [editReport, setEditReport] = useState(null);
  const [reports, setReports] = useState([]);

  const { get: getReports, loading } = useFetch(endpoints.reports);
  const { remove: dltReport, loading: deleting } = useFetch(
    endpoints.reports + "/{ID}"
  );

  useEffect(() => {
    getReports()
      .then(({ data }) => {
        if (data.success) {
          setReports(data.data);
        }
      })
      .catch((err) =>
        Prompt({
          type: "error",
          message: "Reports could not be fetched.",
        })
      );
  }, []);

  return (
    <div className="grid gap-1">
      <div>
        <div className="flex justify-space-between align-center mb-1">
          <h5>Reports</h5>
          <button
            className="btn"
            type="button"
            onClick={() => setAddReport(true)}
          >
            Create Report Template
          </button>
        </div>
        <Table
          columns={[
            { label: "Report Name" },
            { label: "Module" },
            { label: "Actions" },
          ]}
        >
          {reports?.map((report, i) => (
            <tr key={report._id}>
              <td>{report.name}</td>
              <td>{report.tables?.find((t) => t.type === "module")?.name}</td>
              <TableActions
                actions={[
                  {
                    icon: <FaPencilAlt />,
                    label: "Edit",
                    onClick: () => {
                      setEditReport(report);
                      setAddReport(true);
                    },
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    disabled: deleting,
                    onClick: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove this section?`,
                        callback: () => {
                          dltReport({}, { params: { "{ID}": report._id } })
                            .then(({ data }) => {
                              if (data.success) {
                                setReports(
                                  reports.filter((i) => i._id !== report._id)
                                );
                              } else {
                                Prompt({
                                  type: "error",
                                  message: data.message,
                                });
                              }
                            })
                            .catch((err) =>
                              Prompt({ type: "error", message: err.message })
                            );
                        },
                      }),
                  },
                ]}
              />
            </tr>
          ))}
        </Table>
      </div>

      <Modal
        open={addReport}
        head
        label={`${editReport ? "Update" : "Create"} Report Template`}
        className={s.recFilterModal}
        setOpen={() => {
          setAddReport(false);
          setEditReport(null);
        }}
      >
        <Form
          edit={editReport}
          onSuccess={(value) => {
            setReports(
              editReport
                ? reports.map((item) => (item._id === value._id ? value : item))
                : [...reports, value]
            );
            setAddReport(false);
            setEditReport(null);
          }}
        />
      </Modal>
    </div>
  );
};

const Form = ({ edit, onSuccess }) => {
  const [updateItems, setUpdateItems] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [err, setErr] = useState(null);
  const [step, setStep] = useState(1);
  const [tables, setTables] = useState([]);
  const [data, setData] = useState([]);
  const {
    handleSubmit,
    register,
    watch,
    control,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        name: yup.string().required("Report Name is required"),
        tables: yup.array().of(yup.string()).required("Please select tables"),
      })
    ),
  });

  const { get: getTables } = useFetch(endpoints.allCollections);
  const { post, put, loading } = useFetch(
    endpoints.reports + (edit ? `/${edit?._id}` : "")
  );
  const { post: getData, loading: loadingData } = useFetch(
    endpoints.testReportPipeline
  );
  const { post: genPipeline, loading: generatingPipeline } = useFetch(
    endpoints.generateReportPipeline
  );

  const selectedTables = watch("tables");
  const columns = watch("columns");
  const pipeline = watch("pipeline");
  useEffect(() => {
    reset({
      name: edit?.name || "",
      tables: edit?.tables
        ? edit.tables.map(
            (t) => `${t.module ? `${t.module}-` : ""}${t.name}-${t.type}`
          )
        : [],
      columns: edit?.columns || [],
      pipeline: JSON.stringify(edit?.pipeline || [], null, 2),
    });
  }, [edit]);

  useEffect(() => {
    getTables()
      .then(({ data }) => {
        if (data.success) {
          setTables(
            data.data.map((table) => ({
              label: table.label,
              name: table.name,
              type: table.type,
              module: table.module,
              value: `${table.module ? `${table.module}-` : ""}${table.name}-${
                table.type
              }`,
              fields: table.fields,
            }))
          );
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (columns.length <= 0) {
          return setErr("Add at least one column");
        }
        let selectedTables = tables.filter((t) =>
          values.tables.includes(t.value)
        );
        const selectedModule = selectedTables.find((t) => t.type === "module");
        if (!selectedModule) {
          return setError("tables", {
            type: "custom",
            message: "Please select a module",
          });
        }
        selectedTables = selectedTables.filter((t) =>
          t.type === "module"
            ? t.value === selectedModule.value
            : t.module === selectedModule.name
        );
        setValue(
          "tables",
          selectedTables.map((t) => t.value)
        );
        if (step === 1) {
          let parsed = null;
          const generate = async () =>
            genPipeline({
              table: {
                name: selectedModule.name,
                type: "module",
              },
              columns: values.columns,
            })
              .then(({ data }) => {
                if (data.success) {
                  setValue("pipeline", JSON.stringify(data.data, null, 2));
                } else {
                  Prompt({ type: "error", message: data.message });
                }
                setStep(2);
              })
              .catch((err) => Prompt({ type: "error", message: err.message }));
          try {
            parsed = JSON.parse(values.pipeline);
          } catch (err) {
            parsed = [];
          }
          if (!parsed || !parsed.length) {
            await generate();
            return;
          } else {
            return Prompt({
              type: "confirmation",
              message: "Do you want to regenerate the pipeline?",
              callback: async () => generate(),
              onDecline: () => setStep(2),
            });
          }
        }

        try {
          values.pipeline = JSON.parse(values.pipeline);
        } catch (err) {
          return setError("pipeline", {
            type: "custom",
            message: "Pipeline must be valid JSON",
          });
        }
        (edit ? put : post)({
          ...values,
          tables: selectedTables.map((t) => ({
            name: t.name,
            type: t.type,
            module: t.module,
            submodule: t.submodule,
          })),
        })
          .then(({ data }) => {
            if (data.success) {
              onSuccess(data.data);
            } else {
              Prompt({ type: "error", message: data.message });
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
      className={`p-1 grid gap-1 ${s.form}`}
    >
      {err && <p className="error">{err}</p>}

      {step === 1 && (
        <>
          <Input
            {...register("name")}
            label="Report Name"
            error={errors.name}
          />

          <Select
            label="Tables"
            multiple
            name="tables"
            control={control}
            options={tables}
          />
          <div>
            <div className="flex justify-space-between align-center mb-1">
              <h5>Items</h5>
              <button
                className="btn"
                type="button"
                onClick={() => setUpdateItems(true)}
              >
                Add Column
              </button>
            </div>
            <Table
              columns={[
                { label: "Label" },
                // { label: "Type" },
                { label: "Table" },
                { label: "field" },
                { label: "Actions" },
              ]}
            >
              {columns?.map((item, i) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  {/* <td>{item.type}</td> */}
                  <td>{item.table?.name}</td>
                  <td>
                    {item.type === "lookup" ? (
                      <>
                        {item.localField} <IoMdArrowForward />{" "}
                        {item.foreignField}
                      </>
                    ) : (
                      item.field
                    )}
                  </td>
                  <TableActions
                    actions={[
                      {
                        icon: <FaPencilAlt />,
                        label: "Edit",
                        onClick: () => {
                          setEditItem(item);
                          setUpdateItems(true);
                        },
                      },
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        onClick: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this item?`,
                            callback: () => {
                              setValue(
                                "columns",
                                columns.filter((i) => i._id !== item._id)
                              );
                            },
                          }),
                      },
                    ]}
                  />
                </tr>
              ))}
            </Table>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <Textarea
            className={s.codeInput}
            label="MongoDB Pipeline"
            {...register("pipeline")}
          />
        </>
      )}

      <Modal
        open={updateItems}
        head
        label={`${editItem ? "Update" : "Add"} Column`}
        className={s.recFilterModal}
        setOpen={() => {
          setUpdateItems(false);
          setEditItem(null);
        }}
      >
        <ColumnForm
          table={selectedTables}
          tables={tables}
          edit={editItem}
          onSuccess={(value) => {
            setValue(
              "columns",
              editItem
                ? columns.map((item) => (item._id === value._id ? value : item))
                : [...columns, value]
            );
            setUpdateItems(false);
            setEditItem(null);
            setErr(null);
          }}
        />
      </Modal>

      {step === 2 && (
        <div>
          <div className="flex justify-space-between align-center mb-1">
            <h5>Preview Data</h5>
            <button
              className="btn"
              type="button"
              onClick={() => {
                const selectedModule = tables.find(
                  (t) => t.type === "module" && selectedTables.includes(t.value)
                );
                const payload = {
                  table: {
                    name: selectedModule.name,
                    type: "module",
                  },
                };
                try {
                  payload.pipeline = JSON.parse(pipeline);
                } catch (err) {
                  return Prompt({ type: "error", message: err.message });
                }
                getData(payload)
                  .then(({ data }) => {
                    if (data.success) {
                      setData(data.data);
                    } else {
                      Prompt({ type: "error", message: data.message });
                    }
                  })
                  .catch((err) =>
                    Prompt({ type: "error", message: err.message })
                  );
              }}
            >
              Preview Data
            </button>
          </div>
          <Table columns={columns.map((col) => ({ label: col.label }))}>
            {data?.map((rec, i) => (
              <tr key={i}>
                {columns.map((col, i) => {
                  let data = rec[col.label];
                  if (Array.isArray(data)) {
                    data = data.length;
                  } else if (data === null) {
                    data = (
                      <span>
                        <i>NULL</i>
                      </span>
                    );
                  } else if (typeof data === "object") {
                    data = JSON.stringify(data);
                  } else if (data && col.dataType === "date") {
                    data = <Moment format="DD MMM YY hh:mma">{data}</Moment>;
                  } else if (!data) {
                    data = "--";
                  }
                  return <td key={i}>{data}</td>;
                })}
              </tr>
            ))}
          </Table>
        </div>
      )}

      <div className="flex justify-center gap-1">
        {step > 1 && (
          <button
            type="button"
            className="btn secondary"
            onClick={() => setStep(step - 1)}
          >
            Go Back
          </button>
        )}
        <button className="btn" disabled={loading || generatingPipeline}>
          {step < 2 ? "Next" : "Submit"}
        </button>
      </div>
    </form>
  );
};

const ColumnForm = ({ table: baseTable, edit, onSuccess, tables }) => {
  const fields = useMemo(() => {
    return (
      tables
        ?.filter((t) => baseTable.includes(t.value))
        .map((t) => t.fields.map((f) => ({ ...f, parent: t })))
        .flat()
        .map((f) => ({
          label: `${f.parent.name}: ${f.label}`,
          value: `${f.parent.name}-${f.name}`,
          fieldLabel: f.label,
          parent: f.parent,
        })) || []
    );
  }, [tables, baseTable]);
  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: useYup(
      yup.object({
        label: yup.string().required("Label is required"),
        type: yup.string().required("Type is required"),
        // table: yup.string().when("type", {
        //   is: "lookup",
        //   then: (s) => s.required("Table is required"),
        //   otherwise: (s) => s,
        // }),
        field: yup.string().when("type", {
          is: "localField",
          then: (s) => s.required("Field is required"),
          otherwise: (s) => s,
        }),
        // localField: yup.string().when("type", {
        //   is: "lookup",
        //   then: (s) => s.required("Local Field is required"),
        //   otherwise: (s) => s,
        // }),
        // foreignField: yup.string().when("type", {
        //   is: "foreignField",
        //   then: (s) => s.required("Foreign Field is required"),
        //   otherwise: (s) => s,
        // }),
      })
    ),
  });

  const table = watch("table");
  const label = watch("label");

  useEffect(() => {
    reset({
      label: edit?.label || "",
      type: edit?.type || "localField",
      localField: edit?.localField || "",
      foreignField: edit?.foreignField || "",
      table: edit?.table ? `${edit?.table.name}-${edit?.table.type}` : "",
      field: `${edit?.value}` || "",
    });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const parentTable = tables.find(
          (t) =>
            t.name === fields.find((f) => f.value === values.field)?.parent.name
        );
        const field = parentTable.fields.find(
          (f) => `${parentTable.name}-${f.name}` === values.field
        );

        const payload = {
          dataType: field.dataType,
          _id: edit?._id || Math.random().toString(36).substr(-8),
          label: values.label,
          value: values.field,
        };
        if (parentTable.type === "module") {
          payload.type = "localField";
          payload.field = field.name;
          if (field.coll) {
            payload.type = "module-coll-lookup";
            payload.table = {
              name: field.name,
              type: "module-coll",
              module: parentTable.name,
            };
            payload.localField = field.coll.name;
            payload.foreignField = "_id";
          }
        } else if (parentTable.type === "submodule") {
          payload.type = "submodule-lookup";
          payload.table = {
            name: parentTable.name,
            field: field.name,
            type: parentTable.type,
            module: parentTable.module,
            submodule: parentTable.name,
          };
          payload.localField = "_id";
          payload.foreignField = "record";
          if (field.coll) {
            payload.type = "submodule-coll-lookup";
            payload.table = {
              name: field.name,
              type: parentTable.type,
              module: parentTable.module,
              submodule: parentTable.name,
            };
            payload.localField = field.coll.name;
            payload.foreignField = "_id";
          }
        }

        onSuccess(payload);
      })}
      className={`p-1 grid gap-1`}
    >
      <Combobox
        label="Field"
        name="field"
        control={control}
        options={fields}
        onChange={(opt) => {
          if (!label || !fields.some((f) => f.fieldLabel === opt.fieldLabel)) {
            setValue("label", opt.fieldLabel);
          }
        }}
      />
      <Input {...register("label")} label="Label" error={errors.label} />
      {/* <Combobox
        label="Type"
        name="type"
        control={control}
        options={[
          { label: "Local Field", value: "localField" },
          { label: "Lookup / Join", value: "lookup" },
        ]}
      /> */}
      {false && (
        <>
          <Combobox
            label="Table"
            name="table"
            control={control}
            options={tables}
          />
          <Combobox
            label="Local Field"
            name="localField"
            control={control}
            options={
              tables
                ?.find((t) => t.value === baseTable)
                ?.fields?.map((f) => ({
                  label: f.label,
                  value: f.name,
                })) || []
            }
          />
          <Combobox
            label="Foreign Field"
            name="foreignField"
            control={control}
            options={
              table
                ? tables
                    ?.find((t) => t.value === table)
                    ?.fields?.map((f) => ({
                      label: f.label,
                      value: f.name,
                    }))
                : []
            }
          />
        </>
      )}

      <div className="flex justify-center">
        <button className="btn">{edit ? "Update Column" : "Add Column"}</button>
      </div>
    </form>
  );
};

export default Reports;
