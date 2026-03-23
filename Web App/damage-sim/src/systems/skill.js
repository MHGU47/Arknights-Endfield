import { valueParser } from "./utils"
class Skill{
  constructor(data){
    this.name = data.name
    this.type = data.type
    this.description = data.description
    this.#parseMultipliers(data.multipliers)
    this.level = "Level 1"
    
  }

  #parseMultipliers(multipliers){
    this.levels = Object.fromEntries(
      Object.entries(multipliers).map(([level, stats]) => [
        level,// New key
        Object.fromEntries(
          Object.entries(stats).map(([k, v], i) => [this.#nameParser(k, i), valueParser(v)])
        )//The new dict
      ])
    );
  }

  #parseLevels(skill){
    let data ={}
    let names, multipliers = []

    if (this.type == "Basic Attack"){
      names = [
        ...Object.keys(skill).filter(n => n.includes("BATK")).map((_, i) => `Basic Attack ${i + 1}`),
        //Get keys of the skill (the names of each attack sequence) and check to see if they are a basic attack,
        //based on their name. If they are, return 'Basic Attack' plus the integer as the new name
        ...Object.keys(skill).filter(n => !n.includes("BATK")).map(n => `${n.split(" ")[0]} Attack`)
        //Do the same as the above but don't include the basic attacks, instead go for the finisher and
        //dive attacks. Split the strings and return the first word + 'Attacks' as the new name
      ];

      multipliers = Object.values(skill).map(n => valueParser(n))

      data = Object.fromEntries(
        names.map((key, i) => [key, multipliers[i]])
      );

      //Create a new dictionary using the new names and parsed multipliers
    }

    //console.log(data)
    return data
  }

  #nameParser(name, index){
    if(this.type == "Basic Attack"){
      if(name.includes("BATK"))
        return `Basic Attack ${index + 1}`
      else
        return `${name.split(" ")[0]} Attack`
    }
  }


}

export default Skill