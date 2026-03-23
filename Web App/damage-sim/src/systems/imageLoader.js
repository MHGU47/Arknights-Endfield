// load each category explicitly
const gear = import.meta.glob("../Data/Images/Gear/*.png", { eager: true, import: "default" });
const operators = import.meta.glob("../Data/Images/Operators/*.png", { eager: true, import: "default" });
const skills = import.meta.glob("../Data/Images/Skills/*.png", { eager: true, import: "default" });

// reusable formatter
const formatImages = (modules) =>
  Object.fromEntries(
    Object.entries(modules).map(([fullPath, img]) => {
      const name = fullPath.split("/").pop().split(".")[0];
      return [name, img];
    })
  );

export const images = {
  gear: formatImages(gear),
  operators: formatImages(operators),
  skills: formatImages(skills)
};

// const gearModules = import.meta.glob("./Gear/*.png", {
//   eager: true,
//   import: "default"
// });

// const gearImages = Object.fromEntries(
//   Object.entries(gearModules).map(([fullPath, img]) => {
//     const fileName = fullPath.split("/").pop(); // "AIC%20Alloy%20Plate.png"

//     const name = decodeURIComponent(
//       fileName.replace(".png", "")
//     );

//     return [name, img];
//   })
// );