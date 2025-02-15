import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { useFetch } from "hooks";
import s from "./elements.module.scss";

import { FaSortDown, FaSearch, FaTimes } from "react-icons/fa";
import { Modal, Prompt } from "../modal";
import { Controller } from "react-hook-form";

import ReactSelect, { components } from "react-select";

export const Combobox = ({
  control,
  formOptions,
  label,
  name,
  placeholder,
  options,
  multiple,
  className,
  disabled,
  onChange: compOnChange,
  item,
  renderValue,
}) => {
  const container = useRef();
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [hover, setHover] = useState();
  useEffect(() => {
    const { width, height, x, y } = container.current.getBoundingClientRect();
    setStyle({
      position: "absolute",
      left: x,
      top: (
        window.innerHeight - Math.min(35 * (options?.length || 0) + 8, 320)
      ).clamp(8, y + height),
      width: width,
      maxHeight: Math.min(window.innerHeight - 16, 300),
    });
  }, [open, options]);
  return (
    <Controller
      control={control}
      name={name}
      rules={formOptions}
      render={({
        field: { onChange, onBlur, value, name, ref },
        fieldState: { error },
      }) => {
        const selected = ![undefined, null].includes(value)
          ? value
          : multiple
          ? []
          : "";
        const select = ({ label, value, ...rest }) => {
          if (disabled) {
            return;
          }
          const _selectedItem = selected?.find?.((item) => item === value);
          if (_selectedItem !== undefined) {
            onChange(selected.filter((item) => item !== value));
          } else {
            if (multiple) {
              onChange([
                ...(selected.filter?.((item) => item !== value) || []),
                value,
              ]);
            } else {
              onChange(value);
            }
          }

          if (!multiple) {
            setOpen(false);
          }
          // clearErrors?.(name);
          compOnChange && compOnChange({ label, value, ...rest });
        };
        return (
          <section
            data-testid="combobox-container"
            className={`${s.combobox} ${className || ""} ${
              open ? s.open : ""
            } ${
              !(Array.isArray(options) && options.length) ? s.noOptions : ""
            } ${error ? s.err : ""} ${disabled ? s.disabled : ""}`}
          >
            {label && (
              <label data-testid="combobox-label">
                {label} {formOptions?.required && "*"}
              </label>
            )}

            <div
              className={s.field}
              onClick={() => {
                if (Array.isArray(options) && options.length) {
                  setOpen(true);
                }
              }}
              ref={container}
              tabIndex={disabled ? 1 : 0}
              onKeyDown={(e) => {
                if (disabled) {
                  return;
                }
                if ([32, 38, 40].includes(e.keyCode)) {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.keyCode === 27) {
                    // escape key
                    setOpen(false);
                    return;
                  }
                  if (!open && e.keyCode === 32) {
                    setOpen(true);
                    return;
                  }
                  if (e.keyCode === 32 && options[hover]) {
                    select(options[hover]);
                  }
                  if (e.keyCode === 38 || e.keyCode === 40) {
                    const index =
                      options?.findIndex(({ label, value }) => {
                        return (
                          value === selected ||
                          (selected?.some && selected.some((s) => s === value))
                        );
                      }) || 0;
                    const _hover = hover !== undefined ? hover : index;

                    let newIndex =
                      e.keyCode === 38
                        ? Math.max(_hover - 1, 0)
                        : Math.min(
                            _hover === null ? 0 : _hover + 1,
                            options.length - 1
                          );

                    while (options[newIndex]?.disabled) {
                      if (e.keyCode === 38 && options[newIndex + 1]) {
                        newIndex = Math.max(newIndex - 1, 0);
                      } else if (e.keyCode === 40 && options[newIndex + 1]) {
                        newIndex = Math.min(newIndex + 1, options.length - 1);
                      } else {
                        newIndex = hover;
                      }
                    }

                    setHover(newIndex);
                  }
                }
              }}
            >
              <p
                className={`${s.displayValue} ${
                  (multiple && selected?.length === 0) ||
                  selected === undefined ||
                  selected === ""
                    ? s.placeholder
                    : ""
                }`}
              >
                {renderValue ? (
                  renderValue(selected)
                ) : (
                  <>
                    {!(Array.isArray(options) && options.length) &&
                      "No options provided"}
                    {selected !== undefined &&
                      ["string", "number", "boolean"].includes(
                        typeof selected
                      ) &&
                      options?.find(
                        ({ value }) => value.toString() === selected.toString()
                      )?.label}
                    {Array.isArray(selected) &&
                      (selected.length > 3
                        ? `${selected.length} items selected`
                        : selected.reduce(
                            (p, a, i, arr) =>
                              `${p} ${
                                options?.find(
                                  ({ value }) =>
                                    value.toString() === a.toString()
                                )?.label
                              }${i < arr.length - 1 ? ", " : ""}`,
                            ""
                          ))}
                    {options?.length > 0 &&
                      ((multiple && selected?.length === 0) ||
                        selected === undefined ||
                        selected === "") &&
                      (placeholder ?? "Select")}
                  </>
                )}
              </p>
              <input
                data-testid="combobox-input"
                ref={ref}
                readOnly={true}
                tabIndex={1}
              />
              <span data-testid="combobox-btn" className={s.btn}>
                <FaSortDown />
              </span>
            </div>
            {error && <span className={s.errMsg}>{error.message}</span>}
            <Modal
              open={open}
              className={s.comboboxModal}
              backdropClass={s.comboboxBackdrop}
              setOpen={setOpen}
              onBackdropClick={() => setOpen(false)}
              // clickThroughBackdrop
              style={style}
            >
              <ComboboxList
                hover={hover}
                setHover={setHover}
                options={options}
                select={select}
                selected={selected}
                multiple={multiple}
                name={name}
                open={open}
                setOpen={setOpen}
                item={item}
              />
            </Modal>
          </section>
        );
      }}
    />
  );
};
const ComboboxList = forwardRef(
  (
    {
      options,
      hover,
      setHover,
      select,
      selected,
      multiple,
      name,
      open,
      setOpen,
      item,
    },
    ref
  ) => {
    return (
      <ul
        ref={ref}
        className={s.options}
        data-testid="combobox-options"
        onMouseOut={() => setHover(null)}
      >
        {options?.map(({ label, value, disabled, ...rest }, i) => (
          <li
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) {
                select({ label, value, ...rest });
              }
            }}
            className={`${
              (selected?.find && selected.find((item) => item === value)) ||
              value === selected
                ? s.selected
                : ""
            } ${hover === i && s.hover} ${disabled ? s.disabled : ""}`}
            data-testid={`combobox-${label}`}
            onMouseMove={() => setHover(i)}
            onMouseOut={() => setHover(i)}
          >
            {multiple && (
              <input
                type="checkbox"
                checked={
                  (selected?.find && selected.find((item) => item === value)) ||
                  false
                }
                readOnly={true}
              />
            )}
            {item ? item({ label, value, ...rest }) : label}
          </li>
        ))}
      </ul>
    );
  }
);

