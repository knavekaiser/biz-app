import { forwardRef, useContext, useEffect, useState } from "react";
import { SiteContext } from "SiteContext";

import { Table, moment } from "Components/elements";

import s from "./quotes.module.scss";

const Detail = ({ label, value }) => {
  return (
    <p className={s.detail}>
      <span className={s.label}>{label}</span>:{" "}
      <span className={s.value}>{value}</span>
    </p>
  );
};

const PrintInvoice = forwardRef(({ quote, user }, ref) => {
  const { config } = useContext(SiteContext);
  const [itemsStyle, setItemsStyle] = useState(null);
  useEffect(() => {
    if (config?.printQuote) {
      const itemColumnSort = ["no", "product", "qty", "unit", "total"];
      const columns = [
        ...config.printQuote.itemColumns
          .sort((a, b) =>
            itemColumnSort.indexOf(a) > itemColumnSort.indexOf(b) ? 1 : -1
          )
          .filter((col) => !["no", "product"].includes(col)),
      ];
      setItemsStyle({
        gridTemplateColumns: `${
          config.printQuote.itemColumns.includes("no") ? "3rem" : ""
        } ${
          config.printQuote.itemColumns.includes("product")
            ? 42 - 6 * columns.length + "rem"
            : ""
        } repeat(auto-fit, minmax(86px, 1fr))`,
      });
    }
  }, [quote]);

  if (!config?.printQuote) {
    return (
      <div className={s.print} ref={ref}>
        <p>Please update print configuration in the settings.</p>
      </div>
    );
  }
  return (
    <div className={s.print} ref={ref}>
      <header>
        {user.logo && <img className={s.logo} src={user.logo} />}
        <div>
          <h2>{user.name}</h2>
          {user.motto && <p>{user.motto}</p>}
        </div>
        <h4>Quote</h4>
      </header>

      <div className={`${s.info} flex wrap gap-1 mt-1`}>
        <div className={`${s.box} flex-1`}>
          <p>To:</p>
          <Detail label="Name" value={quote.customer?.name} />
          <Detail
            label="Detail"
            value={
              quote.customer?.detail?.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {arr[i + 1] && <br />}
                </span>
              )) || null
            }
          />
        </div>
        <div className={`${s.box} flex-1`}>
          <Detail label="Date" value={moment(quote?.date, "DD-MM-YYYY")} />
          {config.printQuote.businessInfo.includes("gstin") && (
            <Detail label="GSTIN" value={user.gstin} />
          )}
          {config.printQuote.businessInfo.includes("pan") && (
            <Detail label="PAN" value={user.pan} />
          )}
          {user.bankDetails && (
            <>
              {config.printQuote.businessInfo.includes("bank") && (
                <Detail label="Bank" value={user.bankDetails.bankName} />
              )}
              {config.printQuote.businessInfo.includes("branch") && (
                <Detail label="Branch" value={user.bankDetails.branch} />
              )}
              {config.printQuote.businessInfo.includes("accountNumber") && (
                <Detail label="A/C No." value={user.bankDetails.accNo} />
              )}
            </>
          )}
          {config.printQuote.businessInfo.includes("ifsc") && (
            <Detail label="IFSC" value={user.ifsc} />
          )}
          {config.printQuote.businessInfo.includes("address") && (
            <Detail label="Address" value={`${user.address?.street || ""}`} />
          )}
          {config.printQuote.businessInfo.includes("phone") && (
            <Detail label="Phone" value={user.phone} />
          )}
          {config.printQuote.businessInfo.includes("email") && (
            <Detail label="Email" value={user.email} />
          )}
        </div>
      </div>

      {config.printQuote.itemColumns.length > 0 && (
        <Table
          className={`${s.items} mt-1`}
          theadTrStyle={{ ...itemsStyle }}
          columns={config.printQuote.itemColumns.map((key) => {
            if (key === "no") return { label: "No" };
            if (key === "product") return { label: "Product" };
            if (key === "price")
              return { label: "Price", className: "text-right" };
            if (key === "qty") return { label: "QTY", className: "text-right" };
            if (key === "unit") return { label: "Unit" };
            if (key === "total")
              return {
                label: `Total (${config.printQuote.currency})`,
                className: "text-right",
              };
          })}
        >
          {quote.items.map((item, i) => (
            <tr key={i} style={{ ...itemsStyle }}>
              {config.printQuote.itemColumns.includes("no") && <td>{i + 1}</td>}
              {config.printQuote.itemColumns.includes("product") && (
                <td>
                  <span className="ellipsis">{item.name}</span>
                </td>
              )}
              {config.printQuote.itemColumns.includes("price") && (
                <td className="text-right">
                  {item.price.fix(2, config?.numberSeparator)}
                </td>
              )}
              {config.printQuote.itemColumns.includes("qty") && (
                <td className="text-right">{item.qty}</td>
              )}
              {config.printQuote.itemColumns.includes("unit") && (
                <td>{item.unit}</td>
              )}
              {config.printQuote.itemColumns.includes("total") && (
                <td className="text-right">
                  {(item.price * item.qty).fix(2, config?.numberSeparator)}
                </td>
              )}
            </tr>
          ))}
        </Table>
      )}

      {quote.gst && (
        <Table
          className={`${s.taxes} mt-1`}
          columns={[
            { label: "No." },
            { label: "Description of Tax" },
            { label: "Rate of Tax", className: "text-right" },
            {
              label: `Taxable Amount (${config.printQuote.currency})`,
              className: "text-right",
            },
            {
              label: `Tax Amount (${config.printQuote.currency})`,
              className: "text-right",
            },
          ]}
        >
          <tr>
            <td>1</td>
            <td>Integrated GST</td>
            <td className="text-right">
              {quote.gst.fix(2, config?.numberSeparator)}
            </td>
            <td className="text-right">
              {quote.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .fix(2, config?.numberSeparator)}
            </td>
            <td className="text-right">
              {quote.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .percent(quote.gst)
                .fix(2, config?.numberSeparator)}
            </td>
          </tr>
        </Table>
      )}

      <div className={`${s.totalAmount} mt-1`}>
        <p className={s.word}>
          Total:{" "}
          {quote.items.reduce((p, c) => p + c.qty * c.price, 0).toWords()}
        </p>
        <p className={s.digit}>
          {(
            quote.items.reduce((p, c) => p + c.qty * c.price, 0) +
            quote.items
              .reduce((p, c) => p + c.qty * c.price, 0)
              .percent(quote.gst || 0)
          ).fix(2, config?.numberSeparator)}
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
