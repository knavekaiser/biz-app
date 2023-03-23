import { Prompt } from "Components/modal";
import { Header, Footer } from "Components/ui";
import { endpoints } from "config";
import { useFetch } from "hooks";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import s from "./home.module.scss";

const Home = () => {
  const [stores, setStores] = useState([]);
  const { get: getStores, loading } = useFetch(endpoints.landingPageStores);

  useEffect(() => {
    getStores()
      .then(({ data }) => {
        if (data.success) {
          setStores(data.data);
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
        <div className={s.stores}>
          {stores.length ? (
            stores.map((store) => <Store key={store._id} store={store} />)
          ) : (
            <h2>No store added yet.</h2>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

const Store = ({ store }) => {
  return (
    <div className={`${s.store} ${store.featured ? s.featured : ""}`}>
      <h2>{store.name}</h2>
      {store.featured && store.products?.length > 0 ? (
        <div className={s.products}>
          {store.products.map((product) => (
            <div key={product._id}>
              <a
                href={
                  "http://" + store.business.domain + `/item/${product._id}`
                }
              >
                <img src={product.images[0]} />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <a href={"http://" + store.business.domain}>
          <img src={store.image} />
        </a>
      )}
    </div>
  );
};

export default Home;
