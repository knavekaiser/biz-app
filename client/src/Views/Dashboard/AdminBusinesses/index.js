import { useContext, useEffect, useState } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions } from "Components/elements";
import s from "./sales.module.scss";
import { Modal, Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { endpoints } from "config";
import BusinessForm from "./BusinessForm";
import { useNavigate } from "react-router-dom";
import { paths } from "config";
import { FaPencilAlt } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";

const Businesses = () => {
  const { setBusiness, setConfig, setUser } = useContext(SiteContext);
  const [businesses, setBusinesses] = useState([]);
  const [addBusiness, setAddBusiness] = useState(false);
  const navigate = useNavigate();

  const { get: getBusinesses } = useFetch(endpoints.findBusinesses);
  const { post: logoutAndLogin } = useFetch(endpoints.adminSwitchAccount);

  useEffect(() => {
    getBusinesses()
      .then(({ data }) => {
        if (data.success) {
          setBusinesses(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Businesses</h2>
        <button className="btn m-a mr-0" onClick={() => setAddBusiness(true)}>
          Add Business
        </button>
      </div>
      <Table
        className={s.sales}
        columns={[
          { label: "Business" },
          { label: "Phone" },
          { label: "Plan" },
          { label: "Actions" },
        ]}
      >
        {businesses.map((item) => (
          <tr
            onClick={(e) => {
              if (["TR", "TD"].includes(e.target.nodeName)) {
                setBusiness({ business: item });
                setConfig(item.config);
              }
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td>{item.phone}</td>
            <td>{item.name}</td>
            <td>{item.subscription?.plan?.name}</td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FiLogIn style={{ fontSize: "1.15rem" }} />,
                  label: "Login as this Business",
                  callBack: () => {
                    Prompt({
                      type: "confirmation",
                      message:
                        "Are you sure you want to logout and login as this business?",
                      callback: () => {
                        logoutAndLogin({ phone: item.phone })
                          .then(({ data }) => {
                            if (data.success) {
                              setUser(data.data);
                              localStorage.setItem(
                                "userType",
                                data.data.userType
                              );
                              window.location =
                                paths.dashboard.replace("*", "") + paths.quotes;
                              return;
                            }
                            Prompt({ type: "error", message: data.message });
                          })
                          .catch((err) =>
                            Prompt({ type: "error", message: err.message })
                          );
                      },
                    });
                  },
                },
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  callBack: () => {
                    setAddBusiness(item);
                  },
                },
              ]}
            />
          </tr>
        ))}
      </Table>
      <Modal
        open={!!addBusiness}
        head
        label={`${addBusiness?._id ? "View / Update" : "Add"} Business`}
        className={s.addBusinessFormModal}
        setOpen={() => {
          setAddBusiness(null);
        }}
      >
        <BusinessForm
          edit={addBusiness?._id ? addBusiness : null}
          onSuccess={(newBusiness, next) => {
            if (addBusiness?._id) {
              setBusinesses((prev) =>
                prev.map((item) =>
                  item._id === newBusiness._id ? newBusiness : item
                )
              );
            } else {
              setBusinesses((prev) => [...prev, newBusiness]);
            }
            setAddBusiness(null);
            if (next) {
              setBusiness({ business: newBusiness });
              setConfig(newBusiness.config);
              navigate(
                paths.dashboard.replace("*", "") +
                  paths.settings.baseUrl.replace("*", "") +
                  paths.settings.businessInformation,
                { state: { next } }
              );
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default Businesses;
