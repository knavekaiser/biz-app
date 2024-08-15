import { useContext, useEffect, useState } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions } from "Components/elements";
import s from "./sales.module.scss";
import { Modal, Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { endpoints } from "config";
import { useNavigate } from "react-router-dom";
import { paths } from "config";
import { FaPencilAlt } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";

const Businesses = ({ setSidebarOpen }) => {
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
    <div className={`${s.content} grid gap-1 m-a`}>
      <div className={`flex ${s.head} align-center gap-1`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>Dashboard</h2>
        </div>
        <button
          className="btn clear iconOnly"
          onClick={() => setAddBusiness(true)}
        >
          <GoPlus />
        </button>
      </div>
      <div>
        <h2>Some Charts</h2>
      </div>
    </div>
  );
};

export default Businesses;
