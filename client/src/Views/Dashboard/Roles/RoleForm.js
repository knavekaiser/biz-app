import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input, Table, Checkbox } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./roles.module.scss";
import { endpoints, tables } from "config";
import { SiteContext } from "SiteContext";

const mainSchema = yup.object({
  name: yup.string().required(),
  permissions: yup.array().of(yup.string()),
});

const Form = ({ edit, dynamicTables, onSuccess }) => {
  const { user } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const {
    post: saveRole,
    put: updateRole,
    loading,
  } = useFetch(endpoints.roles + `/${edit?._id || ""}`);

  const permissions = watch("permissions");

  useEffect(() => {
    reset({ name: edit?.name || "", permissions: edit?.permissions || [] });
  }, [edit]);
  return (
    <div className={`grid gap-1 p-1 ${s.addRoleForm}`}>
      <form
        onSubmit={handleSubmit((values) => {
          (edit ? updateRole : saveRole)(values)
            .then(({ data }) => {
              if (!data.success) {
                return Prompt({ type: "error", message: data.message });
              }
              onSuccess(data.data);
            })
            .catch((err) => Prompt({ type: "error", message: err.message }));
        })}
        className={`${s.mainForm} grid gap-1`}
      >
        <div className={s.box}>
          <Input
            label="Name"
            {...register("name")}
            required
            error={errors.name}
          />
        </div>

        <div className={`${s.box} all-columns`}>
          <h3>Permissions</h3>

          <Table
            className={s.permissions}
            columns={[
              { label: "Table" },
              { label: "Read", className: "align-center" },
              { label: "Create", className: "align-center" },
              { label: "Update", className: "align-center" },
              { label: "Delete", className: "align-center" },
            ]}
          >
            {[...tables, ...dynamicTables].map((table, i) => (
              <tr key={table.value}>
                <td className={s.name}>{table.label}</td>
                {table.actions.map((action, j) => {
                  const value = `${table.value}_${action || j}`;
                  const el = (
                    <td className="align-center" key={value}>
                      <Checkbox
                        checked={(permissions || []).includes(value)}
                        disabled={
                          (value === "dynamic_table_read" &&
                            (permissions || []).some((item) =>
                              item.startsWith(user._id)
                            )) ||
                          (value.endsWith("_read") &&
                            (permissions || []).some(
                              (item) =>
                                item !== value &&
                                item.startsWith(value.replace("_read", ""))
                            ))
                        }
                        onChange={(e) => {
                          if ((permissions || []).includes(value)) {
                            setValue(
                              "permissions",
                              permissions.filter((item) => item !== value)
                            );
                          } else {
                            setValue("permissions", [
                              ...new Set([
                                ...(permissions || []),
                                ...(value.startsWith(user._id)
                                  ? ["dynamic_table_read"]
                                  : []),
                                ...(/^(.*)(create|update|delete)$/.test(value)
                                  ? [
                                      value.replace(
                                        /(create|update|delete)$/,
                                        "read"
                                      ),
                                    ]
                                  : []),
                                value,
                              ]),
                            ]);
                          }
                        }}
                      />
                    </td>
                  );
                  if (j === 0 && action === "read") {
                    return el;
                  } else if (j === 1 && action === "create") {
                    return el;
                  } else if (j === 2 && action === "update") {
                    return el;
                  } else if (j === 3 && action === "delete") {
                    return el;
                  }
                  return <td key={`${table.value}_${j}`} />;
                })}
              </tr>
            ))}
          </Table>
        </div>

        <div className="btns">
          <button className="btn" disabled={loading}>
            {edit ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
