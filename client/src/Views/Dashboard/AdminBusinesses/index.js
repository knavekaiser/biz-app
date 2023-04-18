import { useContext, useEffect, useState } from "react";
import { SiteContext } from "SiteContext";
import { Table } from "Components/elements";
import s from "./sales.module.scss";
import { Modal, Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { endpoints } from "config";
import BusinessForm from "./BusinessForm";

const Businesses = () => {
  const { setBusiness, setConfig } = useContext(SiteContext);
  const [businesses, setBusinesses] = useState([]);
  const [addBusiness, setAddBusiness] = useState(false);

  const { get: getBusinesses } = useFetch(endpoints.findBusinesses);

  useEffect(() => {
    getBusinesses()
      .then(({ data }) => {
        if (data.success) {
          setBusinesses(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Businesses</h2>
        <button className="btn m-a mr-0" onClick={() => setAddBusiness(true)}>
          Add Business
        </button>
      </div>
      <Table className={s.sales} columns={[{ label: "Business" }]}>
        {businesses.map((item) => (
          <tr
            onClick={() => {
              setBusiness({
                business: item,
              });
              setConfig(item.config);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td>{item.name}</td>
          </tr>
        ))}
      </Table>
      <Modal
        open={!!addBusiness}
        head
        label={`${addBusiness?._id ? "View / Update" : "Add"} Business`}
        className={s.addBusinessFormModal}
        setOpen={() => {
          setAddBusiness(null);
        }}
      >
        <BusinessForm
          edit={addBusiness?._id ? addBusiness : null}
          onSuccess={(newBusiness) => {
            if (addBusiness?._id) {
              setBusinesses((prev) =>
                prev.map((item) =>
                  item._id === newBusiness._id ? newBusiness : item
                )
              );
            } else {
              setBusinesses((prev) => [...prev, newBusiness]);
            }
            setAddBusiness(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Businesses;
