import { IoLogoWhatsapp } from "react-icons/io";
import s from "./productThumbnail.module.scss";

function toNormalCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(
      /\b(\w)(\w*)/g,
      (_, first, rest) => first.toUpperCase() + rest.toLowerCase()
    );
}

export const ProductThumb = ({ order, business, product }) => {
  return (
    <div className={`${s.productThumb}`}>
      <div className={s.thumbnailWrapper}>
        <a href={product.url || "http://" + business.domain}>
          <img src={product.image} />
        </a>
      </div>
      <div className={s.productDetail}>
        <a href={product.url || "http://" + business.domain}>
          <h4>{product.title}</h4>
        </a>
        {order?.map((item) => {
          if (item === "whatsappNumber") {
            return (
              <button
                style={{ width: "min-content" }}
                className={s.whatsappBtn}
                key={item}
                onClick={(e) => {
                  e.preventDefault();
                  const a = document.createElement("a");
                  a.href = `whatsapp://send/?${new URLSearchParams({
                    phone: product.whatsappNumber,
                    text: `I am interested to know more about this ${product.title}\n${window.location.origin}/item/${product._id}`,
                  }).toString()}`;
                  a.rel = "noreferrer";
                  a.target = "_blank";

                  document.querySelector("body").append(a);
                  a.click();
                  a.remove();
                }}
              >
                <IoLogoWhatsapp />
              </button>
            );
          }
          if (["string", "number"].includes(typeof product[item])) {
            if (item === "price") {
              return (
                <span className={s.price} key={item}>
                  <span className={s.currentPrice}>
                    {business?.siteConfig?.currency}{" "}
                    {product.price.toLocaleString()}
                  </span>

                  {product.originalPrice > product.price && (
                    <span className={s.originalPrice}>
                      {business?.siteConfig?.currency}{" "}
                      {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </span>
              );
            }
            return (
              <span className={s.description} key={item}>
                {product[item]}
              </span>
            );
          }
          if (Array.isArray(product[item]) && product[item].length) {
            return (
              <span className={s.description} key={item}>
                <strong>{toNormalCase(item)}:</strong>{" "}
                {product[item].join(", ")}
              </span>
            );
          }
          if (item === "seller" && product.seller) {
            return (
              <div className={s.productSeller} key={item}>
                <img src={product.seller.logo || product.seller.profileImg} />
                <span className={s.productSeller}>{product.seller.name}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
