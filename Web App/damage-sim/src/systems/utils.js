export function valueParser(val) {
  let num;

  if (typeof val === "string" && val.includes("%")) {
    num = parseFloat(val.replace("%", "")) / 100;
  } else {
    num = parseFloat(val);

    if (Number.isNaN(num)) {
      return val;
    }
  }

  if (Number.isInteger(num)) {
    return num;
  }

  return num;
};
