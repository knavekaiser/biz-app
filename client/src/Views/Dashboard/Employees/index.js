import { useState, useEffect, useContext } from "react";
import { Table, TableActions } from "Components/elements";
import { FaPencilAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./emps.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import EmpForm from "./EmpForm";
import { SiteContext } from "SiteContext";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";

const Emps = ({ setSidebarOpen }) => {
  const { checkPermission } = useContext(SiteContext);
  const [emps, setEmps] = useState([]);
  const [emp, setEmp] = useState(null);
  const [addEmp, setAddEmp] = useState(false);

  const { get: getEmps, loading } = useFetch(endpoints.employees);

  useEffect(() => {
    getEmps()
      .then(({ data }) => {
        if (data.success) {
          return setEmps(data.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Prompt({ type: "error", message: err.message });
      });
  }, []);

  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className={`flex ${s.head}`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>All Staffs</h2>
          {checkPermission("employee_create") && (
            <button
              className="btn clear iconOnly"
              onClick={(e) => {
                e.stopPropagation();
                setAddEmp(true);
              }}
            >
              <GoPlus />
            </button>
          )}
        </div>
      </div>
      <Table
        loading={loading}
        className={s.emps}
        columns={[{ label: "Name" }, { label: "Role" }, { label: "Action" }]}
      >
        {emps.map((item) => (
          <tr
            onClick={() => {
              setEmp(item);
              setAddEmp(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className={s.date}>{item.name}</td>
            <td className={s.date}>
              {item.roles.map((role) => (
                <p key={role._id}>{role.name}</p>
              ))}
            </td>
            <TableActions
              className={s.actions}
              actions={[
                ...(checkPermission("employee_update")
                  ? [
                      {
                        icon: <FaPencilAlt />,
                        label: "Update",
                        callBack: () => {
                          setEmp(item);
                          setAddEmp(true);
                        },
                      },
                    ]
                  : []),
              ]}
            />
          </tr>
        ))}
      </Table>
      <Modal
        open={addEmp}
        head
        label={`${emp ? "Update" : "Add"} Staff`}
        className={s.addEmpFormModal}
        setOpen={() => {
          setEmp(null);
          setAddEmp(false);
        }}
      >
        <EmpForm
          edit={emp}
          onSuccess={(newEmp) => {
            if (emp) {
              setEmps((prev) => {
                if (newEmp) {
                  return prev.map((item) =>
                    item._id === newEmp._id ? newEmp : item
                  );
                } else {
                  return prev.filter((item) => item._id !== emp._id);
                }
              });
              setEmp(null);
            } else {
              setEmps((prev) => [...prev, newEmp]);
            }
            setAddEmp(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Emps;
