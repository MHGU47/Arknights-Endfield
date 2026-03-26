import { valueParser, weaponStatParser } from "./utils"

class Weapon{
  constructor(wpnData, image){
    const [[name, data]] = Object.entries(wpnData)
    this.name = name
    this.image = image
    this.type = data.type
    this.levels = Object.fromEntries(
      Object.entries(data.levels)
      .map(([level, value]) =>
        [level, parseInt(value)])
    )

    //this.stats = weaponStatParser(data.stats)
    //console.log(this.stats)

    this.stats = Object.fromEntries(
      Object.entries(weaponStatParser(data.stats))
      .map(([name, value]) =>
      [name, new Stat(value.Attribute, value)])
    )

    console.log(this.stats)
  }
}

class Stat {
  constructor(attribute, stats) {
    this.raw = stats
    this.attribute = attribute;

    // Assign ranks to levels. Ranks for weapons work in the same way as stat levels for gear
    this.levels = Object.values(stats.Ranks).map(i => i);

    // Assign the values directly
    this.values = Object.values(stats.Values).map(o => o);
  }
}

export default Weapon