import { useEffect, useState } from "react";
import { Table } from "Components/elements";
import s from "./store.module.scss";
import { endpoints } from "config";
import { Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { paths } from "config";
import { useNavigate } from "react-router-dom";

const Stores = () => {
  const [businesses, setBusinesses] = useState([]);
  const { get: getBusinesses, loading } = useFetch(endpoints.findBusinesses);
  const navigate = useNavigate();

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
      <Table
        loading={loading}
        className={s.sales}
        columns={[{ label: "Name" }]}
      >
        {businesses.map((item) => (
          <tr
            style={{ cursor: "pointer" }}
            key={item._id}
            onClick={() => navigate(item._id + "/listings")}
          >
            <td>{item.name}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default Stores;
