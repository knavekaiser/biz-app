import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  forwardRef,
} from "react";
import s from "./elements.module.scss";

import { FaSortDown, FaSearch } from "react-icons/fa";
import { Modal } from "../modal";
import { Input, Chip } from "./elements";
import { Controller } from "react-hook-form";

import ReactSelect, { components } from "react-select";

export const Combobox = ({
  register = () => {},
  formOptions,
  label,
  name,
  watch,
  setValue = () => {},
  placeholder,
  options,
  multiple,
  className,
  onChange = () => {},
  error,
  clearErrors,
  item,
  renderValue,
  required,
  value,
}) => {
  const id = useRef(Math.random().toString(36).substr(-8));
  const container = useRef();
  const selected = watch ? watch(name) : value;
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [hover, setHover] = useState(
    options?.findIndex(({ label, value }) => {
      return (
        value === selected ||
        (selected?.some && selected.some((s) => s === value))
      );
    })
  );
  const clickHandlerAdded = useState(false);
  const select = useCallback(
    ({ label, value, ...rest }) => {
      const _selectedItem = selected?.find?.((item) => item === value);
      if (_selectedItem) {
        setValue(
          name,
          selected.filter((item) => item !== value)
        );
      } else {
        if (multiple) {
          setValue(name, [
            ...(selected.filter?.((item) => item !== value) || []),
            value,
          ]);
        } else {
          setValue(name, value);
        }
      }

      if (!multiple) {
        setOpen(false);
      }
      clearErrors?.(name);
      onChange({ label, value, ...rest });
    },
    [selected]
  );
  const keyDownHandler = useCallback(
    (e) => {
      if (!options) return;
      if (!open && e.keyCode === 32) {
        setOpen(true);
      }
      if (e.keyCode === 9) {
      }
      if (e.keyCode === 27) {
        setOpen(false);
        return;
      }
      if (e.keyCode === 32 && options[hover]) {
        select(options[hover]);
        return;
      }
      if (e.keyCode === 38 || e.keyCode === 40) {
        const index = options?.findIndex(({ label, value }) => {
          return (
            value === selected ||
            (selected?.some && selected.some((s) => s === value))
          );
        });
        const _hover = hover !== undefined ? hover : index;
        if (e.keyCode === 38) {
          setHover(Math.max(_hover - 1, 0));
        } else if (e.keyCode === 40) {
          setHover(Math.min(_hover + 1, options.length - 1));
        }
      }
    },
    [hover, selected]
  );
  useLayoutEffect(() => {
    const { width, height, x, y } = container.current.getBoundingClientRect();
    const top = window.innerHeight - y;
    setStyle({
      position: "absolute",
      left: x,
      top: Math.max(
        Math.min(
          y + height,
          window.innerHeight - Math.min(35 * (options?.length || 0) + 8, 320)
          // window.innerHeight - (35 * (options?.length || 0) + 8)
        ),
        8
      ),
      width: width,
      maxHeight: Math.min(window.innerHeight - 16, 300),
    });
  }, [open, options]);
  useEffect(() => {
    const clickHandler = (e) => {
      if (e.path && !e.path.includes(container.current)) {
        setOpen(false);
      }
    };
    if (!clickHandlerAdded.current) {
      document.addEventListener("click", clickHandler);
      return () => {
        document.removeEventListener("click", clickHandler);
      };
      clickHandlerAdded.current = true;
    }
  }, [open]);
  return (
    <section
      data-testid="combobox-container"
      className={`${s.combobox} ${className || ""} ${open ? s.open : ""} ${
        !(Array.isArray(options) && options.length) ? s.noOptions : ""
      } ${error ? s.err : ""}`}
    >
      {label && (
        <label data-testid="combobox-label">
          {label} {required && "*"}
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
        tabIndex={0}
        onKeyDown={(e) => {
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
              const index = options?.findIndex(({ label, value }) => {
                return (
                  value === selected ||
                  (selected?.some && selected.some((s) => s === value))
                );
              });
              const _hover = hover !== undefined ? hover : index;
              if (e.keyCode === 38) {
                setHover(Math.max(_hover - 1, 0));
              } else if (e.keyCode === 40) {
                setHover(Math.min(_hover + 1, options.length - 1));
              }
            }
          }
        }}
      >
        <p className={`${s.displayValue} ${!selected ? s.placeholder : ""}`}>
          {renderValue ? (
            renderValue(selected)
          ) : (
            <>
              {!(Array.isArray(options) && options.length) &&
                "No options provided"}
              {selected &&
                ["string", "number"].includes(typeof selected) &&
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
                            ({ value }) => value.toString() === a.toString()
                          )?.label
                        }${i < arr.length - 1 ? ", " : ""}`,
                      ""
                    ))}
              {options?.length > 0 && (
                <>{!selected?.toString().length && (placeholder || "Select")}</>
              )}
            </>
          )}
        </p>
        <input
          id={id.current}
          data-testid="combobox-input"
          {...register(name, { ...formOptions })}
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
        open={open}
        setOpen={setOpen}
        onBackdropClick={() => setOpen(false)}
        clickThroughBackdrop={true}
        style={style}
      >
        <ComboboxList
          hover={hover}
          setHover={setHover}
          options={options}
          setValue={setValue}
          select={select}
          selected={selected}
          multiple={multiple}
          name={name}
          open={open}
          setOpen={setOpen}
          clearErrors={clearErrors}
          item={item}
        />
      </Modal>
    </section>
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
      setValue,
      multiple,
      name,
      open,
      setOpen,
      clearErrors,
      item,
    },
    ref
  ) => {
    return (
      <ul
        ref={ref}
        className={s.options}
        data-testid="combobox-options"
        onMouseMove={() => setHover(null)}
      >
        {options?.map(({ label, value, ...rest }, i) => (
          <li
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              select({ label, value, ...rest });
            }}
            className={`${
              (selected?.find && selected.find((item) => item === value)) ||
              value === selected
                ? s.selected
                : ""
            } ${hover === i && s.hover}`}
            data-testid={`combobox-${label}`}
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
  options,
  multiple,
  label,
  className,
  placeholder,
  renderOption,
  setValue,
  readOnly,
  onChange: _onChange,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={formOptions}
      render={({
        field: { onChange, onBlur, value, name, ref },
        fieldState: { invalid, isTouched, isDirty, error },
      }) => (
        <section className={`${s.select} ${className || ""}`}>
          {label && <label>{label}</label>}
          <div className={s.field}>
            <ReactSelect
              placeholder={
                !options || !options?.length
                  ? "No options provided"
                  : placeholder || "Enter"
              }
              components={{
                DropdownIndicator,
                ...(renderOption && { Option: renderOption }),
              }}
              className={`reactSelect ${s.reactSelect} ${
                readOnly ? "readOnly" : ""
              } ${error ? "err" : ""} ${className || ""}`}
              classNamePrefix="reactSelect"
              isDisabled={!options || !options?.length}
              inputRef={ref}
              menuPortalTarget={document.querySelector("#portal")}
              menuPlacement="auto"
              options={options || []}
              value={
                options?.find((op) => op.value === value) ||
                options?.filter((op) =>
                  value?.some?.((item) => item === op.value)
                ) ||
                ""
              }
              onChange={(val) => {
                if (multiple) {
                  onChange(val.map((item) => item.value));
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
      )}
    />
  );
};
