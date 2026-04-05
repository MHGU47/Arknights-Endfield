import Skill from './skill'
class Operator{
  constructor(opData){
    const [[name, data] = [index, {}]] = Object.entries(opData ?? {}); // Gets the name and the operator data and seperates them
    this.name = name
    this.level = "Level 1"

    this.#parseOverview(data.overview)
    this.#parseAttributes(data.attributes)
    this.#parseSkills(data.skills)
    this.#parseTalents(data.talents)
  }

  #parseOverview(overview){
    this.weapon = overview.Weapon
    this.element = overview.Element
    this.class = overview.Class
    this.mainAttr = overview["Main Attribute"]
    this.subAttr = overview["Sub Attribute"]
  }

  #parseAttributes(attributes){
    this.levels = Object.fromEntries(
      Object.entries(attributes["summary"]).map(([level, data]) =>
      [level, this.#convertToInt(data)])
    )
    this.detailedLevels = Object.entries(attributes["detailed"]).map(([level, data]) =>
      {
        [level, data]
      })

    this.attributes = Object.fromEntries(
      Object.entries(this.levels[this.level])
        .map(([key, value]) => [key, value])
    )
  }

  #convertToInt(data){
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, parseInt(v)])
    );
  }

  #parseSkills(skills){
    let parsed = skills.reduce((acc, skill) => {
      const [name, data] = Object.entries(skill)[0]

      const type = data.type

      acc[type] = {
        name,     // keep the original name
        ...data   // rest of the data
      }

      return acc
    }, {})

    this.skills = Object.fromEntries(
      Object.entries(parsed).map(([name, data]) => {
        return [name, new Skill(data)]
      }
    ))
  }

  #parseTalents(talents){
    this.talents = talents.reduce((acc, item) => {
      // 'talents' is your original array
      // .reduce() will iterate through each element and build ONE final object (acc)

      // 'acc' = accumulator → the object we are building up
      // 'item' = current element in the array
      // Each 'item' looks like:
      // { "Illumination": { unlock: "...", description: "..." } }


      const [[name, data]] = Object.entries(item);
      // Object.entries(item) turns:
      // { "Illumination": {...} }
      // into:
      // [ ["Illumination", {...}] ]
      //
      // We destructure it like:
      // [[name, data]]
      //
      // So:
      // name = "Illumination"
      // data = { unlock: "...", description: "..." }


      const levelMatch = data.unlock.match(/E\d+/);
      // data.unlock is a string like:
      // "Promote to E2 to unlock"
      //
      // .match(/E\d+/) uses a regex:
      // E\d+ means:
      //   E = literal "E"
      //   \d+ = one or more digits
      //
      // So it finds:
      // "E1", "E2", "E3", etc.
      //
      // If found:
      // levelMatch = ["E2"]
      //
      // If NOT found:
      // levelMatch = null


      const level = levelMatch ? levelMatch[0] : "Unknown";
      // If a match exists:
      //   level = "E2"
      //
      // If no match:
      //   level = "Unknown"
      //
      // We use [0] because .match() returns an array


      if (!acc[name]) {
        acc[name] = {};
      }
      // If this talent name doesn't exist yet in our accumulator:
      //
      // acc = {}
      // first time seeing "Illumination" →
      // we create:
      // acc["Illumination"] = {}
      //
      // This prevents overwriting previous entries


      acc[name][level] = data;
      // Now we assign the data under the correct level
      //
      // Example:
      // acc["Illumination"]["E2"] = { unlock: "...", description: "..." }
      //
      // This builds:
      // {
      //   Illumination: {
      //     E1: {...},
      //     E2: {...}
      //   }
      // }


      return acc;
      // IMPORTANT: reduce MUST return the accumulator each iteration
      //
      // This updated object is passed into the next loop iteration

    }, {});
    // {} = initial value of acc
    // We start with an empty object and build into it
  }

  updateAttributes(){
    this.attributes = Object.fromEntries(
      Object.entries(this.levels[this.level])
        .map(([key, value]) => [key, value])
    )
  }
}
export default Operator