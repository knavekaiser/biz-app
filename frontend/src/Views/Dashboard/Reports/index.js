import { useState, useEffect } from "react";
import { Table, TableActions } from "Components/elements";
import { FaRegEye } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./receipts.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import ReceiptForm from "./ReceiptForm";
import { BsList } from "react-icons/bs";

const Receipts = ({ setSidebarOpen }) => {
  const [receipts, setReceipts] = useState([]);
  const [report, setReport] = useState(null);
  const [addReceipt, setAddReceipt] = useState(false);

  const { get: getReceipts, loading } = useFetch(endpoints.reports);

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
          <h2>Reports</h2>
        </div>
      </div>
      <Table
        loading={loading}
        className={s.receipts}
        columns={[{ label: "Name" }, { label: "Action" }]}
      >
        {receipts.map((item) => (
          <tr style={{ cursor: "pointer" }} key={item._id}>
            <td>{item.name}</td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "View",
                  callBack: () => {
                    setReport(item);
                    setAddReceipt(true);
                  },
                },
              ]}
            />
          </tr>
        ))}
      </Table>
      <Modal
        open={addReceipt}
        head
        label={`Report`}
        className={s.addReceiptFormModal}
        setOpen={() => {
          setReport(null);
          setAddReceipt(false);
        }}
      >
        <ReceiptForm
          report={report}
          onSuccess={(newReceipt) => {
            if (report) {
              setReceipts((prev) =>
                prev.map((item) =>
                  item._id === newReceipt._id ? newReceipt : item
                )
              );
              setReport(null);
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
