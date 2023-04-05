import { useEffect, useState, useRef } from "react";
import { Input, Select, Combobox, Range } from "Components/elements";
import { HiOutlineX } from "react-icons/hi";
import s from "./home.module.scss";
import { useForm } from "react-hook-form";
import { useFetch } from "hooks";
import { endpoints, paths } from "config";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const Filters = ({ schema, fields, filters, setFilters }) => {
  const queryLoaded = useRef(false);
  const fieldsRef = useRef({});
  const [query, setQuery] = useSearchParams();
  const { pathname } = useLocation();

  const navigate = useNavigate();
  const { handleSubmit, control, reset, watch, getValues, setValue } = useForm({
    defaultValues: { sort: "price-asc" },
  });

  useEffect(() => {
    if (fields.length && !queryLoaded.current) {
      const values = {};
      fields.forEach((field) => {
        if (query[field.fieldName]) {
          values[field.fieldName] = query[field.fieldName];
        } else if (
          query[field.fieldName + "-min"] ||
          query[field.fieldName + "-max"]
        ) {
          if (field.filterType === "range") {
            values[field.fieldName + "-range"] = {
              min: +query[field.fieldName + "-min"],
              max: +query[field.fieldName + "-max"],
            };
          } else {
            values[field.fieldName + "-min"] = +query[field.fieldName + "-min"];
            values[field.fieldName + "-max"] = +query[field.fieldName + "-max"];
          }
        }
      });

      reset(values);
      queryLoaded.current = true;
    }
  }, [fields, query]);

  return (
    <form
      className="all-columns"
      onSubmit={handleSubmit((values) => {
        //
      })}
    >
      {Object.keys(query).length > 1 && (
        <div className={s.clearFilters}>
          <button
            className="btn"
            type="button"
            onClick={() => {
              // setFilters({});
              reset(fieldsRef.current);
              navigate(
                {
                  pathname: pathname,
                  query: { sort: query.sort },
                },
                undefined,
                { shallow: true, replace: true }
              );
            }}
          >
            <HiOutlineX />
            Clear All Filters
          </button>
        </div>
      )}
      {/* <Section label="Sort">
        <Combobox
          control={control}
          name="sort"
          options={[
            // { label: "Popularity", value: "popular" },
            { label: "Price Low to High", value: "price-asc" },
            { label: "Price High to Low", value: "price-dsc" },
          ]}
          onChange={(opt) => setFilters({ ...filters, sort: opt.value })}
        />
      </Section> */}
      {schema &&
        (fields || []).map((f) => {
          const field = schema.find((field) => field.name === f.fieldName);
          if (!field) {
            return null;
          }
          if (f.filterType === "textSearch" || f.filterType === "match") {
            fieldsRef.current = {
              ...fieldsRef.current,
              [field.name]: "",
            };
            return (
              <Section label={field.label} key={f.fieldName}>
                <Input
                  control={control}
                  name={field.name}
                  type={field.inputType}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      [field.name]: e.target.value || "",
                    }));
                  }}
                />
              </Section>
            );
          } else if (f.filterType === "minMax") {
            fieldsRef.current = {
              ...fieldsRef.current,
              [`${field.name}-min`]: "",
              [`${field.name}-max`]: "",
            };
            return (
              <Section label={field.label} key={f.fieldName}>
                <Input
                  control={control}
                  name={`${field.name}-min`}
                  type={field.inputType}
                  placeholder="MIN"
                  onChange={(e) => {
                    const max = getValues(`${field.name}-max`);

                    if (+e.target.value <= +max) {
                      setFilters((prev) => ({
                        ...prev,
                        [`${field.name}-min`]: +e.target.value,
                        [`${field.name}-max`]: +max,
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        [`${field.name}-min`]: "",
                        [`${field.name}-max`]: "",
                      }));
                    }
                  }}
                />
                <Input
                  control={control}
                  name={`${field.name}-max`}
                  type={field.inputType}
                  placeholder="MAX"
                  onChange={(e) => {
                    const min = getValues(`${field.name}-min`);
                    if (+e.target.value >= +min) {
                      setFilters((prev) => ({
                        ...prev,
                        [`${field.name}-max`]: +e.target.value,
                        [`${field.name}-min`]: +min,
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        [`${field.name}-max`]: "",
                        [`${field.name}-min`]: "",
                      }));
                    }
                  }}
                />

                {+getValues(`${field.name}-max`) <
                  +getValues(`${field.name}-min`) && (
                  <p className="subtitle1">Max must be greater then Min</p>
                )}
              </Section>
            );
          } else if (f.filterType === "range") {
            return (
              <Section label={field.label} key={f.fieldName}>
                <Range
                  control={control}
                  name={`${field.name}-range`}
                  setValue={setValue}
                  type={field.inputType}
                  placeholder={`${field.label} range`}
                  onChange={({ min, max }) => {
                    if (min <= max) {
                      setFilters((prev) => ({
                        ...prev,
                        [`${field.name}-min`]: min,
                        [`${field.name}-max`]: max,
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        [`${field.name}-min`]: "",
                        [`${field.name}-max`]: "",
                      }));
                    }
                  }}
                  min={+f.min}
                  max={+f.max}
                />
              </Section>
            );
          } else if (["list", "dropdown"].includes(f.filterStyle)) {
            fieldsRef.current = {
              ...fieldsRef.current,
              [field.name]: [],
            };
            return (
              <FilterList
                key={f.fieldName}
                field={field}
                sidebarItem={f}
                setFilters={setFilters}
                control={control}
              />
            );
          }
        })}

      <button hidden type="submit" disabled></button>
    </form>
  );
};

