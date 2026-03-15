import utils as u
import copy
from typing import Dict, List, Optional

class Enemy:
  def __init__(self):
    self.isStaggered = False
    self.elementStatus = "None"
    self.vulnStatus = "None"

  def setStatus(self, status):
    self.elementStatus = status

  def setVulnStatus(self, status):
    self.vulnStatus = status

  def setStaggered(self, stagger):
    self.isStaggered = stagger