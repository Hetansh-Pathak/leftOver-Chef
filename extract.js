const AdmZip = require("adm-zip");
const zip = new AdmZip("RecipeBot-main.zip");
zip.extractAllTo(".", true);
console.log("ZIP extracted successfully");
