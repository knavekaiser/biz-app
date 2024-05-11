import { useContext } from "react";
import { SiteContext } from "SiteContext";
import { FiChevronDown } from "react-icons/fi";
import { ImStarEmpty, ImStarFull } from "react-icons/im";
import { IoLogoWhatsapp } from "react-icons/io";
import s from "./productThumbnail.module.scss";
import { Link } from "react-router-dom";

export const ProductThumb = ({ product }) => {
  const { business, config, user } = useContext(SiteContext);
  const siteConfig =
    business?.business?.config?.siteConfig || config?.siteConfig;
  const domain = business?.business?.domain || user?.domain;
  // console.log("domain", domain);
  return (
    <div className={`${s.productThumb}`}>
      <a target="_blank" href={`http://${domain}/item/${product._id}`}>
        <div className={s.thumbnailWrapper}>
          <img src={product.images[0]} alt={product.title} />
        </div>
        <div className={s.productDetail}>
          <h4>{product.title}</h4>
          {siteConfig?.productCard?.map((item) => {
            if (item === "whatsappNumber") {
              return null;
            }
            if (["string", "number"].includes(typeof product[item])) {
              if (item === "price") {
                return (
                  <span className={s.price} key={item}>
                    <span className={s.currentPrice}>
                      {siteConfig?.currency} {product.price.toLocaleString()}
                    </span>

                    {product.originalPrice > product.price && (
                      <span className={s.originalPrice}>
                        {siteConfig?.currency}{" "}
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
            if (item === "seller" && product.seller) {
              return (
                <div className={s.productSeller} key={item}>
                  <img
                    src={product.seller.logo || product.seller.profileImg}
                    alt={product.seller.name}
                  />
                  <span className={s.productSeller}>{product.seller.name}</span>
                </div>
              );
            }
            return null;
          })}
          {siteConfig?.productCard?.map((item) => {
            if (
              item === "whatsappNumber" &&
              (business?.business?.whatsappNumber || product.whatsappNumber)
            ) {
              return (
                <button
                  style={{
                    width: "min-content",
                  }}
                  className={s.whatsappBtn}
                  key={item}
                  onClick={(e) => {
                    e.preventDefault();
                    const a = document.createElement("a");
                    a.href = `whatsapp://send/?${new URLSearchParams({
                      phone:
                        business?.business?.whatsappNumber ||
                        product.whatsappNumber,
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
            if (item === "review") {
              return (
                <div className={s.rating} key={item}>
                  <span className={s.value}>{product.rating || 0}</span>
                  <span className={s.stars}>
                    {product.rating >= 1 ? <ImStarFull /> : <ImStarEmpty />}
                    {product.rating >= 2 ? <ImStarFull /> : <ImStarEmpty />}
                    {product.rating >= 3 ? <ImStarFull /> : <ImStarEmpty />}
                    {product.rating >= 4 ? <ImStarFull /> : <ImStarEmpty />}
                    {product.rating >= 5 ? <ImStarFull /> : <ImStarEmpty />}
                  </span>
                  <FiChevronDown className={s.chev} />
                  <span className={s.reviewCount}>
                    ({product.totalReview || 0})
                    {
                      //product.totalReview > 1 ? "reviews" : "review"
                    }
                  </span>

                  <div className={s.breakdown}>
                    <div className={s.title}>
                      <span className={s.stars}>
                        {product.rating >= 2 ? <ImStarFull /> : <ImStarEmpty />}
                        {product.rating >= 1 ? <ImStarFull /> : <ImStarEmpty />}
                        {product.rating >= 3 ? <ImStarFull /> : <ImStarEmpty />}
                        {product.rating >= 4 ? <ImStarFull /> : <ImStarEmpty />}
                        {product.rating >= 5 ? <ImStarFull /> : <ImStarEmpty />}
                      </span>

                      <span>{product.rating} out of 5</span>
                    </div>

                    <div className={s.subtitle}>
                      {product.totalReview} global ratings
                    </div>

                    <ul className={s.graph}>
                      {[5, 4, 3, 2, 1].map((item, i) => {
                        const rating = (product.ratingBreakdown || []).find(
                          (i) => i.rating === item
                        );
                        return (
                          <li key={item}>
                            <span>{item} star</span>
                            <span className={s.bar}>
                              <span
                                className={s.fill}
                                style={{
                                  width: `${(
                                    ((rating?.total || 0) / 5) *
                                    100
                                  ).fix()}%`,
                                }}
                              />
                            </span>
                            <span className={s.percent}>
                              {(((rating?.total || 0) / 5) * 100).fix()}%
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </a>
    </div>
  );
};
