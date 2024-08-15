import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions } from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./subPlans.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import SubPlanForm from "./SubPlanForm";
import { GoPlus } from "react-icons/go";
import { BsList } from "react-icons/bs";

const SubPlans = ({ setSidebarOpen }) => {
  const { checkPermission } = useContext(SiteContext);
  const [subPlans, setSubPlans] = useState([]);
  const [subPlan, setSubPlan] = useState(null);
  const [addSubPlan, setAddSubPlan] = useState(false);

  const { get: getSubPlans, loading } = useFetch(endpoints.subPlans);
  const { remove: deleteSubPlan } = useFetch(endpoints.subPlans + "/{ID}");

  useEffect(() => {
    getSubPlans()
      .then(({ data }) => {
        if (data.success) {
          return setSubPlans(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>All Subscription Plans</h2>
          {checkPermission("sub_plan_create") && (
            <button
              className="btn clear iconOnly"
              onClick={(e) => {
                e.stopPropagation();
                setAddSubPlan(true);
              }}
            >
              <GoPlus />
            </button>
          )}
        </div>
      </div>
      <Table
        loading={loading}
        className={s.subPlans}
        columns={[
          { label: "Name" },
          { label: "Duration" },
          { label: "Price" },
          { label: "Action" },
        ]}
      >
        {subPlans.map((item) => (
          <tr
            onClick={() => {
              setSubPlan(item);
              setAddSubPlan(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td>{item.name}</td>
            <td>{item.duration.toLocaleString()} days</td>
            <td>{item.price.toLocaleString()}</td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  callBack: () => {
                    setSubPlan(item);
                    setAddSubPlan(true);
                  },
                },
                ...(checkPermission("sub_plan_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        callBack: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this Plan?`,
                            callback: () => {
                              deleteSubPlan(
                                {},
                                { params: { "{ID}": item._id } }
                              ).then(({ data }) => {
                                if (data.success) {
                                  setSubPlans((prev) =>
                                    prev.filter((plan) => plan._id !== item._id)
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
        open={addSubPlan}
        head
        label={`${subPlan ? "View / Update" : "Add"} Subscription Plan`}
        className={s.addSubPlanFormModal}
        setOpen={() => {
          setSubPlan(null);
          setAddSubPlan(false);
        }}
      >
        <SubPlanForm
          edit={subPlan}
          onSuccess={(newCat) => {
            if (subPlan) {
              setSubPlans((prev) =>
                prev.map((item) => (item._id === newCat._id ? newCat : item))
              );
              setSubPlan(null);
            } else {
              setSubPlans((prev) => [...prev, newCat]);
            }
            setAddSubPlan(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default SubPlans;
