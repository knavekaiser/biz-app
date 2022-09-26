import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./purchases.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import PurchaseForm from "./PurchaseForm";

const Purchases = () => {
  const { config } = useContext(SiteContext);
  const [purchases, setPurchases] = useState([]);
  const [purchase, setPurchase] = useState(null);
  const [addPurchase, setAddPurchase] = useState(false);

  const { get: getPurchases, loading } = useFetch(endpoints.purchases);
  const { remove: deletePurchase } = useFetch(endpoints.purchases + "/{ID}");

  useEffect(() => {
    getPurchases()
      .then(({ data }) => {
        if (data.success) {
          return setPurchases(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Purchases</h2>
        <button className="btn m-a mr-0" onClick={() => setAddPurchase(true)}>
          Add Purchase
        </button>
      </div>
      <Table
        loading={loading}
        className={s.purchases}
        columns={[
          { label: "No." },
          { label: "Date" },
          { label: "Customer" },
          { label: "Net Amount", className: "text-right" },
          { label: "Action" },
        ]}
      >
        {purchases.map((item) => (
          <tr
            onClick={() => {
              setPurchase(item);
              setAddPurchase(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className={s.no}>
              {item.no}
              {config?.print?.purchaseNoSuffix || ""}
            </td>
            <td className={s.date}>
              <Moment format="DD/MM/YYYY">{item.date}</Moment>
            </td>
            <td className={s.vendor}>{item.vendor?.name}</td>
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
                    setPurchase(item);
                    setAddPurchase(true);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this purchase?`,
                      callback: () => {
                        deletePurchase(
                          {},
                          { params: { "{ID}": item._id } }
                        ).then(({ data }) => {
                          if (data.success) {
                            setPurchases((prev) =>
                              prev.filter(
                                (purchase) => purchase._id !== item._id
                              )
                            );
                          } else {
                            Prompt({ type: "error", message: data.message });
                          }
                        });
                      },
                    }),
                },
              ]}
            />
          </tr>
        ))}
      </Table>
      <Modal
        open={addPurchase}
        head
        label={`${purchase ? "View / Update" : "Add"} Purchase`}
        className={s.addPurchaseFormModal}
        setOpen={() => {
          setPurchase(null);
          setAddPurchase(false);
        }}
      >
        <PurchaseForm
          edit={purchase}
          purchases={purchases}
          onSuccess={(newPurchase) => {
            if (purchase) {
              setPurchases((prev) =>
                prev.map((item) =>
                  item._id === newPurchase._id ? newPurchase : item
                )
              );
              setPurchase(null);
            } else {
              setPurchases((prev) => [...prev, newPurchase]);
            }
            setAddPurchase(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Purchases;
