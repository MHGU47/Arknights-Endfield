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

export function weaponStatParser(stats) {
  /**
   * Parses all three stats of the weapon (passed in as an Object) and returns
   * an Object where each stat is as follows ->
   * 
   * Stat {
   *  Name: Str
   *  Ranks: Obj
   *  Levels: Obj
   *  Attribute: Str
   * }
   */
  const parsedStats = Object.fromEntries(
      Object.entries(stats)
        .map(([name, value], i) => {

          let data = {}

          data["Ranks"] = Object.fromEntries(
            Object.entries(value).map(([rank, desc]) =>
            [rank, desc]
          ));
          
          let type = ""
          if(name.includes(":")) type = "Passive Attribute"
          else {
            type = `Stat ${i + 1}`

            let temp_name = name.split('[')[0].trim().split(' ').slice(0,-1)
            //const index = temp_name.findIndex((word) => word.toUpperCase() === "DMG")
            //if(temp_name.includes("DMG")) temp_name.splice(index, 1, "Damage")
            //console.log(temp_name)

            data["Attribute"] = capitalize(name.split('[')[0].trim())
            data["Attribute"] = temp_name.join(" ")
          }

          data["Name"] = name

          data["Values"] = Object.fromEntries(
            Object.entries(value).map(([rank, val]) =>
            [rank, valueParser(val.split('+')[1].trim('+'))]
          ));


          return [type, data];
        })
    );

    return parsedStats
}

function capitalize(str) {
  return str
    .split(" ")
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}
