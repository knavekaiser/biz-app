import { useState, useEffect, useRef } from "react";
import { moment, Moment, Table } from "Components/elements";
import { useFetch } from "hooks";
import s from "./receipts.module.scss";
import { useReactToPrint } from "react-to-print";
import { endpoints } from "config";

import PrintInvoice from "./printInvoice";

export default function Report({ report: { _id } }) {
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const [report, setReport] = useState({});

  const { get: genReport, loading } = useFetch(
    endpoints.generateReport + `/${_id}`
  );

  useEffect(() => {
    genReport().then(({ data }) => {
      if (data?.success) {
        setReport(data.data);
      }
    });
  }, []);

  return (
    <div className={`grid gap-1 p-1 ${s.addReceiptForm}`}>
      <div className={`grid wrap gap-1 ${s.receiptDetail}`}>
        <div className="flex gap-1 all-columns justify-end align-center">
          {/* <button className="btn" onClick={handlePrint}>
            Print
          </button> */}
        </div>
        <div>
          <h3>{report.name}</h3>
          <Table
            loading={loading}
            className={s.receipts}
            columns={report.columns?.map((col) => ({ label: col.label }))}
          >
            {report.data?.map((item) => {
              return null;
              return (
                <tr key={item._id}>
                  <td>{item.name}</td>
                </tr>
              );
            })}
          </Table>
        </div>
      </div>
    </div>
  );
}
