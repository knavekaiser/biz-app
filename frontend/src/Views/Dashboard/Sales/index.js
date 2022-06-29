import { useState, useEffect } from "react";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./sales.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import SaleForm from "./SaleForm";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [sale, setSale] = useState(null);
  const [addSale, setAddSale] = useState(false);

  const { get: getSales, loading } = useFetch(endpoints.invoices);
  const { remove: deleteSale } = useFetch(endpoints.invoices + "/{ID}");

  useEffect(() => {
    getSales().then(({ data }) => {
      if (data.success) {
        return setSales(data.data);
      }
    });
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Sales</h2>
        <button className="btn m-a mr-0" onClick={() => setAddSale(true)}>
          Add Sale
        </button>
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
          <tr key={item._id}>
            <td>{item.no}</td>
            <td>
              <Moment format="DD-MM-YYYY">{item.date}</Moment>
            </td>
            <td>{item.customer?.name}</td>
            <td className="text-right">
              {(
                item.items.reduce((p, c) => p + c.qty * c.price, 0) +
                item.items
                  .reduce((p, c) => p + c.qty * c.price, 0)
                  .percent(item.gst)
              ).toFixed(2)}
            </td>
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
                        deleteSale({}, { params: { "{ID}": item._id } }).then(
                          ({ data }) => {
                            if (data.success) {
                              setSales((prev) =>
                                prev.filter((sale) => sale._id !== item._id)
                              );
                            } else {
                              Prompt({ type: "error", message: data.message });
                            }
                          }
                        );
                      },
                    }),
                },
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
