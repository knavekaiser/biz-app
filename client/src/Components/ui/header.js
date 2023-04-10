import { useContext, useState, useRef, useEffect } from "react";
import { endpoints } from "config";
import { useFetch } from "hooks";
import { SiteContext } from "SiteContext";
import { FaRegUserCircle } from "react-icons/fa";
import s from "./ui.module.scss";
import { Modal } from "Components/modal";
import { Link, useNavigate } from "react-router-dom";
import { paths } from "config";

const Header = ({}) => {
  const { business, setBusiness, user, setUser, setConfig, userType } =
    useContext(SiteContext);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const iconRef = useRef();
  const { post: logout } = useFetch(endpoints[`${userType}Logout`]);
  const naviage = useNavigate();

  useEffect(() => {
    const boundingBox = iconRef.current.getBoundingClientRect();
    setStyle({
      top: boundingBox.y + boundingBox.height + 6,
      right: window.innerWidth - (boundingBox.x + boundingBox.width),
    });
  }, []);

  return (
    <div className={s.header}>
      <Link to={paths.home}>
        <div className={s.siteName}>
          {user?.logo && <img className={s.logo} src={user.logo} />}
          {business?.business?.logo && (
            <img className={s.logo} src={business.business.logo} />
          )}
          <h2>{business?.business?.name || user?.name || "Comify Studio"}</h2>
        </div>
      </Link>

      <button
        ref={iconRef}
        className={`clear ${s.logoutBtn}`}
        title="Log out"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <FaRegUserCircle />
      </button>

      <Modal
        open={open}
        setOpen={setOpen}
        onBackdropClick={() => setOpen(false)}
        className={s.accountModal}
        // clickThroughBackdrop
        onOutsideClick={() => {
          setOpen(false);
        }}
        backdropClass={s.accountModalBackdrop}
        style={style}
      >
        <ul>
          {user?.userType === "admin" && business && (
            <li
              onClick={() => {
                setOpen(false);
                setBusiness(null);
                naviage(paths.businesses);
              }}
            >
              Switch Business
            </li>
          )}
          {user ? (
            <Link to={paths.dashboard.replace("*", "")}>
              <li>Dashboard</li>
            </Link>
          ) : (
            <Link to={paths.signIn}>
              <li>Sign in / Sign up</li>
            </Link>
          )}
          <li
            onClick={() => {
              logout().then(({ data }) => {
                if (data.success) {
                  setUser(null);
                  setConfig(null);
                  sessionStorage.removeItem("access_token");
                  naviage(paths.home);
                }
              });
            }}
          >
            Logout
          </li>
        </ul>
      </Modal>
    </div>
  );
};

export default Header;
