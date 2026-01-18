const fs = require('fs');
const filePath = "API Key Google Maps.txt";
content = "";

try {
  // Read the entire file content as a string
  content = fs.readFileSync(filePath, "utf-8");

  // The content is the single line (potentially with a newline character at the end)
  // Use trim() to remove leading/trailing whitespace, including newlines
  const singleLine = content.trim();

  console.log("The single line is:", singleLine);

} catch (err) {
  console.error("Error reading file:", err);
}

const apiKeyGoogleMaps = content;

urlBeforeKey = "https://maps.googleapis.com/maps/api/js?key=";
urlAfterKey = "&libraries=places&callback=initMap"
urlLoadGoogleMaps = urlBeforeKey + apiKeyGoogleMaps + urlAfterKey;

console.log(urlLoadGoogleMaps)

fs.writeFileSync("config.js", `const URL_LOAD_GOOGLE_MAPS = "${urlLoadGoogleMaps}";`);

// document.getElementById("output").textContent = myVariable;
// or
// document.getElementById("output").innerHTML = myVariable; 