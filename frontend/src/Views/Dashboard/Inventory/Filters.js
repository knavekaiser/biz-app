import { useForm } from "react-hook-form";
import { Input, Combobox, moment } from "Components/elements";
import s from "./quotes.module.scss";
import { useContext, useState } from "react";
import { SiteContext } from "SiteContext";

export const VoucherFilters = ({ filters, setFilters }) => {
  const { finPeriod } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm();

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const filters = {};
        if (values.type) {
          filters.type = values.type;
        }
        if (values.startDate && values.endDate) {
          filters.startDate = values.startDate;
          filters.endDate = values.endDate;
        }
        setFilters(filters);
      })}
      className={`${s.voucherFilters} grid gap-1`}
    >
      <Combobox
        label="Type"
        name="type"
        control={control}
        options={[
          { label: "Invoice", value: "Invoice" },
          { label: "Sales Return", value: "Sales Return" },
          { label: "Purchase", value: "Purchase" },
          { label: "Purchase Return", value: "Purchase Return" },
        ]}
      />

      <Input
        label="Start Date"
        type="date"
        {...register("startDate")}
        {...(finPeriod && {
          min: moment(finPeriod.startDate, "YYYY-MM-DD"),
        })}
        {...(finPeriod && {
          max: moment(finPeriod.endDate, "YYYY-MM-DD"),
        })}
        required
        error={errors.startDate}
      />
      <Input
        label="End Date"
        type="date"
        {...register("endDate")}
        {...(finPeriod && { min: moment(finPeriod.startDate, "YYYY-MM-DD") })}
        {...(finPeriod && { max: moment(finPeriod.endDate, "YYYY-MM-DD") })}
        required
        error={errors.endDate}
      />

      <div className="flex gap-1">
        <button className="btn">Search</button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => {
            reset();
            setFilters({});
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export const AnalysysFilters = ({ filters, setFilters }) => {
  const { finPeriod } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const filters = {};
        if (values.type) {
          filters.type = values.type;
        }
        if (values.startDate && values.endDate) {
          filters.startDate = values.startDate;
          filters.endDate = values.endDate;
        }
        setFilters(filters);
      })}
      className={`${s.voucherFilters} grid gap-1`}
    >
      <Input
        label="Start Date"
        type="date"
        {...register("startDate")}
        // {...(finPeriod && { min: moment(finPeriod.startDate, "YYYY-MM-DD") })}
        // {...(finPeriod && { max: moment(finPeriod.endDate, "YYYY-MM-DD") })}
        required
        error={errors.startDate}
      />
      <Input
        label="End Date"
        type="date"
        {...register("endDate")}
        // {...(finPeriod && { min: moment(finPeriod.startDate, "YYYY-MM-DD") })}
        // {...(finPeriod && { max: moment(finPeriod.endDate, "YYYY-MM-DD") })}
        required
        error={errors.endDate}
      />

      <div className="flex gap-1">
        <button className="btn">Search</button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => {
            reset();
            setFilters({});
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
};
