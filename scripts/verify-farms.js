const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "..", "public", "farms_fixed.csv");

if (!fs.existsSync(csvPath)) {
  console.log("❌ farms_fixed.csv not found!");
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, "utf-8");
const lines = csvContent.split("\n").filter((l) => l.trim());

// Get header
const header = lines[0];
console.log("📋 CSV Header:", header);
console.log("");

// Count actual farms (exclude header and invalid entries)
const invalidPatterns = [
  /^(Looking|Notes|See|State|Resources|Electric|Easter|Farms|Maple|Christmas|Where|Before|If|Most|Green|In|Winter|Local|Oregon|Answer|The|Share|Alabama|Alaska|Arkansas|Arizona|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New|North|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode|South|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West|Wisconsin|Wyoming)/i,
];

const farms = lines.slice(1).filter((line) => {
  if (!line.trim()) return false;
  const name = line.split(",")[0]?.trim() || "";
  if (!name || name.length < 3) return false;
  return !invalidPatterns.some((pattern) => pattern.test(name));
});

console.log(`✅ Total valid farms: ${farms.length}`);
console.log(`📊 Total lines in CSV: ${lines.length} (including header)`);
console.log("");

// Show sample farms
console.log("📝 Sample farms (last 10):");
farms.slice(-10).forEach((farm, idx) => {
  const parts = farm.split(",");
  const name = parts[0]?.trim() || "Unknown";
  const city = parts[2]?.trim() || "";
  const state = parts[3]?.trim() || "";
  console.log(`  ${farms.length - 10 + idx + 1}. ${name} - ${city}, ${state}`);
});

console.log("");
console.log("📈 Progress to 3000 farms:");
const progress = ((farms.length / 3000) * 100).toFixed(1);
const remaining = 3000 - farms.length;
console.log(`  ${progress}% complete (${remaining} farms remaining)`);

// Count by state
console.log("");
console.log("🗺️  Farms by state (top 10):");
const stateCounts = {};
farms.forEach((farm) => {
  const parts = farm.split(",");
  const state = parts[3]?.trim() || "Unknown";
  stateCounts[state] = (stateCounts[state] || 0) + 1;
});

const sortedStates = Object.entries(stateCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

sortedStates.forEach(([state, count]) => {
  console.log(`  ${state}: ${count} farms`);
});
