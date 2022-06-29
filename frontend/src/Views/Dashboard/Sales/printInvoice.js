import { useRef, forwardRef, useContext, useEffect, useState } from "react";
import { SiteContext } from "SiteContext";

import { Table, TableActions, moment } from "Components/elements";

import s from "./sales.module.scss";

const Detail = ({ label, value }) => {
  return (
    <p className={s.detail}>
      <span className={s.label}>{label}</span>:{" "}
      <span className={s.value}>{value}</span>
    </p>
  );
};

const PrintInvoice = forwardRef(({ sale, user }, ref) => {
  const { config } = useContext(SiteContext);
  const [itemsStyle, setItemsStyle] = useState(null);
  useEffect(() => {
    const itemColumnSort = ["no", "product", "qty", "unit", "total"];
    const columns = [
      ...config.print.itemColumns
        .sort((a, b) =>
          itemColumnSort.indexOf(a) > itemColumnSort.indexOf(b) ? 1 : -1
        )
        .filter((col) => !["no", "product"].includes(col)),
    ];
    setItemsStyle({
      gridTemplateColumns: `${
        config.print.itemColumns.includes("no") ? "3rem" : ""
      } ${
        config.print.itemColumns.includes("product")
          ? 42 - 6 * columns.length + "rem"
          : ""
      } repeat(auto-fit, minmax(86px, 1fr))`,
    });
  }, [sale]);
  return (
    <div className={s.print} ref={ref}>
      <header>
        {user.logo && <img className={s.logo} src={user.logo} />}
        <div>
          <h2>{user.name}</h2>
          {user.motto && <p>{user.motto}</p>}
        </div>
        <h4>Invoice</h4>
      </header>

      <div className={`${s.info} flex wrap gap-1 mt-1`}>
        <div className={`${s.box} flex-1`}>
          <p>To:</p>
          <Detail label="Name" value={sale.customer?.name} />
          <Detail
            label="Detail"
            value={
              sale.customer?.detail?.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {arr[i + 1] && <br />}
                </span>
              )) || null
            }
          />
        </div>
        <div className={`${s.box} flex-1`}>
          <Detail
            label="Inv No"
            value={`${sale.no} ${config.print?.invoiceNoSuffix || ""}`}
          />
          <Detail label="Date" value={moment(sale?.date, "DD-MM-YYYY")} />
          <Detail label="GSTIN" value={user.gstin} />
          <Detail label="PAN" value={user.pan} />
          {user.bankDetails && (
            <>
              <Detail label="Bank" value={user.bankDetails.bankName} />
              <Detail label="Branch" value={user.bankDetails.branch} />
              <Detail label="A/C No." value={user.bankDetails.accNo} />
            </>
          )}
          <Detail label="IFSC" value={user.ifsc} />
          <Detail label="Address" value={user.address} />
          <Detail label="Phone" value={user.phone} />
          <Detail label="Email" value={user.email} />
        </div>
      </div>

      {config.print.itemColumns.length > 0 && (
        <Table
          className={`${s.items} mt-1`}
          theadTrStyle={{ ...itemsStyle }}
          columns={config.print.itemColumns.map((key) => {
            if (key === "no") return { label: "No" };
            if (key === "product") return { label: "Product" };
            if (key === "price")
              return { label: "Price", className: "text-right" };
            if (key === "qty") return { label: "QTY", className: "text-right" };
            if (key === "unit") return { label: "Unit" };
            if (key === "total")
              return {
                label: `Total (${config.print.currency})`,
                className: "text-right",
              };
          })}
        >
          {sale.items.map((item, i) => (
            <tr key={i} style={{ ...itemsStyle }}>
              {config.print.itemColumns.includes("no") && <td>{i + 1}</td>}
              {config.print.itemColumns.includes("product") && (
                <td>
                  <span className="ellipsis">{item.name}</span>
                </td>
              )}
              {config.print.itemColumns.includes("price") && (
                <td className="text-right">
                  {item.price.fix(2, config.numberSeparator)}
                </td>
              )}
              {config.print.itemColumns.includes("qty") && (
                <td className="text-right">{item.qty}</td>
              )}
              {config.print.itemColumns.includes("unit") && (
                <td>{item.unit}</td>
              )}
              {config.print.itemColumns.includes("total") && (
                <td className="text-right">
                  {(item.price * item.qty).fix(2, config.numberSeparator)}
                </td>
              )}
            </tr>
          ))}
        </Table>
      )}

      {sale.gst && (
        <Table
          className={`${s.taxes} mt-1`}
          columns={[
            { label: "No." },
            { label: "Description of Tax" },
            { label: "Rate of Tax", className: "text-right" },
            {
              label: `Taxable Amount (${config.print.currency})`,
              className: "text-right",
            },
            {
              label: `Tax Amount (${config.print.currency})`,
              className: "text-right",
            },
          ]}
        >
          <tr>
            <td>1</td>
            <td>Integrated GST</td>
            <td className="text-right">
              {sale.gst.fix(2, config.numberSeparator)}
            </td>
            <td className="text-right">
              {sale.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .fix(2, config.numberSeparator)}
            </td>
            <td className="text-right">
              {sale.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .percent(sale.gst)
                .fix(2, config.numberSeparator)}
            </td>
          </tr>
        </Table>
      )}

      <div className={`${s.totalAmount} mt-1`}>
        <p className={s.word}>
          Total:{" "}
          {(
            sale.items.reduce((p, c) => p + c.qty * c.price, 0) +
            sale.items
              .reduce((p, c) => p + c.qty * c.price, 0)
              .percent(sale.gst || 0)
          ).toWords()}
        </p>
        <p className={s.digit}>
          {(
            sale.items.reduce((p, c) => p + c.qty * c.price, 0) +
            sale.items
              .reduce((p, c) => p + c.qty * c.price, 0)
              .percent(sale.gst || 0)
          ).fix(2, config.numberSeparator)}
        </p>
      </div>

      {(user.terms?.length || user.ownerDetails?.name) && (
        <footer className="flex gap-1 align-end mt-1">
          {user.terms?.length > 0 && (
            <div className={`${s.box} flex-1 mb-2`}>
              <strong>Terms & Conditions:</strong>{" "}
              <ol className={`ml-2 mt-1`}>
                {user.terms?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </div>
          )}
          {user.ownerDetails?.name && (
            <div className={s.sign}>
              <p>For {user.name}</p>
              {user.ownerDetails.signature && (
                <img
                  className={s.signature}
                  src={user.ownerDetails.signature}
                />
              )}
              <p>
                <strong>{user.ownerDetails.name}</strong>
              </p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
});

export default PrintInvoice;
