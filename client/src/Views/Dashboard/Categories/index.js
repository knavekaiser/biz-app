import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions } from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./categories.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import CategoryForm from "./CategoryForm";

const Categories = () => {
  const { checkPermission } = useContext(SiteContext);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [addCategory, setAddCategory] = useState(false);

  const { get: getCategories, loading } = useFetch(endpoints.categories);
  const { remove: deleteCategories } = useFetch(endpoints.categories + "/{ID}");

  useEffect(() => {
    getCategories()
      .then(({ data }) => {
        if (data.success) {
          return setCategories(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Categories</h2>
        {checkPermission("category_create") && (
          <button className="btn m-a mr-0" onClick={() => setAddCategory(true)}>
            Add Category
          </button>
        )}
      </div>
      <Table
        loading={loading}
        className={s.categories}
        columns={[{ label: "Name" }, { label: "Action" }]}
      >
        {categories.map((item) => (
          <tr
            onClick={() => {
              setCategory(item);
              setAddCategory(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td>{item.name}</td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  callBack: () => {
                    setCategory(item);
                    setAddCategory(true);
                  },
                },
                ...(checkPermission("category_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        callBack: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this category?`,
                            callback: () => {
                              deleteCategories(
                                {},
                                { params: { "{ID}": item._id } }
                              ).then(({ data }) => {
                                if (data.success) {
                                  setCategories((prev) =>
                                    prev.filter(
                                      (category) => category._id !== item._id
                                    )
                                  );
                                } else {
                                  Prompt({
                                    type: "error",
                                    message: data.message,
                                  });
                                }
                              });
                            },
                          }),
                      },
                    ]
                  : []),
              ]}
            />
          </tr>
        ))}
      </Table>
      <Modal
        open={addCategory}
        head
        label={`${category ? "View / Update" : "Add"} Category`}
        className={s.addCategoryFormModal}
        setOpen={() => {
          setCategory(null);
          setAddCategory(false);
        }}
      >
        <CategoryForm
          edit={category}
          onSuccess={(newCat) => {
            if (category) {
              setCategories((prev) =>
                prev.map((item) => (item._id === newCat._id ? newCat : item))
              );
              setCategory(null);
            } else {
              setCategories((prev) => [...prev, newCat]);
            }
            setAddCategory(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Categories;
