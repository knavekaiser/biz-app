import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./receipts.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import ReceiptForm from "./ReceiptForm";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";

const Receipts = ({ setSidebarOpen }) => {
  const { config, checkPermission } = useContext(SiteContext);
  const [receipts, setReceipts] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [addReceipt, setAddReceipt] = useState(false);

  const { get: getReceipts, loading } = useFetch(endpoints.receipts);
  const { remove: deleteReceipt } = useFetch(endpoints.receipts + "/{ID}");

  useEffect(() => {
    getReceipts()
      .then(({ data }) => {
        if (data.success) {
          return setReceipts(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className={`flex ${s.head}`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>All Receipts</h2>
          {checkPermission("reciept_create") && (
            <button
              className="btn clear iconOnly"
              onClick={(e) => {
                e.stopPropagation();
                setAddReceipt(true);
              }}
            >
              <GoPlus />
            </button>
          )}
        </div>
      </div>
      <Table
        loading={loading}
        className={s.receipts}
        columns={[
          { label: "No." },
          { label: "Date" },
          { label: "Account" },
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
              <Moment format="DD/MM/YYYY">{item.dateTime}</Moment>
            </td>
            <td className={s.customer}>
              {item.accountingEntries?.[0]?.accountName}
            </td>
            <td className={`text-right ${s.net}`}>
              {item.amount.fix(2, config?.numberSeparator)}
            </td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "View",
                  onClick: () => {
                    setReceipt(item);
                    setAddReceipt(true);
                  },
                },
                ...(checkPermission("reciept_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        onClick: () =>
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
                                    prev.filter(
                                      (receipt) => receipt._id !== item._id
                                    )
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
