import { moment } from "Components/elements/moment";
const XLSX = require("xlsx");

export const findProperties = function (prop, obj) {
  const arr = [];
  const findProperties = (obj, parent) => {
    for (var key in obj) {
      if (key === prop) {
        arr.push({
          prop: key,
          value: obj[key],
          path: `${parent ? parent + "." : ""}${prop}`.split("."),
        });
      } else if (obj[key] && typeof obj[key] === "object") {
        findProperties(obj[key], `${parent ? parent + "." : ""}${key}`);
      }
    }
  };
  findProperties(obj);
  return arr;
};

export const toCSV = (columns, data) => {
  // columns = ["Account Number", "Name"],
  // data = [["1234", "Angela f"], ["5421", "John B"]]

  let headers = columns.map((item) => `"${item}"`).join(",");
  let body = data
    .map((row) => row.map((item) => `"${item}"`).join(","))
    .join("\r\n");

  return "data:text/csv;charset=utf-8," + headers + "\r\n" + body;
};

export const parseXLSXtoJSON = (file, cb) => {
  var name = file.name;
  const reader = new FileReader();
  reader.onload = async (evt) => {
    const bstr = evt.target.result;

    const wb = XLSX.read(bstr, { type: "binary" });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const arr = [];
    const cols = data.shift();
    data.forEach((row, i) => {
      const item = {};
      cols.forEach((col, j) => {
        if (col.includes("amount") && row[j]) {
          item[col] = +row[j].trim().replace(/[^0-9.]/g, "");
          return;
        }
        if (col.includes("date") && row[j]) {
          const dateString = row[j].trim();
          item[col] =
            dateString.length > 10
              ? moment(dateString, "YYYY-MM-DD")
              : moment(dateString, "YYYY-MM-DD hh:mm");
          return;
        }
        if (typeof row[j] === "string") {
          row[j] = row[j]?.trim();
          if (row[j].startsWith("[") && row[j].endsWith("]")) {
            item[col] = row[j].slice(1).slice(0, -1).split(",");
          } else {
            item[col] = row[j];
          }
          return;
        }
        item[col] = row[j];
      });
      arr.push(item);
    });
    cb(arr);
  };
  reader.readAsBinaryString(file);
};
