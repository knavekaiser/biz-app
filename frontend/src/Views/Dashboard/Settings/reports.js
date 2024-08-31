import { useEffect, useState } from "react";
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
            { label: "Table" },
            { label: "Actions" },
          ]}
        >
          {reports?.map((report, i) => (
            <tr key={report._id}>
              <td>{report.name}</td>
              <td>
                {report.table?.name} - {report.table?.type}
              </td>
              <TableActions
                actions={[
                  {
                    icon: <FaPencilAlt />,
                    label: "Edit",
                    callBack: () => {
                      setEditReport(report);
                      setAddReport(true);
                    },
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    disabled: deleting,
                    callBack: () =>
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
        table: yup.string().required("Please select a base table"),
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

  const table = watch("table");
  const columns = watch("columns");
  const pipeline = watch("pipeline");
  useEffect(() => {
    reset({
      name: edit?.name || "",
      table: edit?.table ? `${edit?.table.name}-${edit?.table.type}` : "",
      columns: edit?.columns || [],
      pipeline: JSON.stringify(edit?.pipeline || [{ Some: "Test" }], null, 2),
    });
  }, [edit]);

  useEffect(() => {
    getTables()
      .then(({ data }) => {
        if (data.success) {
          setTables([
            ...data.data.map((table) => ({
              label: table.label,
              name: table.name,
              type: table.type,
              value: `${table.name}-${table.type}`,
              fields: table.fields,
            })),
          ]);
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
        if (step === 1) {
          if (!values.pipeline || values.pipeline === "[]") {
            const coll = tables?.find((t) => t.value === values.table);
            await genPipeline({
              table: {
                name: coll.name,
                module: coll.module,
                submodule: coll.submodule,
                type: coll.type,
              },
              columns: values.columns,
            })
              .then(({ data }) => {
                if (data.success) {
                  setValue("pipeline", JSON.stringify(data.data, null, 2));
                } else {
                  Prompt({ type: "error", message: data.message });
                }
              })
              .catch((err) => Prompt({ type: "error", message: err.message }));
          }
          setStep(2);
          return;
        }

        try {
          values.pipeline = JSON.parse(values.pipeline);
        } catch (err) {
          return setError("pipeline", {
            type: "custom",
            message: "Pipeline must be valid JSON",
          });
        }
        const coll = tables?.find((t) => t.value === values.table);
        (edit ? put : post)({
          ...values,
          table: {
            name: coll.name,
            module: coll.module,
            submodule: coll.submodule,
            type: coll.type,
          },
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

          <Combobox
            label="Table"
            name="table"
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
                { label: "Type" },
                { label: "Table" },
                { label: "field" },
                { label: "Actions" },
              ]}
            >
              {columns?.map((item, i) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td>{item.type}</td>
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
                        callBack: () => {
                          setEditItem(item);
                          setUpdateItems(true);
                        },
                      },
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        callBack: () =>
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
          table={table}
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
                const coll = tables?.find((t) => t.value === table);
                const payload = {
                  table: {
                    name: coll.name,
                    module: coll.module,
                    submodule: coll.submodule,
                    type: coll.type,
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
              <tr key={rec._id || i}>
                {columns.map((col, i) => {
                  let data = rec[col.field] || rec[col.label];
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
  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        label: yup.string().required("Label is required"),
        type: yup.string().required("Type is required"),
        table: yup.string().when("type", {
          is: "lookup",
          then: (s) => s.required("Table is required"),
          otherwise: (s) => s,
        }),
        field: yup.string().when("type", {
          is: "localField",
          then: (s) => s.required("Field is required"),
          otherwise: (s) => s,
        }),
        localField: yup.string().when("type", {
          is: "lookup",
          then: (s) => s.required("Local Field is required"),
          otherwise: (s) => s,
        }),
        foreignField: yup.string().when("type", {
          is: "foreignField",
          then: (s) => s.required("Foreign Field is required"),
          otherwise: (s) => s,
        }),
      })
    ),
  });

  const table = watch("table");
  const type = watch("type");

  useEffect(() => {
    reset({
      label: edit?.label || "",
      type: edit?.type || "localField",
      localField: edit?.localField || "",
      foreignField: edit?.foreignField || "",
      table: edit?.table ? `${edit?.table.name}-${edit?.table.type}` : "",
      field: edit?.field || "",
    });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const coll = tables?.find((t) => t.value === values.table);
        const payload = {
          _id: edit?._id || Math.random().toString(36).substr(-8),
          label: values.label,
          type: values.type,
        };
        if (values.type === "localField") {
          payload.field = values.field;
        } else if (values.type === "lookup") {
          payload.table = {
            name: coll.name,
            type: coll.type,
            module: coll.module,
            submodule: coll.submodule,
          };
          payload.localField = values.localField;
          payload.foreignField = values.foreignField;
        }
        onSuccess(payload);
      })}
      className={`p-1 grid gap-1`}
    >
      <Input {...register("label")} label="Label" error={errors.label} />
      <Combobox
        label="Type"
        name="type"
        control={control}
        options={[
          { label: "Local Field", value: "localField" },
          { label: "Lookup / Join", value: "lookup" },
        ]}
      />
      {type === "localField" && (
        <Combobox
          label="Field"
          name="field"
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
      )}
      {type === "lookup" && (
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