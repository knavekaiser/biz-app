import { useState, useContext } from "react";
import { Moment, Table, TableActions } from "Components/elements";
import { FaPencilAlt } from "react-icons/fa";
import { Modal } from "Components/modal";
import s from "./style.module.scss";

import EmpForm from "./Form";
import { SiteContext } from "SiteContext";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";

const Emps = ({ setSidebarOpen }) => {
  const { finPeriods, setFinPeriods, checkPermission } =
    useContext(SiteContext);
  const [period, setPeriod] = useState(null);
  const [addPeriod, setAddPeriod] = useState(false);

  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className={`flex ${s.head}`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>Financial Periods</h2>
          {checkPermission("fin_period_create") && (
            <button
              className="btn clear iconOnly"
              onClick={(e) => {
                e.stopPropagation();
                setAddPeriod(true);
              }}
            >
              <GoPlus />
            </button>
          )}
        </div>
      </div>
      <Table
        className={s.emps}
        columns={[
          { label: "Label" },
          { label: "Start Date" },
          { label: "End Date" },
          { label: "Action" },
        ]}
      >
        {finPeriods.map((item) => (
          <tr
            onClick={() => {
              setPeriod(item);
              setAddPeriod(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td>{item.label}</td>
            <td>
              <Moment format="DD MMM YYYY">{item.startDate}</Moment>
            </td>
            <td>
              <Moment format="DD MMM YYYY">{item.endDate}</Moment>
            </td>
            <TableActions
              className={s.actions}
              actions={[
                ...(checkPermission("fin_period_update")
                  ? [
                      {
                        icon: <FaPencilAlt />,
                        label: "Update",
                        onClick: () => {
                          setPeriod(item);
                          setAddPeriod(true);
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
        open={addPeriod}
        head
        label={`${period ? "Update" : "Add"} Financial Period`}
        className={s.addFormModal}
        setOpen={() => {
          setPeriod(null);
          setAddPeriod(false);
        }}
      >
        <EmpForm
          edit={period}
          onSuccess={(newEmp) => {
            if (period) {
              setFinPeriods((prev) => {
                if (newEmp) {
                  return prev.map((item) =>
                    item._id === newEmp._id ? newEmp : item
                  );
                } else {
                  return prev.filter((item) => item._id !== period._id);
                }
              });
              setPeriod(null);
            } else {
              setFinPeriods((prev) => [...prev, newEmp]);
            }
            setAddPeriod(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Emps;
