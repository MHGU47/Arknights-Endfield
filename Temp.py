import json
import os

class Calc():
  def __init__(self, operator):
    self.allOperators ={}
    self.operator = {}
    self.load_data()
    self.get_character(operator)

  def load_data(self):
    os.chdir(os.path.dirname(os.path.abspath(__file__)) or '.')

    with open("all_characters.json", "r", encoding="utf-8") as f:
      self.allOperators = json.load(f)

  def get_character(self, operator):

    for i in self.allOperators:
      for name, values in i.items():
        if name == operator:
          self.operator =  {"Name" : name, "Data" : values}

  def get_stats(self):
    stats = self.operator["Data"].get("stats")
    for stat, value in stats.items():
      print(f"{stat}: {value}")
  
  def calculate(self):
    stats = self.operator["Data"].get("stats")
    main = self.operator["Data"].get("stats").get("Main Attribute")
    sub = self.operator["Data"].get("stats").get("Secondary Attribute")
    wpnAtk = 42
    opAtk = 291 #self.operator["Data"].get("stats").get("Attack")

    baseAtk = opAtk + wpnAtk

    strBonus = (int(200) / 100)
    willBonus = 1 + ((2 * (113 / 1000)))

    bonus = ((2 * (113 / 1000))) + (int(200) / 100)

    totalAtk = baseAtk * bonus

    print(f"Attack: {totalAtk}")
if __name__ == "__main__":
  # calc = Calc(input("Enter operator: "))
  calc = Calc("Ember")
  calc.get_stats()
  calc.calculate()

