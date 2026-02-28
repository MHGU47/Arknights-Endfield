import math
import operator_ as o

class Calculations:
		def __init__(self):
				self.buffs = 0
				self.multiplierGroup = 1 + self.buffs
				self.critMultiplier = 1# self._getCritMultipler()
				self.ampMultipler = 1
				self.staggerMultipler = 1
				self.finisherMultiplier = 1
				self.linkMultilpier = 1
				self.susceptibilityMultiplier = 1
				self.dmgTakenMultiplier = 1
				self.defenceMultiplier = 1
				self.resistanceMultiplier = 1
				self.atk = 0
				
		def calculate(self, loadout: o.Loadout):
				#atk = ((Character_ATK + Weapon_ATK) * (1 + %ATK) + Flat_ATK) * (1 + 0.5% * Primary + 0.2% * Secondary)

				# Damage = Attack × BaseMultiplier × MultiplierGroup × CriticalMultiplier × AmpMultiplier × 
				# StaggerMultiplier × FinisherMultiplier × LinkMultiplier × WeakenMultiplier × SusceptibilityMultiplier ×
				# IncreasedDMGTakenMultiplier × DMGReductionMultiplier × ProtectionMultiplier × DefenseMultiplier ×
				# ResistanceMultiplier

				print("Main Calc")
				self._calculateCriticalMultipler(loadout)

				op = loadout.operator
				wpnAtk = loadout.weapon["Item"].levels[f"Level {loadout.weapon["Level"]}"]
				percentBonus = 1
				flatBonus = 0
				specialBonus = 0
				#attributeBonus = 1 + (0.005 * op.mainAttr["Value"]) + (0.002 * op.secondaryAttr["Value"])
				self.attrBonus = 1 + (0.005 * self.mainAttrBonus) + (0.002 * op.secondaryAttr["Value"])

				#Attack
				atk = math.floor(((op.ATK + wpnAtk) * percentBonus + flatBonus + specialBonus) * self.attrBonus)

				#Base Multiplier
				# These are the attack modifiers -> 'Operator.basicAttack.basicAttacks.get("Attack 1")' for example

				baseMulti = op.allSkills[0].basicAttacks.get("Basic Attack 1", 0)

				#Multiplier Group
				# This multiplier group sums up many various damage increases that are described as "... DMG Bonus".
				# This includes:

				# Damage type specific increases, for example "Physical DMG Bonus"
				# Skill type specific increases, for example "Battle DMG Damage Bonus"
				# "DMG Bonus vs. Staggered"
				# "DMG Bonus"

				buffs = 0
				multiplierGroup = 1 + buffs

				#Crit Multiplier

				multi = 0
				dmg = 1
				critMultiplier = 1 + (multi * dmg)

				#Amp Multiplier
				# Amp can increase the damage dealt. All applicable bonuses are added together.
				# Amp is usually only active for specific damage types.
				# For example, Antal can apply Electric Amp and Heat Amp with his Ultimate.

				amp = 1 + 0 # TODO: Create function to get appropriate amp bonuses

				#Stagger Multiplier
				# StaggerMultiplier={1.3 -> if the target is staggered, 1 -> if the target is not staggered}
				# Most enemies have a certain amount of Stagger HP, represented as a bar underneath their health bar.
				# Dealing Stagger fills the bar. Once the bar is filled, the enemy will be staggered and take increased
				# damage.

				staggerMultiplier = 1

				#Finisher Multiplier
				# 1 if the attack is not a finisher,
				# 1 if the target is an Common Enemy
				# 1.25 if the target is an Advanced Enemy,
				# 1.5 if the target is an Elite or Alpha Enemy,
				# 1.75 if the target is an Boss Enemy
				# The first basic attack against a staggered enemy becomes a Finisher. This finisher has a special
				# multiplier that is tied to the specific enemy. Currently the values are the same for enemies of
				# the same tier.

				finisherMultiplier = 1

				#Link Multiplier
				# LinkMultiplier={1+LinkBonus if the Skill used a Link buff,
				# 1 if no Link buff is used
				# Link increases the damage dealt by the next Battle Skill or Ultimate cast by the team.
				# Link buffs can stack, but have deminishing returns:
				# Link Bonus for Battle Skills: 30/45/60/75%
				# Link Bonus for Ultimates: 20/30/40/50%

				linkMultilpier = 1

				#Susceptibility Multiplier
				# SusceptibilityMultiplier=1+∑SusceptibilityEffects
				# Susceptible can increase the damage taken. All applicable increases are added together.
				# Susceptibility is usually only active for specific damage types. For example, Estella
				# can apply Physical Susceptibility with her Combo Skill.

				susceptibilityMultiplier = 1

				# Increased DMG Taken Multiplier
				# IncreasedDMGTakenMultiplier=1+∑IncreasedDMGTakenMultiplier
				# This multiplier describes effects that state "increase DMG Taken" which are not
				# Susceptibility effects. All applicable increases are added together. For example,
				# the effects of Electrification, Breach and the Endministrator's Talent "Realspace Stasis"
				# ("enemies suffer Physical DMG Taken +10%") are in this multiplier group.

				dmgTakenMultiplier = 1

				# Defence Multiplier
				# Defence (enemies) = 100 / (100 + DEF) Enemy DEF is 100 by default

				defenceMultiplier = 1

				# Resistance Multiplier
				# ResistanceMultiplier=ResistanceMultiplier+CorrosionEffect
				# This multiplier describes the effect gained from Agility and Intellect, as well as the
				# elemental resistances of enemies. In-game these resistance values are shown as percentage
				# points for Operators and rated with letters for enemies. Starting with 'D' for no resistance,
				# or a 1.0 multiplier, 'C' for some resistance and so on. The accurate multipliers can be seen
				# on the respective enemy pages. Corrosion takes effect in this multiplier.

				resistanceMultiplier = 1

				# Physical Statuses, Arts Bursts and Arts Reactions

				# Physical Status, Arts Burst and Arts Reaction are special sources of damage that will be
				# explained in this section.

				# Base Multiplier
				# Lift and Knock Down: 120%
				# Crush: 150% + 150% per Vulnerable stack
				# Breach: 50% + 50% per Vulnerable stack
				# Arts Burst: 160% (regardless of the number of Inflictions)
				# Arts Reaction: 80% + 80% per infliction stack
				# Shatter: 120% + 120% per Status Level
				# Combustion DMG Over Time : 12% + 12% per Status Level

				# In addition to the multipliers listed before, the effects are also increased by two more multipliers:

				# Hidden Multiplier
				# There is a hidden multiplier that increases the damage from Physical Statuses, Arts Bursts
				# and Arts Reactions. This multiplier is dependent on the level of the Operator:

				# For Physical Status:
				# HiddenMultiplier=1+OperatorLevel−1/392

				# For Arts Burst and Arts Reaction:
				# HiddenMultiplier=1+OperatorLevel−1/196
				# Arts Intensity Multiplier
				# ArtsIntensityMultiplier=1+ArtsIntensity100
				# Arts Intensity further increases the damage done by the various Physical Statuses, Arts Bursts
				# and Arts Reactions. Each point of Arts Intensity increases the damage done by 1%.



				damage = atk * baseMulti * multiplierGroup * critMultiplier * amp * staggerMultiplier * finisherMultiplier
				damage *= linkMultilpier * susceptibilityMultiplier * dmgTakenMultiplier * defenceMultiplier * resistanceMultiplier
				print(math.floor(damage))

		def update(self, loadouts):
			totalMainAttribute = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalSecondaryAttribute = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalAgility = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalStrength = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalWill = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalIntellect = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalCritRate = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalCritDmg = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalPhysDmg = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalCryoDmg = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalElectricDmg = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalHeatDmg = {
				"Flat" : 0,
				"Percent" : 0
      }
			totalNatureDmg = {
				"Flat" : 0,
				"Percent" : 0
      }
			
			for loadout in loadouts:
				#op = loadout.operator
				if loadout.operator != None:
						allGear = loadout.allGear

						for gear in allGear: # Cycle through each gear piece
							if gear["Item"] != None: # Check if a gear piece has been selected
								lvl = gear["Level"]

								for stat in gear["Item"].stats.values(): # Cycle through each stat in gear
									if type(stat) != list and stat.attribute != None: # Make sure it has an attribute
										# Stat checking
										if stat.attribute == "Main Attribute":
											if not isinstance(gear["Item"], o.Gear):
												self._filter(totalMainAttribute, stat.ranks[f"Rank {lvl}"])
											else:
												self._filter(totalMainAttribute, stat.stats[lvl])
										elif stat.attribute == "Agility":
											if not isinstance(gear["Item"], o.Gear):
												self._filter(totalAgility, stat.ranks[f"Rank {lvl}"])
											else:
												self._filter(totalAgility, stat.stats[lvl])
										elif stat.attribute == "Strength":
											if not isinstance(gear["Item"], o.Gear):
												self._filter(totalStrength, stat.ranks[f"Rank {lvl}"])
											else:
												self._filter(totalStrength, stat.stats[lvl])
										elif stat.attribute == "Will":
											if not isinstance(gear["Item"], o.Gear):
												self._filter(totalWill, stat.ranks[f"Rank {lvl}"])
											else:
												self._filter(totalWill, stat.stats[lvl])
										elif stat.attribute == "Intellect":
											if not isinstance(gear["Item"], o.Gear):
												self._filter(totalIntellect, stat.ranks[f"Rank {lvl}"])
											else:
												self._filter(totalIntellect, stat.stats[lvl])
										elif stat.attribute == "Secondary Attribute":
											if not isinstance(gear["Item"], o.Gear):
												self._filter(totalSecondaryAttribute, stat.ranks[f"Rank {lvl}"])
											else:
												self._filter(totalSecondaryAttribute, stat.stats[lvl])
										elif stat.attribute == "Critical Rate":
											if not isinstance(gear["Item"], o.Gear):
												self._filter(totalCritRate, stat.ranks[f"Rank {lvl}"])
											else:
												self._filter(totalCritRate, stat.stats[lvl])

						self._calculateMainAttribute(loadout.operator, totalMainAttribute)

		def _filter(self, data, stat):
			if isinstance(stat, int): data["Flat"] += stat
			else: data["Percent"] += stat
		
		def _calculateMainAttribute(self, op: o.Operator, stats: dict):
			self.mainAttrBonus = op.mainAttr["Value"] + stats["Flat"]
			self.mainAttrBonus *= (1 + stats["Percent"])
		
		def _calculateCriticalMultipler(self, loadout : o.Loadout):
			temp = 1
			for s, val in loadout.weapon["Item"].stats.items():
				if val.attribute == "Critical Rate":
					temp = val.ranks["Rank 1"]

			if "Critical Rate" in [val.attribute for s, val in loadout.weapon["Item"].stats.items()]:
					print(f"Crit modifier found: ")
			self.critMultiplier = temp
			return
		