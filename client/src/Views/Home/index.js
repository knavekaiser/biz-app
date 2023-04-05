import { Checkbox } from "Components/elements";
import { Prompt } from "Components/modal";
import { Header, Footer } from "Components/ui";
import { endpoints } from "config";
import { useFetch } from "hooks";
import { useCallback, useEffect, useState } from "react";
import s from "./home.module.scss";
import { ProductThumb } from "./productThumbnail";
import { BsArrowLeft } from "react-icons/bs";
import { FiChevronRight } from "react-icons/fi";
import Filters from "./Filter";

const Home = () => {
  const [filters, setFilters] = useState({});
  const [config, setConfig] = useState(null);
  const [stores, setStores] = useState([]);

  // console.log(filters);

  const { get: fetchStores, loading } = useFetch(endpoints.homeStores);
  const { get: getConfig } = useFetch(endpoints.homeConfig);

  const getStores = useCallback(() => {
    fetchStores({
      query: filters,
    })
      .then(({ data }) => {
        if (data.success) {
          setStores(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, [filters]);

  useEffect(() => {
    getStores();
  }, [filters]);

  useEffect(() => {
    getConfig()
      .then(({ data }) => {
        if (data.success) {
          setConfig(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <>
      <Header />
      <div className={s.landingPage}>
        <Sidebar filters={filters} config={config} setFilters={setFilters} />
        <div className={s.allProducts}>
          {stores.map((item) =>
            item.featured ? (
              <div
                key={item._id}
                className={`${s.store} ${item.featured ? s.featured : ""}`}
              >
                <h2>{item.business.name}</h2>
                {item.products.map((product) => (
                  <ProductThumb
                    order={item.order}
                    business={item.business}
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <ProductThumb
                order={item.order}
                business={item.business}
                key={item._id}
                product={item.products[0]}
              />
            )
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

const Sidebar = ({ filters, setFilters, config }) => {
  const [schema, setSchema] = useState(null);
  const [categories, setCategories] = useState([]);

  const { get: getCategories } = useFetch(endpoints.homeCategories);

  useEffect(() => {
    getCategories()
      .then(({ data }) => {
        if (data.success) {
          setCategories(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <div className={s.sidebar}>
      {schema &&
      config?.sidebarFilters?.find(
        (item) =>
          item.category === filters.category &&
          item.subCategory === filters.subCategory
      )?.filters?.length > 0 ? (
        <div
          className="flex align-center gap_5 pointer wrap"
          onClick={() => {
            setSchema(null);
            setFilters((prev) => ({
              category: prev.category,
              subCategory: undefined,
            }));
          }}
        >
          <BsArrowLeft style={{ fontSize: "1.3em" }} />{" "}
          <p className="flex align-center gap_5">
            {filters.category} <FiChevronRight /> {filters.subCategory}
          </p>
          <Filters
            filters={filters}
            setFilters={setFilters}
            schema={schema}
            fields={
              config?.sidebarFilters?.find(
                (item) =>
                  item.category === filters.category &&
                  item.subCategory === filters.subCategory
              )?.filters || []
            }
          />
        </div>
      ) : (
        <>
          <p>
            <strong>Categories</strong>
          </p>
          <ul className={s.categories}>
            {categories.map((cat) => (
              <li key={cat.name}>
                <Checkbox
                  label={cat.name}
                  checked={filters.category === cat.name}
                  onChange={(e) => {
                    if (filters.category === cat.name) {
                      setFilters((prev) => ({
                        ...prev,
                        category: undefined,
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        category: cat.name,
                      }));
                    }
                  }}
                />
                {cat.subCategories?.length > 0 && (
                  <ul className={s.subCategories}>
                    {cat.subCategories.map((subCat) => (
                      <li label={subCat.name}>
                        <Checkbox
                          label={subCat.name}
                          checked={filters.subCategory === subCat.name}
                          onChange={(e) => {
                            if (filters.subCategory === subCat.name) {
                              setFilters((prev) => ({
                                ...prev,
                                subCategory: undefined,
                              }));
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                category: cat.name,
                                subCategory: subCat.name,
                              }));
                            }
                            setSchema(e.target.checked ? subCat.fields : null);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Home;
