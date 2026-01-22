const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "..", "public", "farms_fixed.csv");

console.log("🔍 Removing duplicate farms by name...\n");

const csvContent = fs.readFileSync(csvPath, "utf-8");
const lines = csvContent.split("\n");
const header = lines[0];

if (!header) {
  console.error("❌ CSV file is empty or invalid!");
  process.exit(1);
}

// Parse CSV lines
const farms = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Handle CSV parsing with quoted fields
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const nextChar = line[j + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        j++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  // Handle both old format (12 columns) and new format (13 columns with email)
  const hasEmailColumn = header.includes("email");

  while (values.length < 13) {
    values.push("");
  }

  const farm = {
    name: values[0] || "",
    address: values[1] || "",
    city: values[2] || "",
    state: values[3] || "",
    zip: values[4] || "",
    full_address: values[5] || "",
    farm_type: values[6] || "",
    produce: values[7] || "",
    phone: values[8] || "",
    website: values[9] || "",
    email: hasEmailColumn ? values[10] || "" : "",
    distance: hasEmailColumn ? values[11] || "" : values[10] || "",
    hours: hasEmailColumn ? values[12] || "" : values[11] || "",
    originalLine: line, // Keep original line for output
  };

  farms.push(farm);
}

console.log(`📊 Total farms before deduplication: ${farms.length}\n`);

// Remove duplicates based on name only (normalized)
const uniqueFarms = [];
const seenNames = new Set();
let duplicateCount = 0;

for (const farm of farms) {
  // Normalize name: lowercase, trim, remove extra spaces
  const normalizedName = farm.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s-]/g, ""); // Remove special chars for comparison

  if (seenNames.has(normalizedName)) {
    duplicateCount++;
    continue;
  }

  seenNames.add(normalizedName);
  uniqueFarms.push(farm);
}

console.log(`✅ Deduplication complete!`);
console.log(`   Removed: ${duplicateCount} duplicate entries (by name)`);
console.log(`   Remaining: ${uniqueFarms.length} unique farms\n`);

// Write deduplicated CSV
const csvRows = uniqueFarms.map((farm) => {
  // Reconstruct CSV line from original or build new one
  if (farm.originalLine) {
    return farm.originalLine;
  }

  // Build CSV row manually if needed
  const escapeCsvField = (field) => {
    if (!field) return "";
    const str = String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const hasEmailColumn = header.includes("email");
  const fields = [
    escapeCsvField(farm.name),
    escapeCsvField(farm.address),
    escapeCsvField(farm.city),
    escapeCsvField(farm.state),
    escapeCsvField(farm.zip),
    escapeCsvField(farm.full_address),
    escapeCsvField(farm.farm_type),
    escapeCsvField(farm.produce),
    escapeCsvField(farm.phone),
    escapeCsvField(farm.website),
  ];

  if (hasEmailColumn) {
    fields.push(escapeCsvField(farm.email));
  }

  fields.push(escapeCsvField(farm.distance));
  fields.push(escapeCsvField(farm.hours));

  return fields.join(",");
});

const output = [header, ...csvRows].join("\n");
fs.writeFileSync(csvPath, output);

console.log(`💾 Saved deduplicated CSV to: ${csvPath}\n`);
