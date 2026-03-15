from typing import Dict, List, Optional

def parser(val):
    if isinstance(val, str) and "%" in val:
        num = float(val.replace("%", "")) / 100
    else:
        try:
            num = float(val)
        except (TypeError, ValueError):
            return val
        
    if num.is_integer():
        return int(num)
    return num

def parseSkillOLD(skills: Dict[str, Dict[str, str]], type_: str) -> Dict[str, Dict[str, str]]:
    """
    Gets skill values and attributes for operators
    """
    #grouped: Dict[str, Dict[str, float]] = {}

    if type_ == "Basic Attack":
        names = [f"Basic Attack {i + 1}" for i, n in enumerate(skills) if "BATK" in n]
        names.extend([f"{n.split()[0]} Attack" for n in skills if "BATK" not in n])

        return{names[i] : parser(val) for i, val in enumerate(skills.values())}
    
    # elif type_ == "Battle Skill":
    #     return {name : parser(val) for name, val in skills.items()}
    # elif type_ == "Combo Skill":
    #     return {name : parser(val) for name, val in skills.items()}

    else:
        return {name : parser(val) for name, val in skills.items()}
    # for key, val in skills.items():
    #     # Remove any bracketed suffix for grouping
    #     base = key.split('[')[0].strip()  # "Critical Multipler [L]" -> "Critical Multipler"
    #     if base not in grouped:
    #         grouped[base] = {}
    #     grouped[base][key] = parser(val)  # parse the value
    # return grouped

def parseSkill(skills: Dict[str, Dict[str, str]], type_: str) -> Dict[str, Dict[str, str]]:
    """
    Gets skill values and attributes for operators
    """
    
    data = {}
    if type_ == "Basic Attack":
        for level, values in skills.items():
          names = [f"Basic Attack {i + 1}" for i, n in enumerate(values) if "BATK" in n]
          names.extend([f"{n.split()[0]} Attack" for n in values if "BATK" not in n])

          data.update({level : {names[i] : parser(val) for i, val in enumerate(values.values())}})
        return data


    else:
        return {name : parser(val) for name, val in skills.items()}


def parseWeapon(stat: Dict[str, str], type_: str):
    if type_ == "Weapon Stat":
        return _parseWeaponStat(stat)
    else:
        return _parsePassiveAttribute(stat)

def _parseWeaponStat(stat: Dict[str, str]) -> Dict[str, str]:
    """
    Gets stat values and attributes for weapons e.g. Critical Rate Boost [L] - > Dict[] of
    the stat

    Returns:
    {
        attribute: attribute name,
        rank: value,
    }
    """

    #return {name : parser(val) for name, val in skill.items()}
    parsed: Dict[str, Dict[str, float]] = {}
    
    for rank, attr in stat.items():
        # Remove any bracketed suffix for grouping
        base = attr.split('+')[0].strip()
        val = attr.split('+')[1].strip('+')  # "Critical Multipler [L]" -> "Critical Multipler"
        
        temp = ""
        for word in base.split():
            temp += word.capitalize() + " "
        parsed["Attribute"] = temp.strip()
        parsed[rank] = parser(val)  # parse the value
    return parsed

def _parsePassiveAttribute(stat: Dict[str, str]) -> Dict[str, str]:
    """
    Gets stat values and attributes for passive attributes e.g. Twilight: Blazing Wall

    Returns:
    {
        attribute: attribute name,
        rank: value,
    }
    """

    return {rank : s for rank, s in stat.items()}
    parsed: Dict[str, Dict[str, float]] = {}
    
    for rank, attr in stat.items():
        # Remove any bracketed suffix for grouping
        base = attr.split('+')[0].strip()
        val = attr.split('+')[1].strip('+')  # "Critical Multipler [L]" -> "Critical Multipler"
        parsed["Attribute"] = base
        parsed[rank] = parser(val)  # parse the value
    return parsed

def parseStat(stats: Dict[str, str]) -> Dict[str, str]:
    """
    Gets stat values and attributes for weapons e.g. Critical Rate Boost [L] - > Dict[] of
    the stat

    Returns:
    {
        attribute: attribute name,
        rank: value,
    }
    """

    #return {name : parser(val) for name, val in skill.items()}
    parsed: Dict[str, Dict[str, float]] = {}
    
    for name, values in stats.items():
        parsed[name] = [parser(value.strip('+')) for value in values]
    return parsed