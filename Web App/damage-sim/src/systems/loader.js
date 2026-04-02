import Operator from "./operator"
import Weapon from "./weapon"
import Gear from "./gear"
import Loadout from "./loadout"
import Calculations from "./calculations"

import operatorData from "../Data/Stats/warfarin_operators.json"
import weaponData from "../Data/Stats/weapons.json"
import gearData from "../Data/Stats/golden_gear.json"

import { images } from "./imageLoader";

export const db = {
  operators: operatorData.map(o => new Operator(o)),
  weapons: weaponData.map(w => new Weapon(w, images["weapons"][Object.keys(w)[0]])),
  gear: gearData.map(g => new Gear(g, images["gear"][g.name])),
  images: images,
  loadouts: Array.from({ length: 4 }, (_, i) => new Loadout(new Operator(operatorData[i]), i))
}

export const calc = new Calculations(db.loadouts)