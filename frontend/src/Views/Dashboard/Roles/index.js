import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions } from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./roles.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import RoleForm from "./RoleForm";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";

const Roles = ({ setSidebarOpen }) => {
  const { checkPermission } = useContext(SiteContext);
  const [dynamicTables, setDynamicTables] = useState([]);
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(null);
  const [addRole, setAddRole] = useState(false);

  const { get: getTables } = useFetch(endpoints.collections);
  const { get: getRoles, loading } = useFetch(endpoints.roles);
  const { remove: deleteRole } = useFetch(endpoints.roles + "/{ID}");

  useEffect(() => {
    getTables().then(({ data }) => {
      if (data.success) {
        setDynamicTables(
          data.data.map((item) => ({
            label: item.name,
            value: `${item.user}_${item.name}`,
            actions: ["read", "create", "update", "delete"],
          }))
        );
      }
    });
    getRoles()
      .then(({ data }) => {
        if (data.success) {
          return setRoles(data.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Prompt({ type: "error", message: err.message });
      });
  }, []);

  return (
    <div className={`${s.content} grid gap-1 m-a`}>
      <div className={`flex ${s.head}`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>All Roles</h2>
          {checkPermission("role_create") && (
            <button
              className="btn clear iconOnly"
              onClick={(e) => {
                e.stopPropagation();
                setAddRole(true);
              }}
            >
              <GoPlus />
            </button>
          )}
        </div>
      </div>
      <Table
        loading={loading}
        className={s.roles}
        columns={[{ label: "Name" }, { label: "Action" }]}
      >
        {roles.map((item) => (
          <tr
            onClick={() => {
              setRole(item);
              setAddRole(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className={s.date}>{item.name}</td>
            <TableActions
              className={s.actions}
              actions={[
                ...(checkPermission("role_update")
                  ? [
                      {
                        icon: <FaPencilAlt />,
                        label: "View",
                        onClick: () => {
                          setRole(item);
                          setAddRole(true);
                        },
                      },
                    ]
                  : []),
                ...(checkPermission("role_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        onClick: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this role?`,
                            callback: () => {
                              deleteRole(
                                {},
                                { params: { "{ID}": item._id } }
                              ).then(({ data }) => {
                                if (data.success) {
                                  setRoles((prev) =>
                                    prev.filter((role) => role._id !== item._id)
                                  );
                                } else {
                                  Prompt({
                                    type: "error",
                                    message: data.message,
                                  });
                                }
                              });
                            },
                          }),
                      },
                    ]
                  : []),
              ]}
            />
          </tr>
        ))}
      </Table>
      <Modal
        open={addRole}
        head
        label={`${role ? "View / Update" : "Add"} Role`}
        className={s.addRoleFormModal}
        setOpen={() => {
          setRole(null);
          setAddRole(false);
        }}
      >
        <RoleForm
          edit={role}
          dynamicTables={dynamicTables}
          onSuccess={(newRole) => {
            if (role) {
              setRoles((prev) =>
                prev.map((item) => (item._id === newRole._id ? newRole : item))
              );
              setRole(null);
            } else {
              setRoles((prev) => [...prev, newRole]);
            }
            setAddRole(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Roles;
