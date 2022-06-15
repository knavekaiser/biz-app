import { Component } from "react";

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

class PrintInvoice extends Component {
  render() {
    const sale = this.props.sale;
    const user = this.props.user;

    return (
      <div className={s.print}>
        <header>
          {user.logo && <img className={s.logo} src={user.logo} />}
          <div>
            <h2>{user.name}</h2>
            {user.moto && <p>{user.moto}</p>}
          </div>
          <h4>Invoice</h4>
        </header>
        <div className={`${s.info} flex wrap gap-1`}>
          <div className={`${s.box} flex-1`}>
            <p>To:</p>
            <Detail label="Name" value={sale.customer?.name} />
            <Detail label="Detail" value={sale.customer?.detail} />
          </div>
          <div className={`${s.box} flex-1`}>
            <Detail
              label="Date"
              value={moment(sale?.date, "DD-MM-YYYY hh:mma")}
            />
            <Detail label="GSTIN" value={user.gstin} />
            <Detail label="PAN" value={user.pan} />
            {user.bankDetail && (
              <>
                <Detail label="Bank" value={user.bankDetail.bankName} />
                <Detail label="Branch" value={user.bankDetail.branch} />
                <Detail label="A/C No." value={user.bankDetail.accNo} />
              </>
            )}
            <Detail label="IFSC" value={user.ifsc} />
            <Detail label="No" value={sale.id} />
            <Detail label="Address" value={user.address} />
            <Detail label="Phone" value={user.phone} />
            <Detail label="Email" value={user.email} />
          </div>
        </div>
        <Table
          className={s.items}
          columns={[
            { label: "No." },
            { label: "Product" },
            { label: "Price" },
            { label: "QTY" },
            { label: "Unit" },
            { label: "Total (INR)" },
          ]}
        >
          {sale.items.map((item, i) => (
            <tr key={i}>
              <td>{i}</td>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td>{item.qty}</td>
              <td>{item.unit}</td>
              <td>{item.price * item.qty}/-</td>
            </tr>
          ))}
        </Table>

        <Table
          className={s.taxes}
          columns={[
            { label: "No." },
            { label: "Description of Tax" },
            { label: "Rate of Tax" },
            { label: "Taxable Amount (INR)" },
            { label: "Tax Amount (INR)" },
          ]}
        >
          <tr>
            <td>1</td>
            <td>Integrated GST</td>
            <td>{sale.gst}</td>
            <td>{sale.items.reduce((p, c) => p + c.qty * c.price, 0)}/-</td>
            <td>
              {sale.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .percent(sale.gst)}
              /-
            </td>
          </tr>
        </Table>

        <div className={s.totalAmount}>
          <p className={s.word}>
            Total:{" "}
            {(
              sale.items.reduce((p, c) => p + c.qty * c.price, 0) +
              sale.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .percent(sale.gst)
            ).toWords()}
          </p>
          <p className={s.digit}>
            {sale.items.reduce((p, c) => p + c.qty * c.price, 0) +
              sale.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .percent(sale.gst) +
              "/-"}
          </p>
        </div>

        <footer className="flex gap-1 align-end">
          {user.terms?.length > 0 && (
            <div className={`${s.box}  mb-2`}>
              <strong>Terms & Conditions:</strong>{" "}
              <ol className={`ml-2 mt-1`}>
                {user.terms?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </div>
          )}
          {user.owner && (
            <div className={s.sign}>
              <p>For {user.name}</p>
              {user.owner.signature && (
                <img className={s.signature} src={user.owner.signature} />
              )}
              <p>
                <strong>{user.owner.name}</strong>
              </p>
            </div>
          )}
        </footer>
      </div>
    );
  }
}

export default PrintInvoice;
