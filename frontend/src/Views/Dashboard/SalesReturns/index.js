import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./sales.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import SaleForm from "./SaleForm";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";

const Invoices = ({ setSidebarOpen }) => {
  const { config, checkPermission } = useContext(SiteContext);
  const [sales, setSales] = useState([]);
  const [sale, setSale] = useState(null);
  const [addSale, setAddSale] = useState(false);

  const { get: getSales, loading } = useFetch(endpoints.salesReturns);
  const { remove: deleteSale } = useFetch(endpoints.salesReturns + "/{ID}");

  useEffect(() => {
    getSales()
      .then(({ data }) => {
        if (data.success) {
          return setSales(data.data);
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
          <h2>All Sales Returns</h2>
          {checkPermission("invoice_create") && (
            <button
              className="btn clear iconOnly"
              onClick={(e) => {
                e.stopPropagation();
                setAddSale(true);
              }}
            >
              <GoPlus />
            </button>
          )}
        </div>
      </div>
      <Table
        loading={loading}
        className={s.sales}
        columns={[
          { label: "No." },
          { label: "Date" },
          { label: "Account" },
          { label: "Status" },
          { label: "Net Amount", className: "text-right" },
          { label: "Due", className: "text-right" },
          { label: "Action" },
        ]}
      >
        {sales.map((item) => (
          <tr
            onClick={() => {
              setSale(item);
              setAddSale(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className={s.no}>
              {item.no}
              {config?.print?.invoiceNoSuffix || ""}
            </td>
            <td className={s.date}>
              <Moment format="DD/MM/YYYY">{item.dateTime}</Moment>
            </td>
            <td className={s.customer}>
              {item.accountingEntries?.[0]?.accountName}
            </td>
            <td>{item.status}</td>
            <td className={`text-right ${s.net}`}>
              {(
                item.items.reduce((p, c) => p + c.qty * c.price, 0) +
                item.items
                  .reduce((p, c) => p + c.qty * c.price, 0)
                  .percent(item.gst)
              ).fix(2, config?.numberSeparator)}
            </td>
            <td className={`text-right ${s.net}`}>
              {(item.due || 0).fix(2, config?.numberSeparator)}
            </td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "View",
                  onClick: () => {
                    setSale(item);
                    setAddSale(true);
                  },
                },
                ...(checkPermission("invoice_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        onClick: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this sale?`,
                            callback: () => {
                              deleteSale(
                                {},
                                { params: { "{ID}": item._id } }
                              ).then(({ data }) => {
                                if (data.success) {
                                  setSales((prev) =>
                                    prev.filter((sale) => sale._id !== item._id)
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
        open={addSale}
        head
        label={`${sale ? "View / Update" : "Add"} Sales Return`}
        className={s.addSaleFormModal}
        setOpen={() => {
          setSale(null);
          setAddSale(false);
        }}
      >
        <SaleForm
          edit={sale}
          sales={sales}
          onSuccess={(newSale) => {
            if (sale) {
              setSales((prev) =>
                prev.map((item) => (item._id === newSale._id ? newSale : item))
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

export default Invoices;
