import { useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table } from "Components/elements";
import s from "./sales.module.scss";

const Businesses = () => {
  const { user, setBusiness, setConfig } = useContext(SiteContext);

  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Businesses</h2>
      </div>
      <Table
        className={s.sales}
        columns={[{ label: "Business" }, { label: "Phone" }, { label: "Role" }]}
      >
        {user.businesses.map((item) => (
          <tr
            onClick={() => {
              setBusiness({
                business: item.business,
                permissions: [
                  ...(item?.roles.map((item) => item.permissions) || []),
                ].flat(),
              });
              setConfig(item.config);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td>{item.business.name}</td>
            <td>{item.business.phone}</td>
            <td>
              {item.roles.map((role) => (
                <p key={role._id}>{role.name}</p>
              ))}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default Businesses;
