import { useEffect, useContext, useState } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { endpoints } from "config";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { Input, Combobox, Table, TableActions } from "Components/elements";
import s from "./settings.module.scss";

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
            // { label: "Columns" },
            { label: "Actions" },
          ]}
        >
          {reports?.map((report, i) => (
            <tr key={report._id}>
              <td>{report.name}</td>
              {/* <td>{report.pipeline?.length}</td> */}
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
  const {
    handleSubmit,
    register,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        name: yup.string().required("Report Name is required"),
      })
    ),
  });

  const { post, put, loading } = useFetch(
    endpoints.reports + (edit ? `/${edit?._id}` : "")
  );

  const columns = watch("columns");
  useEffect(() => {
    reset({
      name: edit?.name || "",
      columns: edit?.pipeline ? edit.pipeline : [],
    });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (columns.length <= 0) {
          return setErr("Add at least one column");
        }
        (edit ? put : post)({ ...values, pipeline: values.columns })
          .then(({ data }) => {
            if (data.success) {
              onSuccess(data.data);
            } else {
              Prompt({ type: "error", message: data.message });
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
      className={`p-1 grid gap-1`}
    >
      {err && <p className="error">{err}</p>}
      <Input {...register("name")} label="Report Name" error={errors.name} />

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
            { label: "Table" },
            { label: "field" },
            { label: "Actions" },
          ]}
        >
          {columns?.map((item, i) => (
            <tr key={item.label}>
              <td>{item.label}</td>
              <td>{item.table?.name}</td>
              <td>{item.field}</td>
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

      <div className="flex justify-center">
        <button className="btn">{edit ? "Update Report" : "Add Report"}</button>
      </div>
    </form>
  );
};

const ColumnForm = ({ edit, onSuccess }) => {
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
        table: yup.string().required("Label is required"),
        field: yup.string().required("Label is required"),
      })
    ),
  });

  const [tables, setTables] = useState([]);
  const { get: getTables } = useFetch(endpoints.allCollections);

  const table = watch("table");

  useEffect(() => {
    getTables()
      .then(({ data }) => {
        if (data.success) {
          // console.log(data.data);
          setTables([
            ...data.data.map((table) => ({
              label: table.name,
              type: table.type,
              value: `${table.name}-${table.type}`,
              fields: table.fields,
            })),
          ]);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    reset({
      label: edit?.label || "",
      table: edit?.table ? `${edit?.table.name}-${edit?.table.type}` : "",
      field: edit?.field || "",
    });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const coll = tables?.find((t) => t.value === values.table);
        onSuccess({
          _id: edit?._id || Math.random().toString(36).substr(-8),
          label: values.label,
          table: {
            name: coll.label,
            type: coll.type,
          },
          field: values.field,
        });
      })}
      className={`p-1 grid gap-1`}
    >
      <Input {...register("label")} label="Label" error={errors.label} />
      <Combobox label="Table" name="table" control={control} options={tables} />
      <Combobox
        label="Field"
        name="field"
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

      <div className="flex justify-center">
        <button className="btn">{edit ? "Update Column" : "Add Column"}</button>
      </div>
    </form>
  );
};

export default Reports;
