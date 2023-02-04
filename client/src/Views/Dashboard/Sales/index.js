import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./sales.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import SaleForm from "./SaleForm";

const Sales = () => {
  const { config, checkPermission } = useContext(SiteContext);
  const [sales, setSales] = useState([]);
  const [sale, setSale] = useState(null);
  const [addSale, setAddSale] = useState(false);

  const { get: getSales, loading } = useFetch(endpoints.invoices);
  const { remove: deleteSale } = useFetch(endpoints.invoices + "/{ID}");

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
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Sales</h2>
        {checkPermission("invoice_create") && (
          <button className="btn m-a mr-0" onClick={() => setAddSale(true)}>
            Add Sale
          </button>
        )}
      </div>
      <Table
        loading={loading}
        className={s.sales}
        columns={[
          { label: "No." },
          { label: "Date" },
          { label: "Customer" },
          { label: "Net Amount", className: "text-right" },
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
              <Moment format="DD/MM/YYYY">{item.date}</Moment>
            </td>
            <td className={s.customer}>{item.customer?.name}</td>
            <td className={`text-right ${s.net}`}>
              {(
                item.items.reduce((p, c) => p + c.qty * c.price, 0) +
                item.items
                  .reduce((p, c) => p + c.qty * c.price, 0)
                  .percent(item.gst)
              ).fix(2, config?.numberSeparator)}
            </td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "View",
                  callBack: () => {
                    setSale(item);
                    setAddSale(true);
                  },
                },
                ...(checkPermission("invoice_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        callBack: () =>
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
        label={`${sale ? "View / Update" : "Add"} Sale`}
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

export default Sales;
