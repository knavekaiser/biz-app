import { Checkbox } from "Components/elements";
import { Prompt } from "Components/modal";
import { Header, Footer } from "Components/ui";
import { endpoints } from "config";
import { useFetch } from "hooks";
import { useCallback, useEffect, useState } from "react";
import s from "./home.module.scss";
import { ProductThumb } from "./productThumbnail";

const Home = () => {
  const [filters, setFilters] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const { get: fetchStores, loading } = useFetch(endpoints.homeStores);
  const { get: getCategories } = useFetch(endpoints.homeCategories);

  const getStores = useCallback(() => {
    fetchStores({ query: filters.length ? { category: filters } : {} })
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
    <>
      <Header />
      <div className={s.landingPage}>
        <div className={s.sidebar}>
          <p>
            <strong>Categories</strong>
          </p>
          <ul>
            {categories.map((item) => (
              <Checkbox
                key={item}
                label={item}
                checked={filters.includes(item)}
                onChange={(e) => {
                  if (filters.includes(item)) {
                    setFilters((prev) => prev.filter((i) => i !== item));
                  } else {
                    setFilters((prev) => [...prev, item]);
                  }
                }}
              />
            ))}
          </ul>
        </div>
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

export default Home;
