import Operator from "./operator"
import Weapon from "./weapon"
import Gear from "./gear"
import Loadout from "./loadout"

import operatorData from "../Data/Stats/warfarin_operators.json"
import weaponData from "../Data/Stats/weapons.json"
import gearData from "../Data/Stats/golden_gear.json"

import { images } from "./imageLoader";

export const db = {
  operators: operatorData.map(o => new Operator(o, images["operators"][o.name])),
  weapons: weaponData.map(w => new Weapon(w, images["gear"][w.name])),
  gear: gearData.map(g => new Gear(g, images["gear"][g.name])),
  images: images,
  loadouts: Array.from({ length: 4 }, (_, i) => new Loadout(new Operator(operatorData[i], i), ""))
}