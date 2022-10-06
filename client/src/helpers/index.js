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
