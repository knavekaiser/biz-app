import { useContext, useEffect, useState } from "react";
import { SiteContext } from "SiteContext";
import { Table } from "Components/elements";
import s from "./sales.module.scss";
import { Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { endpoints } from "config";

const Businesses = () => {
  const { setBusiness, setConfig } = useContext(SiteContext);
  const [businesses, setBusinesses] = useState([]);

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
    </div>
  );
};

export default Businesses;
