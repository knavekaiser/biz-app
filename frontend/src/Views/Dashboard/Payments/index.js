import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./payments.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import PaymentForm from "./PaymentForm";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";

const Payments = ({ setSidebarOpen }) => {
  const { config, checkPermission } = useContext(SiteContext);
  const [payments, setPayments] = useState([]);
  const [payment, setPayment] = useState(null);
  const [addPayment, setAddPayment] = useState(false);

  const { get: getPayments, loading } = useFetch(endpoints.payments);
  const { remove: deletePayment } = useFetch(endpoints.payments + "/{ID}");

  useEffect(() => {
    getPayments()
      .then(({ data }) => {
        if (data.success) {
          return setPayments(data.data);
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
          <h2>All Payments</h2>
          {checkPermission("payment_create") && (
            <button
              className="btn clear iconOnly"
              onClick={(e) => {
                e.stopPropagation();
                setAddPayment(true);
              }}
            >
              <GoPlus />
            </button>
          )}
        </div>
      </div>
      <Table
        loading={loading}
        className={s.payments}
        columns={[
          { label: "No." },
          { label: "Date" },
          { label: "Account" },
          { label: "Amount", className: "text-right" },
          { label: "Action" },
        ]}
      >
        {payments.map((item) => (
          <tr
            onClick={() => {
              setPayment(item);
              setAddPayment(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className={s.no}>
              {item.no}
              {config?.print?.paymentNoSuffix || ""}
            </td>
            <td className={s.date}>
              <Moment format="DD/MM/YYYY">{item.date}</Moment>
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
                    setPayment(item);
                    setAddPayment(true);
                  },
                },
                ...(checkPermission("payment_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        onClick: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this payment?`,
                            callback: () => {
                              deletePayment(
                                {},
                                { params: { "{ID}": item._id } }
                              ).then(({ data }) => {
                                if (data.success) {
                                  setPayments((prev) =>
                                    prev.filter(
                                      (payment) => payment._id !== item._id
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
        open={addPayment}
        head
        label={`${payment ? "View / Update" : "Add"} Payment`}
        className={s.addPaymentFormModal}
        setOpen={() => {
          setPayment(null);
          setAddPayment(false);
        }}
      >
        <PaymentForm
          edit={payment}
          payments={payments}
          onSuccess={(newPayment) => {
            if (payment) {
              setPayments((prev) =>
                prev.map((item) =>
                  item._id === newPayment._id ? newPayment : item
                )
              );
              setPayment(null);
            } else {
              setPayments((prev) => [...prev, newPayment]);
            }
            setAddPayment(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Payments;
