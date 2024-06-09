import { useContext, useState, useRef, useEffect, useCallback } from "react";
import { endpoints } from "config";
import { useFetch } from "hooks";
import { SiteContext } from "SiteContext";
import { FaRegUserCircle } from "react-icons/fa";
import s from "./ui.module.scss";
import { Modal, Prompt } from "Components/modal";
import { Link, useNavigate } from "react-router-dom";
import { paths } from "config";
import { useForm } from "react-hook-form";
import { Select } from "Components/elements";
import { GrLocation } from "react-icons/gr";
import { getUserLocation } from "helpers";

const Header = ({ home, filters, setFilters }) => {
  const { business, setBusiness, user, setUser, setConfig, userType } =
    useContext(SiteContext);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const iconRef = useRef();
  const { post: logout } = useFetch(endpoints[`${userType}Logout`]);
  const navigate = useNavigate();

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
          <h2>
            {business?.business?.name ||
              user?.name ||
              (home ? "Comify" : "Comify Studio")}
          </h2>
        </div>
      </Link>

      {home && <LocationFilter filters={filters} setFilters={setFilters} />}

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
          {user && (
            <>
              <li style={{ pointerEvents: "none" }}>
                {user.name}
                <p>
                  <small>{user.phone}</small>
                </p>
              </li>
              <hr />
            </>
          )}
          {user?.userType === "admin" && business && !home && (
            <li
              onClick={() => {
                setOpen(false);
                setBusiness(null);
                navigate(paths.businesses);
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
          {user && (
            <li
              onClick={() => {
                logout().then(({ data }) => {
                  if (data.success) {
                    setUser(null);
                    setConfig(null);
                    navigate(paths.home);
                  }
                });
              }}
            >
              Logout
            </li>
          )}
        </ul>
      </Modal>
    </div>
  );
};

const LocationFilter = ({ filters, setFilters }) => {
  const { handleSubmit, control, watch, setValue } = useForm();
  const [userLocation, setUserLocation] = useState(false);
  const [locations, setLocations] = useState([]);
  const { get: getLocations } = useFetch(endpoints.homeLocations);

  const location = watch("location");

  useEffect(() => {
    if (location) {
      const [type, level2, level1] = location.split("__");
      setFilters((prev) =>
        JSON.parse(
          JSON.stringify({
            ...prev,
            address_city: undefined,
            address_state: undefined,
            address_country: undefined,
            ...(type === "city" && {
              address_city: level1,
              address_state: level2,
            }),
            ...(type === "state" && {
              address_country: level2,
              address_state: level1,
            }),
          })
        )
      );
    } else {
      setFilters((prev) =>
        JSON.parse(
          JSON.stringify({
            ...prev,
            address_city: undefined,
            address_state: undefined,
            address_country: undefined,
          })
        )
      );
    }
  }, [location]);

  useEffect(() => {
    getLocations().then(({ data }) => {
      if (data.success) {
        setLocations(data.data);
      }
    });
  }, []);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        //
      })}
    >
      <Select
        control={control}
        name="location"
        loading
        startAdronment={<GrLocation />}
        options={[
          userLocation
            ? null
            : {
                label: "Use My Location",
                value: "userLocation",
              },
          ...locations.map((item) => ({
            ...item,
            value: `${item.type}__${
              item.type === "city" ? `${item.state}__` : `${item.country}__`
            }${item.label}`,
          })),
        ].filter(Boolean)}
        onChange={(opt) => {
          if (opt.value === "userLocation") {
            getUserLocation()
              .then(({ position, error }) => {
                if (error) {
                  return Prompt({ type: "error", message: error.message });
                }
                const latlng = position.latitude + "," + position.longitude;
                // const latlng = "23.756450,90.353687";
                // const latlng = "21.4508945,91.9678827";
                getLocations({
                  query: { latlng },
                }).then(({ data }) => {
                  if (data.success) {
                    if (data.match) {
                      const { match } = data;
                      setUserLocation(true);
                      setValue(
                        "location",
                        `${match.type}__${
                          match.type === "city"
                            ? `${match.state}__`
                            : `${match.country}__`
                        }${match.label}`
                      );
                    } else {
                      setValue("location", "");
                    }
                  } else {
                    setValue("location", "");
                    Prompt({ type: "error", message: data.message });
                  }
                });
              })
              .catch((err) => {
                setValue("location", "");
                Prompt({ type: "error", message: err.message });
              });
          } else {
            setUserLocation(false);
          }
        }}
        renderOption={(opt) => {
          if (opt.value === "userLocation") {
            return (
              <div
                style={{
                  fontWeight: 600,
                  color: "#068bc9",
                }}
              >
                <p>{opt.label}</p>
                <p style={{ opacity: 0.8 }}>
                  <small>{opt.country || opt.state}</small>
                </p>
              </div>
            );
          }
          return (
            <div>
              <p>{opt.label}</p>
              <p style={{ opacity: 0.8 }}>
                <small>{opt.country || opt.state}</small>
              </p>
            </div>
          );
        }}
      />
    </form>
  );
};

export default Header;
