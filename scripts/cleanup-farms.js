const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "..", "public", "farms_fixed.csv");

console.log("🧹 Cleaning up invalid farm entries...\n");

const csvContent = fs.readFileSync(csvPath, "utf-8");
const lines = csvContent.split("\n");
const header = lines[0];

// Invalid patterns to filter out
const invalidPatterns = [
  /^Upick Farm Finder/i,
  /^Home\s*›/i,
  /Contactupickguide/i,
  /Suggest a Farm/i,
  /Report an Update/i,
  /^First$/i,
  /^←\s*Previous/i,
  /^All\s+.*cities with upick farms/i,
  /^Search by City/i,
  /^Found \d+ farms in/i,
  /^Unique Farm Activities/i,
  /^Click on the area/i,
  /^When you get home/i,
  /^Source: USDA/i,
  /^Children's consignment/i,
  /^Add a farm that isn't/i,
  /^[A-Z][a-z]+\d+$/i, // City names with numbers like "Somerville4"
  /^[A-Z][a-z]+\d+[A-Z][a-z]+\d+$/i, // Multiple city names with numbers
  /^[A-Z][a-z]+\d+[A-Z][a-z]+$/i, // City names concatenated
  /^Whether you pick/i,
  /^Be sure to see/i,
  /^Local Farm Finder$/i,
  /^Farm Visit Guide$/i,
  /^Farm Fresh Produce$/i,
  /^Farm Search Engine$/i,
  /^No farms currently listed/i,
  /^Check back soon/i,
  /^Other types of farms$/i,
  /^Farm markets and roadside stands$/i,
  /^Find Other types of farms:/i,
  /^Find a pick-your-own farm near you!/i,
  /^Find a co$/i,
  /^Green Beans$/i,
  /^Watermelons$/i,
  /^Other Vegetables$/i,
  /^You$/i,
  /^Copy$/i,
  /^Find$/i,
  /^Disclosure$/i,
  /^Want$/i,
  /^Share$/i,
  /^Like$/i,
  /^Follow$/i,
  /^Subscribe$/i,
  /^Privacy$/i,
  /^Terms$/i,
  /^About$/i,
  /^Contact$/i,
  /^Home$/i,
  /^Menu$/i,
  /^Search$/i,
];

let validFarms = [header];
let removedCount = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = line.split(",");
  const name = values[0]?.trim() || "";
  
  // Skip if no name or name is too short
  if (!name || name.length < 3) {
    removedCount++;
    continue;
  }
  
  // Check against invalid patterns
  const isInvalid = invalidPatterns.some(pattern => pattern.test(name));
  
  // Check for concatenated produce lists (e.g., "Watermelon festivalsPecan harvestingStrawberry celebrations")
  const hasConcatenatedProduce = /festivals[A-Z]|harvesting[A-Z]|picking[A-Z]|celebrations[A-Z]|experiences[A-Z]|foraging[A-Z]|tours[A-Z]|making[A-Z]|events[A-Z]|raking[A-Z]|tapping[A-Z]|hunting[A-Z]|stirring[A-Z]|chunkin[A-Z]|visits[A-Z]|feeds[A-Z]|hayrides[A-Z]|pressing[A-Z]|by the sea[A-Z]/i.test(name);
  
  // Check for single common words that are likely navigation elements
  const isSingleWordNav = /^(You|Copy|Find|Disclosure|Want|Share|Like|Follow|Subscribe|Privacy|Terms|About|Contact|Home|Menu|Search)$/i.test(name);
  
  // Check for invalid state values
  const state = values[3]?.trim() || "";
  const invalidStates = ["Unknown", "Cherries", "Blueberries", "Tomatoes", "Raspberries", "Strawberries", "Search", "search engine", "Figs", "Blackberries", "Apples", "Peaches", "Pears", "Grapes", "Corn", "Pumpkins", "Find a co", "Green Beans", "Watermelons", "Other Vegetables", "Feedback"];
  const hasInvalidState = invalidStates.includes(state);
  
  // Check for very long names that are likely descriptions/metadata
  const isLongMetadata = name.length > 100 && (
    name.includes("Since 2002") ||
    name.includes("Beware the copycat") ||
    name.includes("We update continuously") ||
    name.includes("learn to can and freeze")
  );
  
  // Also check for other invalid patterns
  if (
    isInvalid ||
    name === "First" ||
    name.startsWith("←") ||
    name.match(/^\d+$/) || // Just numbers
    name.length > 200 || // Too long
    hasConcatenatedProduce || // Concatenated produce lists
    hasInvalidState || // Invalid state values
    isLongMetadata || // Long metadata/description text
    isSingleWordNav || // Single word navigation elements
    (name.length < 5 && !name.match(/^[A-Z][a-z]+$/)) || // Too short and not a simple word
    /^With - you can/i.test(name) || // Incomplete phrases
    /^[A-Z][a-z]+ - [a-z]+$/i.test(name) && name.length < 15 // Short incomplete phrases
  ) {
    removedCount++;
    continue;
  }
  
  validFarms.push(line);
}

// Write cleaned CSV
fs.writeFileSync(csvPath, validFarms.join("\n"));

console.log(`✅ Cleanup complete!`);
console.log(`   Removed: ${removedCount} invalid entries`);
console.log(`   Remaining: ${validFarms.length - 1} valid farms`);
console.log(`   Saved to: ${csvPath}\n`);
