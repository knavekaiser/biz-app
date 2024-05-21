import { Checkbox } from "Components/elements";
import { Prompt } from "Components/modal";
import { Header, Footer } from "Components/ui";
import { endpoints } from "config";
import { useFetch } from "hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import s from "./home.module.scss";
import { ProductThumb } from "./productThumbnail";
import { BsArrowLeft } from "react-icons/bs";
import { FiChevronRight } from "react-icons/fi";
import { BiFilterAlt } from "react-icons/bi";
import Filters from "./Filter";

const Home = () => {
  const [filters, setFilters] = useState({});
  const [config, setConfig] = useState(null);
  const [stores, setStores] = useState([]);

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
      <Header home filters={filters} setFilters={setFilters} />
      <div className={s.landingPage}>
        <Sidebar filters={filters} config={config} setFilters={setFilters} />
        <div className={s.allProducts}>
          {stores.length === 0 && (
            <p className="all-columns text-center p-2">Nothing for now.</p>
          )}
          {stores.map((item) =>
            item.featured ? (
              <div
                key={item._id}
                className={`${s.store} ${item.featured ? s.featured : ""}`}
              >
                <h2>{item.business.name}</h2>
                <div className={s.products}>
                  {item.products.map((product) => (
                    <ProductThumb
                      order={item.order}
                      business={item.business}
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>
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
  const mobile = useRef(window.innerWidth <= 480 ? true : false);
  const [showSidebar, setShowSidebar] = useState(mobile.current ? false : true);
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

  if (!showSidebar) {
    return (
      <div className={`${s.sidebar} flex justify-end`}>
        <button
          className={`${s.filterBtn} btn clear`}
          onClick={() => setShowSidebar(true)}
        >
          <BiFilterAlt />
        </button>
      </div>
    );
  }

  return (
    <div className={s.sidebar}>
      {schema &&
      config?.sidebarFilters?.find(
        (item) =>
          item.category === filters.category &&
          item.subcategory === filters.subcategory
      )?.filters?.length > 0 ? (
        <div
          className={`flex align-center gap_5 ${
            mobile.current ? "justify-space-between" : ""
          } pointer wrap`}
          onClick={() => {
            setSchema(null);
            setFilters((prev) => ({
              category: prev.category,
              subcategory: undefined,
            }));
          }}
        >
          <BsArrowLeft style={{ fontSize: "1.3em" }} />{" "}
          <div className="flex align-center gap_5">
            <p className="flex align-center gap_5">
              {filters.category} <FiChevronRight /> {filters.subcategory}
            </p>
          </div>
          <button
            className={`${s.filterBtn} btn clear`}
            onClick={() => setShowSidebar(false)}
          >
            <BiFilterAlt />
          </button>
          <Filters
            filters={filters}
            setFilters={setFilters}
            schema={schema}
            fields={
              config?.sidebarFilters?.find(
                (item) =>
                  item.category === filters.category &&
                  item.subcategory === filters.subcategory
              )?.filters || []
            }
          />
        </div>
      ) : (
        <>
          <div className="flex align-center justify-space-between gap_5 pb-1">
            <p>
              <strong>Categories</strong>
            </p>
            {mobile.current && (
              <button
                className={`${s.filterBtn} btn clear`}
                onClick={() => setShowSidebar(false)}
              >
                <BiFilterAlt />
              </button>
            )}
          </div>
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
                {cat.subcategories?.length > 0 && (
                  <ul className={s.subcategories}>
                    {cat.subcategories.map((subCat) => (
                      <li key={subCat.name}>
                        <Checkbox
                          label={subCat.name}
                          checked={filters.subcategory === subCat.name}
                          onChange={(e) => {
                            if (filters.subcategory === subCat.name) {
                              setFilters((prev) => ({
                                ...prev,
                                subcategory: undefined,
                              }));
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                category: cat.name,
                                subcategory: subCat.name,
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
