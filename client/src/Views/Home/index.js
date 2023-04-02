import { Checkbox } from "Components/elements";
import { Prompt } from "Components/modal";
import { Header, Footer } from "Components/ui";
import { endpoints } from "config";
import { useFetch } from "hooks";
import { useCallback, useEffect, useState } from "react";
import s from "./home.module.scss";
import { ProductThumb } from "./productThumbnail";

const Home = () => {
  const [filters, setFilters] = useState({
    categories: [],
    subCategories: [],
  });
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const { get: fetchStores, loading } = useFetch(endpoints.homeStores);
  const { get: getCategories } = useFetch(endpoints.homeCategories);

  const getStores = useCallback(() => {
    fetchStores({
      query: {
        ...(filters.categories?.length && { category: filters.categories }),
        ...(filters.subCategories?.length && {
          subCategory: filters.subCategories,
        }),
      },
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
          <ul className={s.categories}>
            {categories.map((cat) => (
              <li key={cat.name}>
                <Checkbox
                  label={cat.name}
                  checked={filters.categories.includes(cat.name)}
                  onChange={(e) => {
                    if (filters.categories.includes(cat.name)) {
                      setFilters((prev) => ({
                        ...prev,
                        categories: prev.categories.filter(
                          (i) => i !== cat.name
                        ),
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        categories: [...prev.categories, cat.name],
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
                          checked={filters.subCategories.includes(subCat.name)}
                          onChange={(e) => {
                            if (filters.subCategories.includes(subCat.name)) {
                              setFilters((prev) => ({
                                ...prev,
                                subCategories: prev.subCategories.filter(
                                  (i) => i !== subCat.name
                                ),
                              }));
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                subCategories: [
                                  ...prev.subCategories,
                                  subCat.name,
                                ],
                              }));
                            }
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
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
