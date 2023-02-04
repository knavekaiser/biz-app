import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./orders.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import OrderForm from "./OrderForm";

const Orders = () => {
  const { config, checkPermission } = useContext(SiteContext);
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [addOrder, setAddOrder] = useState(false);

  const { get: getOrders, loading } = useFetch(endpoints.orders);
  const { remove: deleteOrders } = useFetch(endpoints.orders + "/{ID}");

  useEffect(() => {
    getOrders()
      .then(({ data }) => {
        if (data.success) {
          return setOrders(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Orders</h2>
        {checkPermission("order_create") && (
          <button className="btn m-a mr-0" onClick={() => setAddOrder(true)}>
            Add Order
          </button>
        )}
      </div>
      <Table
        loading={loading}
        className={s.orders}
        columns={[
          { label: "Date" },
          { label: "Customer" },
          { label: "Net Amount", className: "text-right" },
          { label: "Action" },
        ]}
      >
        {orders.map((item) => (
          <tr
            onClick={() => {
              setOrder(item);
              setAddOrder(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className={s.date}>
              <Moment format="DD/MM/YYYY">{item.date}</Moment>
            </td>
            <td className={s.customer}>{item.customer?.name}</td>
            <td className={`text-right ${s.net}`}>
              {(
                item.items.reduce((p, c) => p + c.qty * c.price, 0) +
                item.items.reduce((p, c) => p + c.qty * c.price, 0)
              ).fix(2, config?.numberSeparator)}
            </td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "View",
                  callBack: () => {
                    setOrder(item);
                    setAddOrder(true);
                  },
                },
                ...(checkPermission("order_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        callBack: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this order?`,
                            callback: () => {
                              deleteOrders(
                                {},
                                { params: { "{ID}": item._id } }
                              ).then(({ data }) => {
                                if (data.success) {
                                  setOrders((prev) =>
                                    prev.filter(
                                      (order) => order._id !== item._id
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
        open={addOrder}
        head
        label={`${order ? "View / Update" : "Add"} Order`}
        className={s.addOrderFormModal}
        setOpen={() => {
          setOrder(null);
          setAddOrder(false);
        }}
      >
        <OrderForm
          edit={order}
          orders={orders}
          onSuccess={(newOrder) => {
            if (order) {
              setOrders((prev) =>
                prev.map((item) =>
                  item._id === newOrder._id ? newOrder : item
                )
              );
              setOrder(null);
            } else {
              setOrders((prev) => [...prev, newOrder]);
            }
            setAddOrder(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Orders;
