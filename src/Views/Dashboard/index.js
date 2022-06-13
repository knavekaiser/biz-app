import { useContext, useEffect, useState } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Table, TableActions, Moment } from "Components/elements";
import {
  FaRegEye,
  FaPencilAlt,
  FaRegTrashAlt,
  FaPowerOff,
} from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import SaleForm from "./SaleForm";

import s from "./dashboard.module.scss";

const Dashboard = () => {
  const { user, setUser } = useContext(SiteContext);
  const navigate = useNavigate();
  const [sales, setSales] = useState([
    {
      id: "12",
      date: "2022-06-13T12:54:00.244Z",
      gst: 10,
      items: [
        { id: 3521361, name: "Toothbrush", price: 40, qty: 10, unit: "PC" },
        { id: 54454, name: "Rice", price: 30, qty: 10, unit: "KG" },
      ],
    },
    {
      id: "13",
      date: "2022-06-13T12:56:12.074Z",
      gst: 8,
      items: [
        { id: 5247584, name: "Olive Oil", price: 50, qty: 20, unit: "LT" },
      ],
    },
  ]);
  const [sale, setSale] = useState(null);
  const [addSale, setAddSale] = useState(false);
  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, []);
  return (
    <div className={s.container}>
      <div className={s.header}>
        <h2>Dashboard</h2>
        <button
          className={`clear ${s.logoutBtn}`}
          title="Log out"
          onClick={() => {
            setUser(null);
          }}
        >
          <FaPowerOff />
        </button>
      </div>
      <div className={`${s.content} grid gap-1 m-a p-1`}>
        <div className="flex">
          <button className="btn m-a mr-0" onClick={() => setAddSale(true)}>
            Add Sale
          </button>
        </div>
        <Table
          columns={[
            { label: "Date" },
            { label: "Total Items" },
            { label: "Total Cost" },
            { label: "GST" },
            { label: "Action" },
          ]}
        >
          {sales.map((item) => (
            <tr key={item.id}>
              <td>
                <Moment format="DD-MM-YYYY hh:mma">{item.date}</Moment>
              </td>
              <td>{item.items.length}</td>
              <td>{item.items.reduce((p, c) => c.price * c.qty, 0)}</td>
              <td>{item.gst}</td>
              <TableActions
                actions={[
                  {
                    icon: <FaRegEye />,
                    label: "View",
                    callBack: () => {
                      setSale(item);
                      setAddSale(true);
                    },
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    callBack: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove this sale?`,
                        callback: () => {
                          setSales((prev) =>
                            prev.filter((sale) => sale.id !== item.id)
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
        open={addSale}
        head
        label={`${sale ? "View / Update" : "Add"} Sale`}
        setOpen={setAddSale}
      >
        <SaleForm
          edit={sale}
          onSuccess={(newSale) => {
            if (sale) {
              setSales((prev) =>
                prev.map((item) => (item.id === newSale.id ? newSale : item))
              );
              setSale(null);
            } else {
              setSales((prev) => [...prev, newSale]);
            }
            setAddSale(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
