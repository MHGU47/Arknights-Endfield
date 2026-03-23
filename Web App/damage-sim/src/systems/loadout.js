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
          "Passive" : 0
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
  }
}

export default Loadout