const DropdownIndicator = (props) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <FaSearch />
      </components.DropdownIndicator>
    )
  );
};

export const Select = ({
  control,
  formOptions,
  name,
  options: defaultOptions,
  url,
  getQuery,
  handleData,
  multiple,
  label,
  className,
  placeholder,
  renderOption,
  disabled,
  onChange: _onChange,
  startAdronment,
}) => {
  const firstRender = useRef(true);
  const [inputValue, setInputValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [options, setOptions] = useState([]);

  const { get: fetchData, loading: loadingData } = useFetch(url);

  const getOptions = useCallback(
    (inputValue, selected) => {
      fetchData({
        query: {
          ...(getQuery && getQuery(inputValue, selected)),
          pageSize: 10 + (selectedOptions.length || 0),
        },
      })
        .then(({ data }) => {
          if (data.success) {
            const _data = data.data.map(handleData);
            if (multiple) {
              let _selectedOptions;
              if (firstRender.current) {
                _selectedOptions = _data.filter((item) =>
                  (
                    (name?.includes(".")
                      ? name
                          .split(".")
                          .reduce((p, c) => p[c], control._formValues)
                      : control._formValues[name]) || []
                  ).includes(item.value)
                );
                setSelectedOptions(_selectedOptions);
              }
              setOptions(
                [
                  ..._data,
                  ...(_selectedOptions || selectedOptions),
                ].findUniqueObj()
              );
            } else {
              setOptions(_data);
            }
            firstRender.current = false;
          } else if (data.success === false) {
            Prompt({ type: "error", message: data.message });
          }
        })
        .catch((err) => {
          console.log(err);
          Prompt({ type: "error", message: err.message });
        });
    },
    [url, control._formValues[name], selectedOptions, getQuery]
  );

  useEffect(() => {
    if (url && inputValue) {
      getOptions(inputValue);
    } else if (url) {
      getOptions(inputValue);
    }
  }, [inputValue, url]);

  useEffect(() => {
    const _value =
      name && name.includes(".")
        ? name.split(".").reduce((p, c) => p[c], control._formValues)
        : control._formValues[name];
    if (_value && !options.length && url) {
      getOptions(null, _value);
    }
  }, []);

  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);
  return (
    <Controller
      control={control}
      name={name}
      rules={formOptions}
      render={({
        field: { onChange, onBlur, value, name, ref },
        fieldState: { invalid, isTouched, isDirty, error },
      }) => {
        const ClearButton = (props) => {
          return (
            components.DropdownIndicator && (
              <components.DropdownIndicator {...props}>
                <FaTimes onClick={() => onChange(multiple ? [] : "")} />
              </components.DropdownIndicator>
            )
          );
        };
        return (
          <section className={`${s.select} ${className || ""}`}>
            {label && (
              <label>
                {label} {formOptions?.required && "*"}
              </label>
            )}
            <div className={`${s.field} ${error ? s.err : ""}`}>
              <span className={s.startAdronment}>{startAdronment}</span>
              <ReactSelect
                placeholder={
                  url
                    ? "Search..."
                    : !options || !options?.length
                    ? "No options provided"
                    : placeholder || "Enter"
                }
                components={{
                  DropdownIndicator:
                    (multiple && !value?.length) || (!multiple && !value)
                      ? DropdownIndicator
                      : ClearButton,
                  ...(disabled && {
                    DropdownIndicator: undefined,
                  }),
                  ...(multiple && { DropdownIndicator: undefined }),
                  ...(renderOption && {
                    Option: (props) => (
                      <components.Option {...props}>
                        {renderOption(props.data)}
                      </components.Option>
                    ),
                  }),
                }}
                className={`reactSelect ${s.reactSelect} ${
                  disabled ? "readOnly" : ""
                } ${className || ""}`}
                classNamePrefix="reactSelect"
                isDisabled={url ? false : !options || !options?.length}
                inputRef={ref}
                menuPortalTarget={document.querySelector("#portal")}
                menuPosition="fixed"
                menuPlacement="auto"
                options={options || []}
                value={
                  options?.find((op) => op.value === value) ||
                  options?.filter((op) =>
                    value?.some?.((item) => item === op.value)
                  ) ||
                  ""
                }
                onInputChange={(value) => {
                  if (url) {
                    setInputValue(value);
                  }
                }}
                onChange={(val) => {
                  if (multiple) {
                    onChange(val.map((item) => item.value));
                    setSelectedOptions(val);
                  } else {
                    onChange(val.value);
                  }
                  _onChange && _onChange(val);
                }}
                isMulti={multiple}
                styles={{
                  option: (provided, state) => ({
                    ...provided,
                    background: state.isSelected
                      ? "#e8e8e8;"
                      : state.isFocused
                      ? "#eeeeee"
                      : "white",
                    padding: "6px 10px",
                    color: "black",
                    fontSize: "0.8rem",
                  }),
                  control: () => ({}),
                  singleValue: (provided, state) => {},
                  menuPortal: (base) => ({ ...base, zIndex: 99999999999 }),
                }}
              />
            </div>
            {error && <span className={s.errMsg}>{error.message}</span>}
          </section>
        );
      }}
    />
  );
};
