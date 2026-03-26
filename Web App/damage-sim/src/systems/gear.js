import { valueParser } from "./utils"
class Gear{
  constructor(gearData, image){
    this.name = gearData.name
    this.type = gearData.type
    this.image = image
    //this.#parseStats(data)
    //this.statClass = new Stat(gearData.stats)


    this.stats = Object.fromEntries(
      Object.entries(Object.assign({}, ...gearData.stats)).map(([key, value]) => [
        key,
        new Stat(key, value)
      ])
    );
  }

  #parseStats(data){
    this.stats = Object.fromEntries(

    )
  }

  // def _setStats(self, stats):
  //       self.defStats = {name : statList for s in stats["stats"] for name, statList in s.items()}
  //       temp = copy.deepcopy(self.defStats)
  //       temp.pop("Defense")

  //       self.stats = {name : Stat({name : data}) for i, (name, data) in enumerate(temp.items())}
}

class Stat {
  constructor(attribute, stats) {
    this.attribute = attribute;

    // stats is already an array
    this.levels = stats;

    // Transform values directly
    this.values = Object.values(stats).map(o => valueParser(o));
  }
}
export default Gear