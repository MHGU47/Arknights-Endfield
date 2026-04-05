class Loadout{
  constructor(operator = null, index = null){
    this.operator = operator
    this.index = index
    this.gear = {
      weapon : {
        item : null,
        levels : {
          "Level" : 1,
          "Stat 1" : 0,
          "Stat 2" : 0,
          "Passive Attribute" : 0
        }
      },
      body : {
        item : null,
        levels : {
          "Stat 1" : 0,
          "Stat 2" : 0,
          "Stat 3" : 0
        }
      },
      gloves : {
        item : null,
        levels : {
          "Stat 1" : 0,
          "Stat 2" : 0,
          "Stat 3" : 0
        }
      },
      kit1 : {
        item : null,
        levels : {
          "Stat 1" : 0,
          "Stat 2" : 0,
          "Stat 3" : 0
        }
      },
      kit2 : {
        item : null,
        levels : {
          "Stat 1" : 0,
          "Stat 2" : 0,
          "Stat 3" : 0
        }
      },
    }

    this.calculations = {
      "Will" : 0,
      "Intellect" : 0,
      "Strength" : 0,
      "Agiliy" : 0,
      "Attack" : 0,
      "Crit Rate" : 5, // 5% is the base rate
      "Crit DMG" : 50, // 50% is the base value
    }
    this.selected = false
  }

  getLevel(type, level = 0, stat = 0){
    if(type == "weapon"){
      return this.gear[type].levels[`Level ${level}`]
    }
    return this.gear[type].levels[`Stat ${stat}`]
  }

  setGear(gear, slot){
    console.log(slot)
    if(!slot.toLowerCase().includes("kit")){
      this.gear[slot.toLowerCase()].item = gear
      console.log(`${slot} changed`)
    }
    else {
      if(slot.includes("1")) this.gear.kit1.item = gear
      else this.gear.kit2.item = gear
    }
  }
}

export default Loadout