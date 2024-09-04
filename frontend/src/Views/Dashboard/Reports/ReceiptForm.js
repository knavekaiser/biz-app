import { useState, useEffect, useRef } from "react";
import { Input, moment, Moment, Table } from "Components/elements";
import { useFetch } from "hooks";
import s from "./receipts.module.scss";
import { useReactToPrint } from "react-to-print";
import { endpoints } from "config";

import PrintInvoice from "./printInvoice";
import { useForm } from "react-hook-form";
import { BsX } from "react-icons/bs";

export default function Report({ report: { _id } }) {
  const { register, watch, setValue } = useForm();
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const [report, setReport] = useState({});

  const { get: genReport, loading } = useFetch(
    endpoints.generateReport + `/${_id}`
  );

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    const query = {};
    if (startDate && endDate) {
      query.startDate = startDate;
      query.endDate = endDate;
    }
    genReport({ query }).then(({ data }) => {
      if (data?.success) {
        setReport(data.data);
      }
    });
  }, [startDate, endDate]);

  return (
    <div className={`grid gap-1 p-1 ${s.addReceiptForm}`}>
      <div className={`grid wrap gap-1 ${s.receiptDetail}`}>
        {/* <div className="flex gap-1 all-columns justify-end align-center">
          <button className="btn" onClick={handlePrint}>
            Print
          </button>
        </div> */}
        <div>
          <div className="flex gap-1 align-center">
            <h2>{report.name}</h2>
            <div className="flex gap-1 m-a mr-0 align-end">
              <Input
                label="Start Date"
                type="date"
                {...register("startDate")}
              />
              <Input label="End Date" type="date" {...register("endDate")} />
              <button
                className="btn clear iconOnly"
                onClick={() => {
                  setValue("startDate", "");
                  setValue("endDate", "");
                }}
              >
                <BsX />
              </button>
            </div>
          </div>
          <Table
            loading={loading}
            className={s.receipts}
            columns={report.columns?.map((col) => ({ label: col.label }))}
          >
            {report.records?.map((rec, i) => {
              return (
                <tr key={i}>
                  {report.columns.map((col, i) => {
                    let data = rec[col.label];
                    if (Array.isArray(data)) {
                      data = data.length;
                    } else if (data === null) {
                      data = (
                        <span>
                          <i>NULL</i>
                        </span>
                      );
                    } else if (typeof data === "object") {
                      data = JSON.stringify(data);
                    } else if (data && col.dataType === "date") {
                      data = <Moment format="DD MMM YY hh:mma">{data}</Moment>;
                    } else if (!data) {
                      data = "--";
                    }
                    return <td key={i}>{data}</td>;
                  })}
                </tr>
              );
            })}
          </Table>
        </div>
      </div>
    </div>
  );
}
