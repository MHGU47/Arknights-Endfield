import tkinter as tk
from tkinter import ttk
from tkinter import messagebox
from PIL import Image, ImageTk
import json
import os
import math
import operator_ as o
import calculations as calc
import enemy as e

try:
    from PIL import Image, ImageTk
    from PIL import ImageOps
    PIL_AVAILABLE = True
except Exception:
    PIL_AVAILABLE = False
IMAGE_PATH = None
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

class EndFieldTeamBuilder(tk.Tk):
    def __init__(self):
        super().__init__()
        
        self.title("Endfield Team Builder")
        self.geometry("1600x1000")
        
        # Load data from JSON
        self.load_data()
        self.enemy = e.Enemy()
        self.calc = calc.Calculations(self.gearsets)
        
        # Store loadouts for each of the 4 operator slots
        self.loadouts = [o.Loadout() for _ in range(4)]
        self.current_operator_tab = 0  # Which operator tab is active (0-3)
        self.current_right_tab = 0  # Which right-side tab is active
        
        # Create main container
        main_container = tk.Frame(self)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create left and right panels (1:3 ratio)
        self.left_panel = tk.Frame(main_container, width=300, relief=tk.RIDGE, borderwidth=2)
        self.left_panel.pack(side=tk.LEFT, fill=tk.BOTH, padx=(0, 5))
        self.left_panel.pack_propagate(False)
        
        self.right_panel = tk.Frame(main_container, relief=tk.RIDGE, borderwidth=2)
        self.right_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Build the UI
        self.create_left_panel()
        self.create_right_panel()
        
        # Initialize first operator
        self.update_operator_display()
        self.update_gear_display()
        
    def load_data(self):
        """Load operator and gear data from JSON files"""

        
        stats_dir = os.path.join(SCRIPT_DIR, "Data", "Stats")
        char_dir = os.path.join(stats_dir, "all_characters.json")
        new_char_dir = os.path.join(stats_dir, "warfarin_operators.json")
        wpn_dir = os.path.join(stats_dir, "weapons.json")
        gear_dir = os.path.join(stats_dir, "golden_gear.json")
        gearset_dir = os.path.join(stats_dir, "gear_sets.json")

        # with open(char_dir, "r", encoding="utf-8") as f:
        #     data = json.load(f)
        
        # self.allOperators = {}
        # for op in data:
        #     name = next(iter(op.keys()))
        #     self.allOperators.update({name : o.Operator(op)})

        with open(new_char_dir, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        self.allOperators = {}
        for op in data:
            name = next(iter(op.keys()))
            self.allOperators.update({name : o.Operator(op)})
        
        with open(wpn_dir, "r", encoding="utf-8") as f:
            data = json.load(f)

        wpns = {name : wpnData for d in data for name, wpnData in d.items()}
        self.allWeapons = {name : o.Weapon({name : data}) for name, data in wpns.items()}

        with open(gear_dir, "r", encoding="utf-8") as f:
            data = json.load(f)

        temp = {gear["name"] : {k : v for k, v in gear.items() if k != "name"} for gear in data}

        self.allGear = {gear : o.Gear({gear : stat}) for gear, stat in temp.items()}

        with open(gearset_dir, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.gearsets = {gear : desc for gearset in data for gear, desc in gearset.items()}
        
    def create_left_panel(self):
        """Create the left panel with operator tabs and stats"""
        # # Operator tabs (4 tabs: T1, T2, T3, T4)
        # tab_frame = tk.Frame(self.left_panel)
        # tab_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # self.operator_tab_buttons = []
        # for i in range(4):
        #     btn = tk.Button(
        #         tab_frame, 
        #         text=f"T{i+1}", 
        #         width=5,
        #         command=lambda idx=i: self.switch_operator_tab(idx)
        #     )
        #     btn.grid(row=i//2, column=i%2, padx=2, pady=2)
        #     self.operator_tab_buttons.append(btn)

        # Operator Notebook (T1–T4)
        self.left_notebook = ttk.Notebook(self.left_panel)
        self.left_notebook.pack(fill=tk.X, padx=5, pady=5)

        self.operator_tabs = []

        for i in range(4):
            tab = tk.Frame(self.left_notebook)
            self.left_notebook.add(tab, text=f"Operator {i+1}")
            self.operator_tabs.append(tab)

        # Bind tab change event
        self.left_notebook.bind("<<NotebookTabChanged>>", self.on_left_tab_changed)

        
        # Content area for selected operator
        self.left_content = tk.Frame(self.left_panel)
        self.left_content.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Character portrait (clickable)
        portrait_frame = tk.Frame(self.left_content, width=128, height=128)
        portrait_frame.pack()

        portrait_frame.pack_propagate(False)

        self.char_portrait_label = tk.Label(
            portrait_frame,
            text="CHAR\nPIC",
            relief=tk.RIDGE,
            bg="lightgray",
            cursor="hand2"
        )

        self.char_portrait_label.pack(fill="both", expand=True)

        self.char_portrait_label.bind('<Button-1>', self.on_character_click)

        levels = ["Level 1", "Level 20", "Level 40", "Level 60", "Level 80", "Level 90"]
        self.operatorLevel = tk.StringVar(value=levels[0])

        self.operatorDropdown = ttk.Combobox(
            self.left_content,   # ← important change
            textvariable=self.operatorLevel,
            values=levels,
            state="readonly",
            width=9
        )

        self.operatorDropdown.pack(pady=3)
        self.operatorDropdown.bind("<<ComboboxSelected>>", self.update_level)

        # Type section
        type_frame = tk.Frame(self.left_content)
        type_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        tk.Label(type_frame, text="━━━━━━━━", font=("Arial", 10)).pack()
        tk.Label(type_frame, text="Type Info", font=("Arial", 12, "bold")).pack()
        tk.Label(type_frame, text="━━━━━━━━", font=("Arial", 10)).pack(pady=(0, 10))
        
        self.type_labels = {}
        types = ["Weapon Type", "Class", "Element"]
        
        for t in types:
            type_line = tk.Frame(type_frame)
            type_line.pack(fill=tk.X, padx=10, pady=2)
            
            tk.Label(type_line, text=f"{t}:", width=10, anchor='w').pack(side=tk.LEFT)
            label = tk.Label(type_line, text="N/A", anchor='e')
            label.pack(side=tk.RIGHT)
            
            self.type_labels[t] = label
        
        # Base Stats section
        stats_frame = tk.Frame(self.left_content)
        stats_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        tk.Label(stats_frame, text="━━━━━━━━", font=("Arial", 10)).pack()
        tk.Label(stats_frame, text="Base Stats", font=("Arial", 12, "bold")).pack()
        tk.Label(stats_frame, text="━━━━━━━━", font=("Arial", 10)).pack(pady=(0, 10))
        
        self.stat_labels = {}
        stats = ["HP", "ATK", "STR", "AGI", "WILL", "INT"]
        
        for stat in stats:
            stat_line = tk.Frame(stats_frame)
            stat_line.pack(fill=tk.X, padx=10, pady=2)
            
            tk.Label(stat_line, text=f"{stat}:", width=10, anchor='w').pack(side=tk.LEFT)
            value_label = tk.Label(stat_line, text="0", anchor='e')
            value_label.pack(side=tk.RIGHT)
            
            self.stat_labels[stat] = value_label

        # Calculated Stats section
        calc_frame = tk.Frame(self.left_content)
        calc_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        tk.Label(calc_frame, text="━━━━━━━━━━━━━━━━", font=("Arial", 10)).pack()
        tk.Label(calc_frame, text="Calculated Stats", font=("Arial", 12, "bold")).pack()
        tk.Label(calc_frame, text="━━━━━━━━━━━━━━━━", font=("Arial", 10)).pack(pady=(0, 10))
        
        self.calc_labels = {}
        stats = ["HP", "ATK", "STR", "AGI", "WILL", "INT"]
        
        for stat in stats:
            stat_line = tk.Frame(calc_frame)
            stat_line.pack(fill=tk.X, padx=10, pady=2)
            
            tk.Label(stat_line, text=f"{stat}:", width=10, anchor='w').pack(side=tk.LEFT)
            value_label = tk.Label(stat_line, text="0", anchor='e')
            value_label.pack(side=tk.RIGHT)
            
            self.calc_labels[stat] = value_label
    
    def create_right_panel(self):
      """Create the right panel with gear and tabs"""
      # Top section (1/4 height) - Gear slots
      top_section = tk.Frame(self.right_panel, height=400)
      top_section.pack(fill=tk.X, padx=5, pady=5)
      top_section.pack_propagate(False)
      
      # Gear slots row
      gear_frame = tk.Frame(top_section)
      gear_frame.pack(fill=tk.X, pady=5)
      
      gear_slots = [
          ("Weapon", "weapon"),
          ("Armour", "armour"),
          ("Gloves", "gloves"),
          ("Kit 1", "kit1"),
          ("Kit 2", "kit2")
      ]
      
      self.gear_portraits = {}
      self.gear_stat_labels = {}

      self.gear_stat_spinboxes = {}
      
      for i, (name, slot) in enumerate(gear_slots):
          slot_frame = tk.Frame(gear_frame)
          slot_frame.pack(side=tk.LEFT, expand=True, padx=5)
          
          # Gear portrait (clickable)
          portrait = tk.Label(
              slot_frame,
              text=name[:3].upper(),
              relief=tk.RIDGE,
              bg="lightgray",
              cursor="hand2"
          )
          portrait.pack()
          portrait.bind('<Button-1>', lambda e, s=slot: self.on_gear_click(s))
          self.gear_portraits[slot] = portrait
          
          # Stat container
          stat_container = tk.Frame(slot_frame)
          stat_container.pack(pady=5)
          
          self.gear_stat_labels[slot] = []
          self.gear_stat_spinboxes[slot] = {}
          
          # Make columns expand nicely
          stat_container.columnconfigure(0, weight=1)
          stat_container.columnconfigure(1, weight=0)
          
          for j in range(3):
              # Stat label
              stat_lbl = tk.Label(
                  stat_container,
                  text="---",
                  font=("Arial", 8),
                  anchor="w"
              )
              stat_lbl.grid(row=j, column=0, sticky="w", padx=(0, 5), pady=2)
              self.gear_stat_labels[slot].append(stat_lbl)
              
              # Spinbox
              if name == "Weapon":
                  var = tk.IntVar(value=1)
                  spinbox = tk.Spinbox(
                      stat_container,
                      from_=1,
                      to=9,
                      increment=1,
                      width=5,
                      command=self.update_spinbox,
                      textvariable=var
                  )
              else:
                  var = tk.IntVar(value=0)
                  spinbox = tk.Spinbox(
                      stat_container,
                      from_=0,
                      to=3,
                      increment=1,
                      width=5,
                      command=self.update_spinbox,
                      textvariable=var
                  )
              spinbox.grid(row=j, column=1, sticky="e", pady=2)
              
              self.gear_stat_spinboxes[slot][f"Stat {j + 1}"] = {
                  "Spin Box": spinbox,
                  "Value": var
              }
          
          # Weapon Level dropdown
          if name == "Weapon":
              levels = [1, 20, 40, 60, 80, 90]
          
              self.weaponLevel = tk.IntVar(value=levels[0])
              
              self.weaponDropdown = ttk.Combobox(
                  slot_frame,
                  textvariable=self.weaponLevel,
                  values=levels,
                  state="readonly",
                  width=6
              )
              self.weaponDropdown.pack(pady=3)
              self.weaponDropdown.bind("<<ComboboxSelected>>", self.update_level)
      
      # Armour set bonus box
      set_frame = tk.Frame(top_section, relief=tk.RIDGE, borderwidth=1)
      set_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
      
      self.gearset_name_label = tk.Label(
          set_frame,
          text="Gear Set Bonus: None",
          font=("Arial", 10, "bold")
      )
      
      self.gearset_name_label.pack(anchor='w', padx=5, pady=2)
      
      tk.Label(set_frame, text="─" * 40).pack()
      
      self.gearset_desc_label = tk.Label(
          set_frame,
          text="No set bonus active",
          wraplength=400,
          justify=tk.LEFT,
          font=("Arial", 9)
          )
      
      self.gearset_desc_label.pack(anchor='w', padx=5, pady=5)
      
      # Bottom section (3/4 height) - Tabs
      bottom_section = tk.Frame(self.right_panel)
      bottom_section.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
      
      self.right_notebook = ttk.Notebook(bottom_section)
      self.right_notebook.pack(fill=tk.BOTH, expand=True)
      
      # Tab 1: Overview
      self.overview_tab = tk.Frame(self.right_notebook)
      self.right_notebook.add(self.overview_tab, text="Overview")
      self.create_overview_tab()
      
      # Tab 2: Rotation
      self.rotation_tab = tk.Frame(self.right_notebook)
      self.right_notebook.add(self.rotation_tab, text="Rotation")
      self.create_rotation_tab()
      
      # Tab 3: DPS
      self.dps_tab = tk.Frame(self.right_notebook)
      self.right_notebook.add(self.dps_tab, text="DPS")
      self.create_dps_tab()
      
      # Tab 4: Reserved
      self.tab4 = tk.Frame(self.right_notebook)
      self.right_notebook.add(self.tab4, text="Tab 4")
      tk.Label(
          self.tab4,
          text="Reserved for future use",
          font=("Arial", 14)
      ).pack(expand=True)
      
      self.right_notebook.bind('<<NotebookTabChanged>>', self.on_right_tab_changed)
    
    def create_overview_tab(self):
        """Create the Overview tab with skills"""
        canvas = tk.Canvas(self.overview_tab)
        scrollbar = tk.Scrollbar(self.overview_tab, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Skills
        self.skill_labels = {}
        skills = ["Basic Attack", "Battle Skill", "Combo Skill", "Ultimate"]
        skill_names = ["Basic Attack", "Battle Skill", "Combo Skill", "Ultimate"]
        
        for skill, display_name in zip(skills, skill_names):
            skill_frame = tk.Frame(scrollable_frame)
            skill_frame.pack(fill=tk.X, padx=10, pady=10)
            
            # Icon and name row
            header_frame = tk.Frame(skill_frame)
            header_frame.pack(fill=tk.X)
            
            # Skill icon
            icon = tk.Label(
                header_frame,
                text="[]",
                width=4,
                height=2,
                relief=tk.RIDGE,
                bg="lightgray"
            )
            icon.pack(side=tk.LEFT, padx=(0, 10))
            
            # Skill name
            name_label = tk.Label(
                header_frame,
                text=display_name,
                font=("Arial", 12, "bold")
            )
            name_label.pack(side=tk.LEFT, anchor='w')
            
            # Separator
            tk.Label(skill_frame, text="─" * 60).pack(fill=tk.X)
            
            # Description
            desc_label = tk.Label(
                skill_frame,
                text="No description available",
                wraplength=500,
                justify=tk.LEFT,
                font=("Arial", 10)
            )
            desc_label.pack(fill=tk.X, padx=(50, 0), pady=5)
            
            self.skill_labels[skill] = {
                'name': name_label,
                'desc': desc_label
            }
    
    def create_rotation_tab(self):
        """Create the Rotation tab"""
        rotation_frame = tk.Frame(self.rotation_tab)
        rotation_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.rotation_widgets = []
        
        for i in range(5):
            slot_frame = tk.Frame(rotation_frame)
            slot_frame.pack(side=tk.LEFT, expand=True, padx=5)
            
            # Operator portrait (clickable)
            op_portrait = tk.Label(
                slot_frame,
                text=f"OP\n{i+1}",
                width=10,
                height=4,
                relief=tk.RIDGE,
                bg="lightgray",
                cursor="hand2"
            )
            op_portrait.pack(pady=5)
            op_portrait.bind('<Button-1>', lambda e, idx=i: self.on_rotation_operator_click(idx))
            
            # Skill portrait (clickable)
            skill_portrait = tk.Label(
                slot_frame,
                text=f"SKL\n{i+1}",
                width=10,
                height=4,
                relief=tk.RIDGE,
                bg="lightgray",
                cursor="hand2"
            )
            skill_portrait.pack(pady=5)
            skill_portrait.bind('<Button-1>', lambda e, idx=i: self.on_rotation_skill_click(idx))
            
            self.rotation_widgets.append({
                'operator': op_portrait,
                'skill': skill_portrait
            })
    
    def create_dps_tab(self):
        """Create the DPS tab with chart"""
        chart_frame = tk.Frame(self.dps_tab)
        chart_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Title
        tk.Label(
            chart_frame,
            text="DPS Over Time",
            font=("Arial", 14, "bold")
        ).pack(pady=10)
        
        # Placeholder for chart (you'd use matplotlib here)
        chart_placeholder = tk.Canvas(chart_frame, bg="white", relief=tk.RIDGE, borderwidth=2)
        chart_placeholder.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Draw simple placeholder chart
        chart_placeholder.create_text(
            300, 150,
            text="DPS Chart\n(Use matplotlib for actual chart)",
            font=("Arial", 12),
            fill="gray"
        )
        
        # Stats
        stats_frame = tk.Frame(chart_frame)
        stats_frame.pack(pady=10)
        
        self.dps_labels = {}
        dps_stats = ["Total DPS", "Peak DPS", "Avg DPS"]
        
        for stat in dps_stats:
            stat_line = tk.Frame(stats_frame)
            stat_line.pack(fill=tk.X, pady=2)
            
            tk.Label(stat_line, text=f"{stat}:", font=("Arial", 11, "bold"), width=12, anchor='w').pack(side=tk.LEFT)
            value_label = tk.Label(stat_line, text="0", font=("Arial", 11), anchor='e')
            value_label.pack(side=tk.LEFT, padx=10)
            
            self.dps_labels[stat] = value_label
    
    # Event Handlers
    
    def on_left_tab_changed(self, event):
        """Handle left notebook tab change"""
        self.current_operator_tab = self.left_notebook.index(
            self.left_notebook.select()
        )
        self.update_operator_display()
        self.update_gear_display()
    
    def on_right_tab_changed(self, event):
        """Handle right panel tab change"""
        current_tab = self.right_notebook.index(self.right_notebook.select())
        
        # Update DPS display when switching to DPS tab
        if current_tab == 2:  # DPS tab
            self.update_dps_display()
    
    def on_character_click(self, event):
        """Handle character portrait click - show operator selection"""
        self.show_operator_selector()
    
    def on_gear_click(self, slot):
        """Handle gear slot click - show gear selection"""
        if self.loadouts[self.current_right_tab].operator:
            self.show_gear_selector(slot)
        else:
            messagebox.showerror("Error", "Select an Operator!")
    
    def on_rotation_operator_click(self, index):
        """Handle rotation operator portrait click"""
        print(f"Clicked rotation operator slot {index}")
        # TODO: Implement operator selection for rotation
    
    def on_rotation_skill_click(self, index):
        """Handle rotation skill portrait click"""
        print(f"Clicked rotation skill slot {index}")
        # TODO: Implement skill selection for rotation

   # Show dialog boxes
    def show_operator_selector(self):
        loadout = self.loadouts[self.current_operator_tab]

        items = [op for op in self.allOperators.values()]


        def on_select(item):
            loadout.operator = item
            loadout.weapon["Level"] = 1
            loadout.weapon["Item"] = next(
                wpn for wpn in self.allWeapons.values()
                if wpn.type == loadout.operator.WPN
                )

            self.update_operator_display()
            self.update_gear_display()
            self.calc.calculate(self.loadouts[self.current_operator_tab], self.enemy)


        IconGridSelector(self, f"Select Operator", items, on_select)
    # def show_operator_selector(self):
    #     """Show popup to select operator"""
    #     popup = tk.Toplevel(self)
    #     popup.title("Select Operator")
    #     popup.geometry("300x400")
        
    #     tk.Label(popup, text="Select Operator", font=("Arial", 14, "bold")).pack(pady=10)
        
    #     listbox = tk.Listbox(popup, font=("Arial", 12))
    #     listbox.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
    #     for op_name in self.allOperators.keys():
    #         listbox.insert(tk.END, op_name)
        
    #     def on_select():
    #         selection = listbox.curselection()
    #         if selection:
    #             selected_op = listbox.get(selection[0])
    #             self.loadouts[self.current_operator_tab].operator = self.allOperators.get(selected_op)

    #             self.loadouts[self.current_operator_tab].weapon["Level"] = 1
    #             self.loadouts[self.current_operator_tab].weapon["Item"] = next(
    #                 wpn for wpn in self.allWeapons.values()
    #                 if wpn.type == self.loadouts[self.current_operator_tab].operator.WPN
    #                 )
                    

    #             self.update_operator_display()
    #             self.update_gear_display()
    #             popup.destroy()

    #             self.calc.calculate(self.loadouts[self.current_operator_tab])
        
    #     tk.Button(popup, text="Select", command=on_select).pack(pady=10)
    
    # def show_gear_selector(self, slot):
    #     """Show popup to select gear"""
    #     popup = tk.Toplevel(self)
    #     popup.title(f"Select {slot.capitalize()}")
    #     popup.geometry("300x400")
        
    #     tk.Label(popup, text=f"Select {slot.capitalize()}", font=("Arial", 14, "bold")).pack(pady=10)
        
    #     listbox = tk.Listbox(popup, font=("Arial", 12))
    #     listbox.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
    #     # Get available gear based on slot
    #     loadout = self.loadouts[self.current_operator_tab]
        
    #     if slot == "weapon":
    #         # Filter by operator's weapon type
    #         if loadout.operator:
    #             weapon_type = loadout.operator.WPN
    #             gear_list = [name for name, data in self.allWeapons.items() if data.type == weapon_type]
    #         else:
    #             gear_list = []
    #     elif slot == "armour":
    #         gear_list = [name for name, data in self.allGear.items() if data.type == "Armor"]
    #     elif slot == "gloves":
    #         gear_list = [name for name, data in self.allGear.items() if data.type == "Gloves"]
    #     else:  # kit1 or kit2
    #         gear_list = [name for name, data in self.allGear.items() if data.type == "Kit"]
        
    #     for gear_name in gear_list:
    #         listbox.insert(tk.END, gear_name)
        
    #     def on_select():
    #         selection = listbox.curselection()
    #         if selection:
    #             if slot == "weapon":
    #               s = getattr(self.loadouts[self.current_operator_tab], "weapon")
    #               s["Level"] = 1
    #               s["Item"] = self.allWeapons[listbox.get(selection[0])]
    #             else:
    #               s = getattr(self.loadouts[self.current_operator_tab], slot)
    #               s["Item"] = self.allGear[listbox.get(selection[0])]
    #             self.update_gear_display()
    #             self.calc.calculate(self.loadouts[self.current_operator_tab])
    #             popup.destroy()
    #             #TODO: CLEAN THIS UP! Maybe setattr isn't needed
        
    #     tk.Button(popup, text="Select", command=on_select).pack(pady=10)

    def show_gear_selector(self, slot):

      loadout = self.loadouts[self.current_operator_tab]

      if slot == "weapon":
          if loadout.operator:
              weapon_type = loadout.operator.WPN
              items = [data for data in self.allWeapons.values() if data.type == weapon_type]
          else:
              items = []

      elif slot == "armour":
          items = [data for data in self.allGear.values() if data.type == "Armor"]

      elif slot == "gloves":
          items = [data for data in self.allGear.values() if data.type == "Gloves"]

      else:
          items = [data for data in self.allGear.values() if data.type == "Kit"]


      def on_select(item):

          if slot == "weapon":
              s = getattr(self.loadouts[self.current_operator_tab], "weapon")
              s["Level"] = 1
              s["Item"] = item
          else:
              s = getattr(self.loadouts[self.current_operator_tab], slot)
              s["Item"] = item

          self.update_gear_display()
          self.calc.calculate(self.loadouts[self.current_operator_tab], self.enemy)


      IconGridSelector(self, f"Select {slot.capitalize()}", items, on_select)
    
    # Update Handlers

    def update_operator_display(self):
        """Update all displays for the current operator"""
        loadout = self.loadouts[self.current_operator_tab]
        
        if loadout.operator:
            # Update character portrait
            image_path = os.path.join(SCRIPT_DIR, loadout.operator.icon)
            img = Image.open(image_path)
            img = ImageOps.fit(img, (128, 128), Image.LANCZOS)

            tkimg = ImageTk.PhotoImage(img)

            self.char_portrait_label.configure(image=tkimg, text="")
            self.char_portrait_label.image = tkimg   # keep reference
            
            # Update stats
            op_data = self.allOperators.get(loadout.operator.name, {})
            self.stat_labels['HP'].config(text=str(op_data.stats["HP"]))
            self.stat_labels['ATK'].config(text=str(op_data.stats["Attack"]))
            self.stat_labels['STR'].config(text=str(op_data.stats["Strength"]))
            self.stat_labels['AGI'].config(text=str(op_data.stats["Agility"]))
            self.stat_labels['WILL'].config(text=str(op_data.stats["Will"]))
            self.stat_labels['INT'].config(text=str(op_data.stats["Intellect"]))
            self.operatorLevel.set(op_data.level)

            stats = self.calc.getUpdatedStats()
            self.type_labels['Weapon Type'].config(text=str(op_data.WPN))
            self.type_labels['Class'].config(text=str(op_data.CLS))
            self.type_labels['Element'].config(text=str(op_data.ELM))

            # Update calculated stats
            self.calc_labels['ATK'].config(text=str(stats["ATK"]))
            self.calc_labels['WILL'].config(text=str(stats["WILL"]))

            for slot in loadout.allGear:
                if slot != "weapon":
                  for i in range(3):
                    item = getattr(loadout, slot)
                    self.gear_stat_spinboxes[slot][f"Stat {i + 1}"]["Value"].set(item["Artificing Levels"][i])
                else:
                  for i in range(3):
                    item = getattr(loadout, slot)
                    self.gear_stat_spinboxes[slot][f"Stat {i + 1}"]["Value"].set(item["Stat Ranks"][i])
                    self.weaponLevel.set(item["Level"])
                    
            
            # Update skills in Overview tab
            skills = op_data.allSkills
            for skill in skills.values():
                if skill.type in self.skill_labels:
                    self.skill_labels[skill.type]['name'].config(text=skill.name)
                    self.skill_labels[skill.type]['desc'].config(text=skill.description)
        else:
            self.char_portrait_label.config(image ="", text="CHAR\nPIC")
            self.char_portrait_label.image = None
            for slot in loadout.allGear:
                if slot != "weapon":
                  for i in range(3):
                    item = getattr(loadout, slot)
                    self.gear_stat_spinboxes[slot][f"Stat {i + 1}"]["Value"].set(item["Artificing Levels"][i])
                else:
                  for i in range(3):
                    item = getattr(loadout, slot)
                    self.gear_stat_spinboxes[slot][f"Stat {i + 1}"]["Value"].set(item["Stat Ranks"][i])
                    self.weaponLevel.set(item["Level"])
            for stat in self.stat_labels.values():
                stat.config(text="0")
            for t in self.type_labels.values():
                t.config(text="N/A")
            for label in self.skill_labels.items():
                label[1]["name"].config(text=f"{label[0]}")
                label[1]["desc"].config(text="No description available")
        
        
        # Update DPS if on DPS tab
        if self.right_notebook.index(self.right_notebook.select()) == 2:
            self.update_dps_display()

        for op in self.loadouts:
            if op.operator != None:
                self.calc.update(self.loadouts, self.enemy)
                break

    def update_gear_display(self):
        """Update gear portraits and stats"""
        loadout = self.loadouts[self.current_operator_tab]
        
        gear_mapping = {
            'weapon': loadout.weapon,
            'armour': loadout.armour,
            'gloves': loadout.gloves,
            'kit1': loadout.kit1,
            'kit2': loadout.kit2
        }
        
        for slot, gear in gear_mapping.items():
            if gear["Item"]:
                image_path = os.path.join(SCRIPT_DIR, gear["Item"].icon)
                img = Image.open(image_path)
                img = ImageOps.fit(img, (128, 128), Image.LANCZOS)

                tkimg = ImageTk.PhotoImage(img)

                label = self.gear_portraits[slot]
                label.configure(image=tkimg, text="")
                label.image = tkimg
                
                # Update stats
                if slot == "weapon":
                    wpnStats = gear["Item"].stats
                    levels = gear["Item"].levels # TODO Implement levels
                    ranks = [f"Rank {r}" for r in gear["Stat Ranks"]]
                    
                    for i, (key, value) in enumerate(wpnStats.items()):
                        rankData = value.data
                        if key != "Passive Attribute":
                            self.gear_stat_labels[slot][i].config(text=f"{value.name}: {rankData[ranks[i]]}")
                        else:
                            lbl = self.gear_stat_labels[slot][i]
                            lbl.config(text=f"{value.name}")
                            ToolTip(lbl, value.ranks[ranks[i]])
                else:
                    stats = gear["Item"].stats

                    for i, (name, stat) in enumerate(stats.items()):
                        self.gear_stat_labels[slot][i].config(text=f"{name}: {stat.levels[gear["Artificing Levels"][i]]}")
            else:
                label = self.gear_portraits[slot]
                label.configure(image="", text=slot.capitalize())
                label.image = None
                
                for lbl in self.gear_stat_labels[slot]:
                    lbl.config(text="---")
            if slot == "weapon":
                if gear_mapping[slot] != None:
                    self.weaponLevel.set(gear_mapping[slot]["Level"])
                else:
                    self.weaponLevel.set(1)

        for op in self.loadouts:
            if op.operator != None:
                self.calc.update(self.loadouts, self.enemy)
                break
        (name, desc), = self.calc.checkGearsets(loadout).items()
        self.gearset_name_label.config(text=name)
        self.gearset_desc_label.config(text=desc)

        if self.right_notebook.index(self.right_notebook.select()) == 2:
            self.update_dps_display()

    def update_dps_display(self):
        """Update DPS chart and stats for current operator"""
        # TODO: Calculate actual DPS based on loadout
        # For now, using placeholder values
        self.dps_labels["Total DPS"].config(text=f"Basic Attack Damage: {self.calc.damage}")
        self.dps_labels["Peak DPS"].config(text=f"Raw Attack: {self.calc.atk}")
        self.dps_labels["Avg DPS"].config(text="18,300")
    
    def update_level(self, event):
        loadout = self.loadouts[self.current_operator_tab]
        mapping = {
            'weapon': loadout.weapon,
            'armour': loadout.armour,
            'gloves': loadout.gloves,
            'kit1': loadout.kit1,
            'kit2': loadout.kit2
        }
        if event.widget == self.weaponDropdown:
            mapping["weapon"]["Level"] = self.weaponLevel.get()
            loadout.update_levels("weapon", self.weaponLevel.get())
            self.update_gear_display()
        elif event.widget == self.operatorDropdown:
            loadout.operator.setLevel(self.operatorLevel.get())
            
        
        self.update_operator_display()
        self.calc.update(self.loadouts, self.enemy)
        if self.right_notebook.index(self.right_notebook.select()) == 2:
            self.update_dps_display()
    
    def update_spinbox(self):
        loadout = self.loadouts[self.current_operator_tab]
        spin = self.gear_stat_spinboxes

        for (slot, spinbox), gear in zip(spin.items(), loadout.allGear.values()):
            if gear["Item"] != None:
                for i, s in enumerate(spinbox.values()):
                    if slot == "weapon":
                        self.loadouts[self.current_operator_tab].allGear[slot]["Stat Ranks"][i] = s["Value"].get()
                    else:
                        self.loadouts[self.current_operator_tab].allGear[slot]["Artificing Levels"][i] = s["Value"].get()
        self.update_gear_display()
        self.update_operator_display()
        if self.right_notebook.index(self.right_notebook.select()) == 2:
            self.update_dps_display()

# Other classes

class IconGridSelector(tk.Toplevel):

    def __init__(self, parent, title, items, callback, icon_size=64, columns=4):
        super().__init__(parent)

        self.title(title)
        self.geometry("420x500")

        self.callback = callback
        self.images = []

        tk.Label(self, text=title, font=("Arial", 14, "bold")).pack(pady=10)

        canvas = tk.Canvas(self)
        scrollbar = tk.Scrollbar(self, orient="vertical", command=canvas.yview)

        self.frame = tk.Frame(canvas)

        self.frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=self.frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        for i, item in enumerate(items):

            image_path = os.path.join(SCRIPT_DIR, item.icon)

            img = Image.open(image_path)
            img = ImageOps.fit(img, (icon_size, icon_size), Image.LANCZOS)

            tkimg = ImageTk.PhotoImage(img)
            self.images.append(tkimg)

            r = i // columns
            c = i % columns

            btn = tk.Button(
                self.frame,
                image=tkimg,
                text=item.name,
                compound="top",
                relief=tk.RIDGE,
                command=lambda g=item: self.select(g)
            )

            btn.grid(row=r, column=c, padx=6, pady=6)

            # Tooltip text (customise this to show stats)
            try:
              tooltip_text = f"{item.name}\nType: {item.type}"
              ToolTip(btn, tooltip_text)
            except:
                pass

    def select(self, item):
        self.callback(item)
        self.destroy()        

class ToolTip:
    def __init__(self, widget, text):
        self.widget = widget
        self.text = text
        self.tip = None

        widget.bind("<Enter>", self.show)
        widget.bind("<Leave>", self.hide)

    def show(self, event=None):
        if self.tip:
            return

        x = self.widget.winfo_rootx() + 20
        y = self.widget.winfo_rooty() + 20

        self.tip = tk.Toplevel(self.widget)
        self.tip.wm_overrideredirect(True)
        self.tip.geometry(f"+{x}+{y}")

        label = tk.Label(
            self.tip,
            text=self.text,
            background="#ffffe0",
            relief=tk.SOLID,
            borderwidth=1,
            font=("Arial", 10)
        )
        label.pack()

    def hide(self, event=None):
        if self.tip:
            self.tip.destroy()
            self.tip = None

if __name__ == "__main__":
    app = EndFieldTeamBuilder()
    app.mainloop()