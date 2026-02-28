import utils as u
import copy
from typing import Dict, List, Optional

class Loadout:
    """Stores all data for a single operator"""
    def __init__(self):
        self.operator = None

        self._setAllGear()
        
        self.rotation = [None] * 5  # 5 rotation slots
    
    def _setAllGear(self):
        self.weapon = {
            "Item": None,
            "Level": 0
        }
        self.armour = {
            "Item": None,
            "Level": 0
        }
        self.gloves = {
            "Item": None,
            "Level": 0
        }
        self.kit1 = {
            "Item": None,
            "Level": 0
        }
        self.kit2 = {
            "Item": None,
            "Level": 0
        }
        self.allGear = [
            self.weapon,
            self.armour,
            self.gloves,
            self.kit1,
            self.kit2
        ]

    def update_level(self, slot, value):
        if slot == "weapon":
            self.weapon["Level"] = value
        elif slot == "armour":
            self.armour["Level"] = value
        elif slot == "gloves":
            self.gloves["Level"] = value
        elif slot == "kit1":
            self.kit1["Level"] = value
        elif slot == "kit2":
            self.kit2["Level"] = value

class Operator:
    print("**operator.py loaded**")
    """Stores all data for a single operator"""
    def __init__(self, d):
        (name, data), = d.items()
        self.name = name
        self._setData(data)
    
    def _setData(self, data):
        self.data = data
        
        self._type = data.get("type")
        self._stats = data.get("stats")
        self._skills = data.get("skills")
        self._talents = data.get("talents")

        self._setStats()
        self._setSkills()
        self._setTalents()
    
    def _setStats(self):
        self.HP = int(self._stats.get("HP"))
        self.ATK = int(self._stats.get("Attack"))
        self.STR = int(self._stats.get("Strength"))
        self.AGI = int(self._stats.get("Agility"))
        self.INT = int(self._stats.get("Intellect"))
        self.WILL = int(self._stats.get("Will"))

        self.WPN = self._type.get("Weapon Type")
        self.CLS = self._type.get("Class")
        self.ELM = self._type.get("Element")

        self.mainAttr = {
            "Attribute" : self._stats.get("Main Attribute"),
            "Value" : int(self._stats.get(self._stats.get("Main Attribute")))
        }

        self.secondaryAttr = {
            "Attribute" : self._stats.get("Secondary Attribute"),
            "Value" : int(self._stats.get(self._stats.get("Secondary Attribute")))
        }

    def _setSkills(self):
        self.basicAttack = Skill(self._skills[0], "Basic Attack")
        self.battleSkill = Skill(self._skills[1], "Battle Skill")
        self.comboSkill = Skill(self._skills[2], "Combo Skill")
        self.ultimate = Skill(self._skills[3], "Ultimate")

        self.allSkills = [
            self.basicAttack,
            self.battleSkill,
            self.comboSkill,
            self.ultimate
        ]

    def _setTalents(self):#TODO: Consider making this it's own class to allow custom functionality
        self.talents = {
            d["name"]: d["description"]
            for d in self._talents
            if d.get("type") == "Combat Talent"
        }

class Skill:
    def __init__(self, data: dict, type_: str):
        # Default skill if data is empty
        self.name, tempData = next(iter(data.items()), ("Default Skill", {"multipliers": {}}))
        self.type = type_
        self.data = self._setSkill(tempData)

    def _setSkill(self, data: dict):
        self.description = data.get("description", "")

        multipliers = data.get("multipliers", {})
        if self.type in ["Weapon Stat", "Passive Attribute"]:
            multipliers = data

        # Parse skill using type          
        parsed = {}
        if self.type in ["Weapon Stat", "Passive Attribute"]:
            parsed = u.parseWeapon(multipliers, self.type)
        else:
            parsed = u.parseSkill(multipliers, self.type)

        # Store Skill based on type
        if self.type == "Basic Attack":
            self.basicAttacks = parsed

        elif self.type == "Battle Skill":
            self.battleSkill = {base: vals for base, vals in parsed.items()}

        elif self.type == "Combo Skill":
            self.comboSkill = {base: vals for base, vals in parsed.items()}

        elif self.type == "Ultimate":
            self.ultimate = {base: vals for base, vals in parsed.items()}

        else: # Weapon Stats
            self.weaponStats = parsed
            self.attribute = parsed.get("Attribute")
            self.ranks = {rank : val for rank, val in parsed.items() if "Rank" in rank}
            #TODO: Change 'parseWeapon' so that it returns a dict containing attribure and rank. This saves
            #      having to create the dicts here

            # if self.type != "Passive Attribute":
            #     self.weaponStats = parsed
            #     self.attribute = parsed.get("Attribute")
            #     self.ranks = {rank : val for rank, val in parsed.items() if "Rank" in rank}
            #     #TODO: Change 'parseWeaponSkill' so that it returns a dict containing attribure and rank. This saves
            #     #      having to create the dicts here
            # else:
            #     self.weaponStats = parsed
            #     self.attribute = parsed.get("Attribute")
            #     self.ranks = {rank : val for rank, val in parsed.items() if "Rank" in rank}
            #     #TODO: Change 'parseWeaponSkill' so that it returns a dict containing attribure and rank. This saves
            #     #      having to create the dicts here

        return data
    
    
class Gear:
    def __init__(self, d):
        (name, data), = d.items()
        self.name = name
        self.type = data["type"]
        self.imgPath = data["image_path"]
        self._setStats(data)

    def _setStats(self, stats):
        self.defStats = {name : statList for s in stats["stats"] for name, statList in s.items()}
        temp = copy.deepcopy(self.defStats)
        temp.pop("Defense")

        self.stats = {name : Stat({name : data}) for i, (name, data) in enumerate(temp.items())}

class Weapon:
    def __init__(self, d):
        (name, data), = d.items()
        self.name = name
        self.type = data["type"]
        self.imgPath = data["image_path"]
        self._setLevels(data["levels"])
        self._setStats(data["stats"])

    def _setLevels(self, levels):
        self.levels = {level : int(atk) for level, atk in levels.items()}

    def _setStats(self, stats: dict):       
        self.stats = {f"Stat {i + 1}" : Skill({name : val}, "Weapon Stat")
                      for i, (name, val) in enumerate(stats.items())
                      if ":" not in name
                      }
        self.stats.update({"Passive Attribute" : Skill({name : val}, "Passive Attribute")
                           for name, val in stats.items()
                           if ":" in name
                           })

class Stat:
    def __init__(self, data: dict):
        (self.attribute, stats), = data.items()
        self.levels = [val for val in stats]
        self.stats = [u.parser(val) for val in stats]