import { useForm } from "react-hook-form";
import { Input, Combobox } from "Components/elements";
import s from "./quotes.module.scss";

const VoucherFilters = ({ filters, setFilters }) => {
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
          { label: "Receipt", value: "Receipt" },
          { label: "Payment", value: "Payment" },
        ]}
      />

      <Input
        label="Start Date"
        type="datetime-local"
        {...register("startDate")}
        required
        error={errors.startDate}
      />
      <Input
        label="End Date"
        type="datetime-local"
        {...register("endDate")}
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

export default VoucherFilters;
