import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./receipts.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import ReceiptForm from "./ReceiptForm";

const Receipts = () => {
  const { config } = useContext(SiteContext);
  const [receipts, setReceipts] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [addReceipt, setAddReceipt] = useState(false);

  const { get: getReceipts, loading } = useFetch(endpoints.receipts);
  const { remove: deleteReceipt } = useFetch(endpoints.receipts + "/{ID}");

  useEffect(() => {
    getReceipts().then(({ data, error }) => {
      if (error) {
        return Prompt({
          type: "error",
          message: error.message || error,
        });
      }
      if (data.success) {
        return setReceipts(data.data);
      }
    });
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Receipts</h2>
        <button className="btn m-a mr-0" onClick={() => setAddReceipt(true)}>
          Add Receipt
        </button>
      </div>
      <Table
        loading={loading}
        className={s.receipts}
        columns={[
          { label: "No." },
          { label: "Date" },
          { label: "Customer" },
          { label: "Amount", className: "text-right" },
          { label: "Action" },
        ]}
      >
        {receipts.map((item) => (
          <tr
            onClick={() => {
              setReceipt(item);
              setAddReceipt(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className={s.no}>
              {item.no}
              {config?.print?.receiptNoSuffix || ""}
            </td>
            <td className={s.date}>
              <Moment format="DD/MM/YYYY">{item.date}</Moment>
            </td>
            <td className={s.customer}>{item.customer?.name}</td>
            <td className={`text-right ${s.net}`}>
              {item.amount.fix(2, config?.numberSeparator)}
            </td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "View",
                  callBack: () => {
                    setReceipt(item);
                    setAddReceipt(true);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this receipt?`,
                      callback: () => {
                        deleteReceipt(
                          {},
                          { params: { "{ID}": item._id } }
                        ).then(({ data }) => {
                          if (data.success) {
                            setReceipts((prev) =>
                              prev.filter((receipt) => receipt._id !== item._id)
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
        open={addReceipt}
        head
        label={`${receipt ? "View / Update" : "Add"} Receipt`}
        className={s.addReceiptFormModal}
        setOpen={() => {
          setReceipt(null);
          setAddReceipt(false);
        }}
      >
        <ReceiptForm
          edit={receipt}
          receipts={receipts}
          onSuccess={(newReceipt) => {
            if (receipt) {
              setReceipts((prev) =>
                prev.map((item) =>
                  item._id === newReceipt._id ? newReceipt : item
                )
              );
              setReceipt(null);
            } else {
              setReceipts((prev) => [...prev, newReceipt]);
            }
            setAddReceipt(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Receipts;