const FilterList = ({ field, setFilters, sidebarItem, control }) => {
  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState([]);
  const { get: getOptions } = useFetch(
    endpoints.elements + `/${field?.collection || ""}`
  );

  useEffect(() => {
    if (sidebarItem.filterStyle === "list") {
      setFilters((prev) => {
        return {
          ...prev,
          [field.name]: selected?.length ? selected : "",
        };
      });
    }
  }, [selected]);

  useEffect(() => {
    if (field.optionType === "collection") {
      getOptions()
        .then(({ data }) => {
          if (data?.success) {
            return setOptions(
              data.data.map((item) => ({
                label: item[field.optionLabel],
                value: item[field.optionValue],
              }))
            );
          }
        })
        .catch((err) => console.log(err));
    }
  }, []);

  if (sidebarItem.filterStyle === "list") {
    return (
      <Section label={field.label}>
        <ul className={s.filterList}>
          {(field.optionType === "array" ? field.options : options).map(
            (option, i) => (
              <li key={i}>
                <input
                  id={`${field.name}_${option.label}`}
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={(e) => {
                    if (selected.includes(option.value)) {
                      setSelected((prev) =>
                        prev.filter((item) => item !== option.value)
                      );
                    } else {
                      setSelected((prev) => [...prev, option.value]);
                    }
                  }}
                />{" "}
                <label htmlFor={`${field.name}_${option.label}`}>
                  {option.label}
                </label>
              </li>
            )
          )}
        </ul>
      </Section>
    );
  } else if (sidebarItem.filterStyle === "dropdown") {
    return (
      <Section label={field.label}>
        <Select
          control={control}
          {...(field.optionType === "array" && {
            options: field.options,
          })}
          {...(field.optionType === "collection" && {
            url: `${endpoints.elements}/${field.collection}`,
            getQuery: (inputValue, selected) => ({
              ...(inputValue && { [field.optionLabel]: inputValue }),
              ...(selected && { [field.optionValue]: selected }),
            }),
            handleData: (item) => ({
              label: item[field.optionLabel],
              value: item[field.optionValue],
            }),
          })}
          multiple
          name={field.name}
          formOptions={{ required: field.required }}
          className={s.itemName}
          onChange={(e) => {
            setFilters((prev) => ({
              ...prev,
              [field.name]: e.length ? e.map((item) => item.value) : "",
            }));
          }}
        />
      </Section>
    );
  }

  return null;
};

const Section = ({ label, children, className }) => {
  return (
    <div className={`${s.section} ${className || ""}`}>
      <div className={s.head}>{label}</div>
      <div className={s.sectionContent} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Filters;
