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
      {/* <Input label="Name" {...register("name")} required error={errors.name} />

      <Combobox
        label="Parent"
        name="parent"
        control={control}
        options={[
          { label: "None", value: "null" },
          ...masters.map((item) => ({ label: item.name, value: item._id })),
        ]}
      /> */}

      <Combobox
        label="Type"
        name="type"
        control={control}
        options={[
          { label: "None", value: "null" },
          { label: "Cash", value: "Cash" },
          { label: "Bank", value: "Bank" },
          { label: "Customers", value: "Customers" },
          { label: "Suppliers", value: "Suppliers" },
          { label: "Sales", value: "Sales" },
          { label: "Purchase", value: "Purchase" },
          { label: "Stock", value: "Stock" },
        ]}
      />

      {/* <Combobox
        label="Is Group"
        name="isGroup"
        control={control}
        formOptions={{ required: true }}
        options={[
          { label: "No", value: false },
          { label: "Yes", value: true },
        ]}
      /> */}

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
