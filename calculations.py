import math
import operator_ as o
import itertools
import enemy as e

class Calculations:
		def __init__(self, data):
				self.enemy = e
				self.gearsets = data
				self.damage = 0
				self.atk = 0
				self.will = 0

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
				self.atkPercent = 1
				self.atkFlat = 0

				attribute_names = [
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
				
				self.attributeMap = {name: self._setAttribute() for name in attribute_names}

				self.dualAttributes = {
						"Heat and Nature DMG Dealt Bonus": [
								self.attributeMap["Heat Damage"],
								self.attributeMap["Nature Damage"],
						],
						"Cryo and Electric DMG Dealt Bonus": [
								self.attributeMap["Cryo Damage"],
								self.attributeMap["Electric Damage"],
						],
				}
				
		def calculate(self, loadout: o.Loadout, e: e):
				# Damage = Attack × BaseMultiplier × MultiplierGroup × CriticalMultiplier × AmpMultiplier × 
				# StaggerMultiplier × FinisherMultiplier × LinkMultiplier × WeakenMultiplier × SusceptibilityMultiplier ×
				# IncreasedDMGTakenMultiplier × DMGReductionMultiplier × ProtectionMultiplier × DefenseMultiplier ×
				# ResistanceMultiplier

				print("Main Calc")

				op = loadout.operator
				wpnAtk = loadout.weapon["Item"].levels[f"Level {loadout.weapon["Level"]}"]
				specialBonus = 0 # Protocol Space bonuses
				self.attrBonus = 1 + (0.005 * self.mainAttrBonus) + (0.002 * self.secondaryAttrBonus)

				#Attack
				self.atk = math.floor(((op.stats["Attack"] + wpnAtk) * self.atkPercent + self.atkFlat + specialBonus) * self.attrBonus)
				#atk = ((Character_ATK + Weapon_ATK) * (1 + %ATK) + Flat_ATK) * (1 + 0.5% * Primary + 0.2% * Secondary)

				#Base Multiplier
				# These are the attack modifiers -> 'Operator.basicAttack.basicAttacks.get("Attack 1")' for example

				baseMulti = op.allSkills["Basic Attack"].basicAttacks["Level 9"]["Basic Attack 1"]

				multiplierGroup = 1 + self._getBuffs(op, op.allSkills["Basic Attack"]) + 0.168 #TODO REMOVE LATER YVONNE TESTING
				"""
				#Multiplier Group
				# This multiplier group sums up many various damage increases that are described as "... DMG Bonus".
				# This includes:

				# Damage type specific increases, for example "Physical DMG Bonus"
				# Skill type specific increases, for example "Battle DMG Damage Bonus"
				# "DMG Bonus vs. Staggered"
				# "DMG Bonus"
				"""

				#Crit Multiplier
				#critMultiplier = self._calculateCrit(loadout)
				critMultiplier = 1.5 #TODO REMOVE TEST

				amp = self._calculateAmp([loadout, loadout]) # TODO: Create function to get appropriate amp bonuses
				"""
				#Amp Multiplier
				# Amp can increase the damage dealt. All applicable bonuses are added together.
				# Amp is usually only active for specific damage types.
				# For example, Antal can apply Electric Amp and Heat Amp with his Ultimate.
				"""

				staggerMultiplier = self._getStaggerMultiplier(False)
				"""
				#Stagger Multiplier
				# StaggerMultiplier={1.3 -> if the target is staggered, 1 -> if the target is not staggered}
				# Most enemies have a certain amount of Stagger HP, represented as a bar underneath their health bar.
				# Dealing Stagger fills the bar. Once the bar is filled, the enemy will be staggered and take increased
				# damage.
				"""

				#finisherMultiplier = self._getFinisherMultiplier("Boss")
				finisherMultiplier = 1
				"""
				#Finisher Multiplier
				# 1 if the attack is not a finisher,
				# 1 if the target is an Common Enemy
				# 1.25 if the target is an Advanced Enemy,
				# 1.5 if the target is an Elite or Alpha Enemy,
				# 1.75 if the target is an Boss Enemy
				# The first basic attack against a staggered enemy becomes a Finisher. This finisher has a special
				# multiplier that is tied to the specific enemy. Currently the values are the same for enemies of
				# the same tier.
				"""

				linkMultiplier = self._getLinkMultiplier()
				"""
				#Link Multiplier
				# LinkMultiplier={1+LinkBonus if the Skill used a Link buff,
				# 1 if no Link buff is used
				# Link increases the damage dealt by the next Battle Skill or Ultimate cast by the team.
				# Link buffs can stack, but have deminishing returns:
				# Link Bonus for Battle Skills: 30/45/60/75%
				# Link Bonus for Ultimates: 20/30/40/50%
				"""

				susceptibilityMultiplier = 1
				"""
				#Susceptibility Multiplier
				# SusceptibilityMultiplier=1+∑SusceptibilityEffects
				# Susceptible can increase the damage taken. All applicable increases are added together.
				# Susceptibility is usually only active for specific damage types. For example, Estella
				# can apply Physical Susceptibility with her Combo Skill.
				"""

				dmgTakenMultiplier = 1
				"""
				# Increased DMG Taken Multiplier
				# IncreasedDMGTakenMultiplier=1+∑IncreasedDMGTakenMultiplier
				# This multiplier describes effects that state "increase DMG Taken" which are not
				# Susceptibility effects. All applicable increases are added together. For example,
				# the effects of Electrification, Breach and the Endministrator's Talent "Realspace Stasis"
				# ("enemies suffer Physical DMG Taken +10%") are in this multiplier group.
				"""

				defenceMultiplier = 100 / (100 + 100)
				"""
				# Defence Multiplier
				# Defence (enemies) = 100 / (100 + DEF) Enemy DEF is 100 by default
				"""
				

				resistanceMultiplier = 1
				"""
				# Resistance Multiplier
				# ResistanceMultiplier=ResistanceMultiplier+CorrosionEffect
				# This multiplier describes the effect gained from Agility and Intellect, as well as the
				# elemental resistances of enemies. In-game these resistance values are shown as percentage
				# points for Operators and rated with letters for enemies. Starting with 'D' for no resistance,
				# or a 1.0 multiplier, 'C' for some resistance and so on. The accurate multipliers can be seen
				# on the respective enemy pages. Corrosion takes effect in this multiplier.
				"""

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



				self.damage = self.atk * baseMulti * multiplierGroup * critMultiplier * amp * staggerMultiplier * finisherMultiplier
				self.damage *= linkMultiplier * susceptibilityMultiplier * dmgTakenMultiplier * defenceMultiplier * resistanceMultiplier
				self.damage *= 1.25
				self.damage = round(self.damage)
				print(self.damage)
				print(f"Total Attack: {self.atk}")

		def update(self, loadouts, enemy):
			self._reset()

			for loadout in loadouts:
				if loadout.operator != None:
						allGear = loadout.allGear

						for gear in allGear.values(): # Cycle through each gear piece
							if gear["Item"] != None: # Check if a gear piece has been selected
								levels = gear["Level"] if isinstance(gear["Item"], o.Weapon) else gear["Artificing Levels"]
								ranks = gear["Stat Ranks"]if isinstance(gear["Item"], o.Weapon) else None

								for i, stat in enumerate(gear["Item"].stats.values()): # Cycle through each stat in gear
									if type(stat) != list and stat.attribute != None: # Make sure it has an attribute
										# Stat checking

										if not isinstance(gear["Item"], o.Gear):
											value = stat.ranks[f"Rank {ranks[i]}"]
										else:
											value = stat.stats[levels[i]]

										if stat.attribute in self.attributeMap:
											self._filter(self.attributeMap[stat.attribute], value)
										elif stat.attribute in self.dualAttributes:
											for target in self.dualAttributes[stat.attribute]:
												self._filter(target, value)
						self._calculateMainAttribute(loadout.operator)
						self._calculateSecondaryAttribute(loadout.operator)
						self._calculateAttack(loadout.operator)
						self.calculate(loadout, enemy)

		def _reset(self):
			for name, vals in self.attributeMap.items():
				for n in vals.keys():
					self.attributeMap[name][n] = 0

		def _setAttribute(self):
			return {"Flat": 0, "Percent": 0}

		def _filter(self, data, stat):
			if isinstance(stat, int): data["Flat"] += stat
			else: data["Percent"] += stat
		
		def _calculateMainAttribute(self, op: o.Operator):
			trust = 25 # TODO TESTING REMOVE LATER
			self.mainAttrBonus = op.levels["Level 90"][op.mainAttr] + self.attributeMap["Main Attribute"]["Flat"]
			self.mainAttrBonus += self.attributeMap[op.mainAttr]["Flat"]

			self.mainAttrBonus += trust #TODO ADD IN TRUST OPTION

			self.mainAttrBonus *= (1 + self.attributeMap["Main Attribute"]["Percent"])

		def _calculateSecondaryAttribute(self, op: o.Operator):
			self.secondaryAttrBonus = op.levels["Level 90"][op.secondaryAttr] + self.attributeMap["Secondary Attribute"]["Flat"]
			self.secondaryAttrBonus += self.attributeMap[op.secondaryAttr]["Flat"]
			self.secondaryAttrBonus *= (1 + self.attributeMap["Secondary Attribute"]["Percent"])

		def _calculateWill(self, op: o.Operator):
			self.will = op.levels["Level 90"]["Will"] + self.attributeMap["Will"]["Flat"]
			self.will *= (1 + self.attributeMap["Will"]["Percent"])
		
		def _calculateCrit(self, loadout : o.Loadout):
			rate = 0.05
			dmg = 0.5
			ranks = loadout.allGear["weapon"]["Stat Ranks"]
			for gear in loadout.allGear.values():
				if gear["Item"] != None:
					for i, val in enumerate(gear["Item"].stats.values()):
						if val.attribute == "Critical Rate":
							if isinstance(gear["Item"], o.Weapon):
								rate += val.ranks[f"Rank {ranks[i]}"]
							else:
								rate += val.stats[i]
						elif val.attribute == "Critical Damage":
							if isinstance(gear["Item"], o.Weapon):
								dmg += val.ranks[f"Rank {ranks[i]}"]
							else:
								dmg += val.stats[i]

			if "Critical Rate" in [val.attribute for val in loadout.weapon["Item"].stats.values()]:
					print(f"Crit modifier found: {rate}")
			self.critMultiplier = rate
			return 1 + (rate * dmg)
		
		def _calculateAttack(self, op: o.Operator):
			self.atkFlat = self.attributeMap["Attack"]["Flat"]
			self.atkPercent = 1 + self.attributeMap["Attack"]["Percent"]
		
		def _getBuffs(self, op: o.Operator, skill: o.Skill):
			totalBuffs = 0
			if skill.type == "Basic Attack":
				totalBuffs += self.attributeMap["Basic Attack DMG Bonus"]["Percent"]
				totalBuffs += self.attributeMap["All Skill DMG Dealt Bonus"]["Percent"]
			elif skill.type == "Battle Skill":
				totalBuffs += self.attributeMap["Battle Skill DMG Bonus"]["Percent"]
				totalBuffs += self.attributeMap["All Skill DMG Dealt Bonus"]["Percent"]
			elif skill.type == "Combo Skill":
				totalBuffs += self.attributeMap["Combo Skill DMG Bonus"]["Percent"]
				totalBuffs += self.attributeMap["All Skill DMG Dealt Bonus"]["Percent"]
			elif skill.type == "Ultimate":
				totalBuffs += self.attributeMap["Ultimate DMG Bonus"]["Percent"]
				totalBuffs += self.attributeMap["All Skill DMG Dealt Bonus"]["Percent"]
			
			if "Cryo" in skill.description:
				totalBuffs += self.attributeMap["Cryo Damage"]["Percent"]
			elif "Electric"  in skill.description:
				totalBuffs += self.attributeMap["Electric Damage"]["Percent"]
			elif "Heat" in skill.description:
				totalBuffs += self.attributeMap["Heat Damage"]["Percent"]
			elif "Nature" in skill.description:
				totalBuffs += self.attributeMap["Nature Damage"]["Percent"]
			elif "Physical Damage" in skill.description:
				totalBuffs += self.attributeMap["Physical DMG Bonus"]["Percent"]

			# if self.isStaggered:
			# 	totalBuffs += self.attributeMap["DMG Bonus vs. Staggered"]["Percent"]
			return totalBuffs
		
		def getUpdatedStats(self):
			return{
				#"HP" : self.HP,
				"ATK" : self.atk,
				"WILL": self.will,
			}

		def checkGearsets(self, loadout: o.Loadout):
			try:
				for a, b, c in itertools.combinations(list(loadout.allGear.values()), 3):
					if a["Item"].name.split()[0] == b["Item"].name.split()[0] == c["Item"].name.split()[0]:
						name = a["Item"].name.split()[0]
						break
				for setName, setDesc in self.gearsets.items():
					if name in setName:
						return {f"Gear Set: {setName}" : setDesc}
			except:
						return {"Gear Set: None" : "No set bonus active"}
		
		def _getStaggerMultiplier(self, stagger):
			return 1.3 if stagger else 1
		
		def _getFinisherMultiplier(self, enemyClass):
			if enemyClass == "Advanced":
				return 1.25
			elif enemyClass in ["Elite", "Alpha"]:
				return 1.5
			elif enemyClass == "Boss":
				return 1.75
			else:
				return 1
		
		def _getLinkMultiplier(self):
			"""
			Returns the proper link multipler. This is dependant on the attack being used
			
			Return
			Dict
			"""
			return 1
		
		def _calculateAmp(self, loadouts):
			for loadout in loadouts:
				if loadout.operator:
					print(loadout.operator.name)
			return 1.18
		
		def _getEnemyDebuff(self):
			return 1