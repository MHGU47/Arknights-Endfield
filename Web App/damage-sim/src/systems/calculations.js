class Calculations{
  constructor(loadouts, gearsets = null){
    //this.enemy = e
    this.loadouts = loadouts
    this.gearsets = gearsets
    this.damage = 0
    this.atk = 0
    this.will = 0

    this.buffs = 0
    this.multiplierGroup = 1 + this.buffs
    this.critMultiplier = 1// this._getCritMultipler()
    this.ampMultipler = 1
    this.staggerMultipler = 1
    this.finisherMultiplier = 1
    this.linkMultilpier = 1
    this.susceptibilityMultiplier = 1
    this.dmgTakenMultiplier = 1
    this.defenceMultiplier = 1
    this.resistanceMultiplier = 1
    this.atkPercent = 1
    this.atkFlat = 0

    let attribute_names = [
      "Main Attribute",
      "Secondary Attribute",
      "Agility",
      "Strength",
      "Will",
      "Intellect",
      "Critical Rate",
      "Critical Damage",
      "Attack",
      "Physical DMG Bonus",
      "Cryo Damage",
      "Heat Damage",
      "Electric Damage",
      "Nature Damage",
      "Basic Attack DMG Bonus",
      "Combo Skill DMG Bonus",
      "All Skill DMG Dealt Bonus",
      "Battle Skill DMG Bonus",
      "Ultimate DMG Bonus",
      "Ultimate Gain Efficiency",
      "Arts Intensity",
      "DMG Bonus vs. Staggered",
  ]
    
    this.attributeMap = Object.fromEntries(
      attribute_names.map(attr =>
      [attr, {"Flat": 0, "Percent": 0}]
      )
    )

    this.dualAttributes = {
        "Heat and Nature DMG Dealt Bonus": [
            this.attributeMap["Heat Damage"],
            this.attributeMap["Nature Damage"],
        ],
        "Cryo and Electric DMG Dealt Bonus": [
            this.attributeMap["Cryo Damage"],
            this.attributeMap["Electric Damage"],
        ],
    }
  }

  calculate(self, loadout, e){
    // Damage = Attack × BaseMultiplier × MultiplierGroup × CriticalMultiplier × AmpMultiplier × 
    // StaggerMultiplier × FinisherMultiplier × LinkMultiplier × WeakenMultiplier × SusceptibilityMultiplier ×
    // IncreasedDMGTakenMultiplier × DMGReductionMultiplier × ProtectionMultiplier × DefenseMultiplier ×
    // ResistanceMultiplier

    const op = loadout.operator
    let wpnAtk = loadout.weapon["Item"].levels[`Level ${loadout.weapon["Level"]}`]
    let specialBonus = 0 // Protocol Space bonuses
    this.attrBonus = 1 + (0.005 * self.mainAttrBonus) + (0.002 * self.secondaryAttrBonus)

    //Attack
    this.atk = Math.floor(((op.stats["Attack"] + wpnAtk) * self.atkPercent + self.atkFlat + specialBonus) * self.attrBonus)
    //atk = ((Character_ATK + Weapon_ATK) * (1 + %ATK) + Flat_ATK) * (1 + 0.5% * Primary + 0.2% * Secondary)

    // Base Multiplier
    // These are the attack modifiers -> 'Operator.basicAttack.basicAttacks.get("Attack 1")' for example

    let baseMulti = op.allSkills["Basic Attack"].basicAttacks["Level 9"]["Basic Attack 1"]

    let multiplierGroup = 1 + self._getBuffs(op, op.allSkills["Basic Attack"]) + 0.168 //TODO REMOVE LATER YVONNE TESTING
    /**
     * Multiplier Group
     * This multiplier group sums up many various damage increases that are described as "... DMG Bonus".
     * This includes:

     * Damage type specific increases, for example "Physical DMG Bonus"
     * Skill type specific increases, for example "Battle DMG Damage Bonus"
     * "DMG Bonus vs. Staggered"
     * "DMG Bonus"
     */
    

    //Crit Multiplier
    //critMultiplier = this.#calculateCrit(loadout)
    let critMultiplier = 1.5 //TODO REMOVE TEST

    let amp = 1 //this.#calculateAmp([loadout, loadout]) // TODO: Create function to get appropriate amp bonuses

    // #Amp Multiplier
    // # Amp can increase the damage dealt. All applicable bonuses are added together.
    // # Amp is usually only active for specific damage types.
    // # For example, Antal can apply Electric Amp and Heat Amp with his Ultimate.


    let staggerMultiplier = 1 //this.#getStaggerMultiplier(False)

    // Stagger Multiplier
    //  StaggerMultiplier={1.3 -> if the target is staggered, 1 -> if the target is not staggered}
    //  Most enemies have a certain amount of Stagger HP, represented as a bar underneath their health bar.
    //  Dealing Stagger fills the bar. Once the bar is filled, the enemy will be staggered and take increased
    //  damage.

    //finisherMultiplier = self._getFinisherMultiplier("Boss")
    let finisherMultiplier = 1

    // #Finisher Multiplier
    // # 1 if the attack is not a finisher,
    // # 1 if the target is an Common Enemy
    // # 1.25 if the target is an Advanced Enemy,
    // # 1.5 if the target is an Elite or Alpha Enemy,
    // # 1.75 if the target is an Boss Enemy
    // # The first basic attack against a staggered enemy becomes a Finisher. This finisher has a special
    // # multiplier that is tied to the specific enemy. Currently the values are the same for enemies of
    // # the same tier.

    let linkMultiplier = 1 //self._getLinkMultiplier()

    // #Link Multiplier
    // # LinkMultiplier={1+LinkBonus if the Skill used a Link buff,
    // # 1 if no Link buff is used
    // # Link increases the damage dealt by the next Battle Skill or Ultimate cast by the team.
    // # Link buffs can stack, but have deminishing returns:
    // # Link Bonus for Battle Skills: 30/45/60/75%
    // # Link Bonus for Ultimates: 20/30/40/50%

    let susceptibilityMultiplier = 1

    // #Susceptibility Multiplier
    // # SusceptibilityMultiplier=1+∑SusceptibilityEffects
    // # Susceptible can increase the damage taken. All applicable increases are added together.
    // # Susceptibility is usually only active for specific damage types. For example, Estella
    // # can apply Physical Susceptibility with her Combo Skill.

    let dmgTakenMultiplier = 1

    // # Increased DMG Taken Multiplier
    // # IncreasedDMGTakenMultiplier=1+∑IncreasedDMGTakenMultiplier
    // # This multiplier describes effects that state "increase DMG Taken" which are not
    // # Susceptibility effects. All applicable increases are added together. For example,
    // # the effects of Electrification, Breach and the Endministrator's Talent "Realspace Stasis"
    // # ("enemies suffer Physical DMG Taken +10%") are in this multiplier group.

    let defenceMultiplier = 100 / (100 + 100)

    // # Defence Multiplier
    // # Defence (enemies) = 100 / (100 + DEF) Enemy DEF is 100 by default
    

    let resistanceMultiplier = 1

    // # Resistance Multiplier
    // # ResistanceMultiplier=ResistanceMultiplier+CorrosionEffect
    // # This multiplier describes the effect gained from Agility and Intellect, as well as the
    // # elemental resistances of enemies. In-game these resistance values are shown as percentage
    // # points for Operators and rated with letters for enemies. Starting with 'D' for no resistance,
    // # or a 1.0 multiplier, 'C' for some resistance and so on. The accurate multipliers can be seen
    // # on the respective enemy pages. Corrosion takes effect in this multiplier.


    // # Physical Statuses, Arts Bursts and Arts Reactions

    // # Physical Status, Arts Burst and Arts Reaction are special sources of damage that will be
    // # explained in this section.

    // # Base Multiplier
    // # Lift and Knock Down: 120%
    // # Crush: 150% + 150% per Vulnerable stack
    // # Breach: 50% + 50% per Vulnerable stack
    // # Arts Burst: 160% (regardless of the number of Inflictions)
    // # Arts Reaction: 80% + 80% per infliction stack
    // # Shatter: 120% + 120% per Status Level
    // # Combustion DMG Over Time : 12% + 12% per Status Level

    // # In addition to the multipliers listed before, the effects are also increased by two more multipliers:

    // # Hidden Multiplier
    // # There is a hidden multiplier that increases the damage from Physical Statuses, Arts Bursts
    // # and Arts Reactions. This multiplier is dependent on the level of the Operator:

    // # For Physical Status:
    // # HiddenMultiplier=1+OperatorLevel−1/392

    // # For Arts Burst and Arts Reaction:
    // # HiddenMultiplier=1+OperatorLevel−1/196
    // # Arts Intensity Multiplier
    // # ArtsIntensityMultiplier=1+ArtsIntensity100
    // # Arts Intensity further increases the damage done by the various Physical Statuses, Arts Bursts
    // # and Arts Reactions. Each point of Arts Intensity increases the damage done by 1%.



    this.damage = this.atk * baseMulti * multiplierGroup * critMultiplier * amp * staggerMultiplier * finisherMultiplier
    this.damage *= linkMultiplier * susceptibilityMultiplier * dmgTakenMultiplier * defenceMultiplier * resistanceMultiplier
    this.damage *= 1.25
    this.damage = round(this.damage)
    print(this.damage)
    print(`Total Attack: ${this.atk}`)
  }

  #calculateAttack(op){
    this.atkFlat = this.attributeMap["Attack"]["Flat"]
		this.atkPercent = 1 + this.attributeMap["Attack"]["Percent"]
  }

  #calculateMainAttribute(op){
    let trust = 25 //# TODO TESTING REMOVE LATER
    this.mainAttrBonus = op.levels["Level 90"][op.mainAttr] + this.attributeMap["Main Attribute"]["Flat"]
    this.mainAttrBonus += this.attributeMap[op.mainAttr]["Flat"]

    this.mainAttrBonus += trust// #TODO ADD IN TRUST OPTION

    this.mainAttrBonus *= (1 + this.attributeMap["Main Attribute"]["Percent"])
  }

	#calculateSecondaryAttribute(op){
    this.secondaryAttrBonus = op.levels["Level 90"][op.secondaryAttr] + this.attributeMap["Secondary Attribute"]["Flat"]
		this.secondaryAttrBonus += this.attributeMap[op.secondaryAttr]["Flat"]
		this.secondaryAttrBonus *= (1 + this.attributeMap["Secondary Attribute"]["Percent"])
  }

  update(){
    this.#reset()

    this.loadouts.forEach(loadout => {
      //console.log(loadout)
      let allGear = loadout.gear
      Object.entries(allGear).forEach(gear => {
        if(gear.item != null){
          let levels = gear["levels"]
        }
      })
    });

			// for loadout in loadouts:
			// 	if loadout.operator != None:
			// 			allGear = loadout.allGear

			// 			for gear in allGear.values(): # Cycle through each gear piece
			// 				if gear["Item"] != None: # Check if a gear piece has been selected
			// 					levels = gear["Level"] if isinstance(gear["Item"], o.Weapon) else gear["Artificing Levels"]
			// 					ranks = gear["Stat Ranks"]if isinstance(gear["Item"], o.Weapon) else None

			// 					for i, stat in enumerate(gear["Item"].stats.values()): # Cycle through each stat in gear
			// 						if type(stat) != list and stat.attribute != None: # Make sure it has an attribute
			// 							# Stat checking

			// 							if not isinstance(gear["Item"], o.Gear):
			// 								value = stat.ranks[f"Rank {ranks[i]}"]
			// 							else:
			// 								value = stat.stats[levels[i]]

			// 							if stat.attribute in self.attributeMap:
			// 								self._filter(self.attributeMap[stat.attribute], value)
			// 							elif stat.attribute in self.dualAttributes:
			// 								for target in self.dualAttributes[stat.attribute]:
			// 									self._filter(target, value)
			// 			self._calculateMainAttribute(loadout.operator)
			// 			self._calculateSecondaryAttribute(loadout.operator)
			// 			self._calculateAttack(loadout.operator)
			// 			self.calculate(loadout, enemy)
  }
  #reset(){
    // for name, vals in self.attributeMap.items():
    //   for n in vals.keys():
    //     self.attributeMap[name][n] = 0
  }
}

export default Calculations