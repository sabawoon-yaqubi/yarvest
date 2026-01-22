const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "..", "public", "farms_fixed.csv");

console.log("🧹 Cleaning up invalid farm entries...\n");

// State abbreviation to full name mapping
const stateAbbrevToFull = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

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
  let line = lines[i].trim();
  if (!line) continue;

  // Handle multi-line entries by checking if we're still in quotes
  // If line starts with quote but doesn't end properly, it might be a continuation
  let lineIndex = i;
  while (
    line &&
    line.match(/^"/) &&
    !line.match(/",/) &&
    lineIndex < lines.length - 1
  ) {
    lineIndex++;
    line += " " + lines[lineIndex].trim();
    i = lineIndex; // Skip the continuation lines
  }

  // Properly parse CSV with quoted fields
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

  const name = values[0]?.trim().replace(/^"|"$/g, "") || "";

  // Skip if no name or name is too short
  if (!name || name.length < 3) {
    removedCount++;
    continue;
  }

  // Extract address from original line before parsing splits it
  // The address field often contains "Street, City, State. Phone:..." which gets split by commas
  // We need to extract just the street address part (before Phone:, Email:, Open:, etc.)
  let originalLineAddress = "";
  const nameEnd = line.indexOf(",");
  if (nameEnd > 0) {
    const afterName = line.substring(nameEnd + 1);
    // Remove quotes from the beginning
    let cleanAfterName = afterName.replace(/^"+/, "");

    // Try to find address pattern: "Street, City, State. Phone:" or "Street, City. Phone:"
    // Look for pattern ending with period followed by Phone/Email/Open
    const patterns = [
      /^([^,]+(?:,\s*[^,]+){0,2}?)\s*\.\s*(?:Phone|Email|Open|Directions):/i,
      /^([^,]+(?:,\s*[^,]+)?)\s*\.\s*(?:Phone|Email|Open|Directions):/i,
    ];

    for (const pattern of patterns) {
      const match = cleanAfterName.match(pattern);
      if (match && match[1]) {
        const addr = match[1].trim();
        // Check if it looks like an address (has street number or common street words)
        if (
          addr.match(/^\d+/) ||
          addr.match(
            /\b(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Highway|Hwy|Route|Rt|Boulevard|Blvd)\b/i
          )
        ) {
          originalLineAddress = addr;
          break;
        }
      }
    }

    // If no pattern match, try to extract from first few comma-separated parts
    if (!originalLineAddress) {
      const parts = cleanAfterName.split(",");
      // Take first 1-2 parts that look like address
      for (let i = 1; i <= Math.min(2, parts.length); i++) {
        const potentialAddr = parts.slice(0, i).join(",").trim();
        // Check if it contains description phrases - if so, stop here
        if (
          potentialAddr.match(
            /Phone:|Email:|Open:|Directions:|For those|use DE|Our farm|Look for|Be sure|Ask for|if they|Click here/i
          )
        ) {
          // Extract just the part before the phrase
          const phraseMatch = potentialAddr.match(
            /^([^.]*?)(?:\s*\.\s*(?:Phone|Email|Open|Directions)|For those|use DE|Our farm|Look for|Be sure|Ask for|if they|Click here)/i
          );
          if (phraseMatch) {
            originalLineAddress = phraseMatch[1].trim();
          }
          break;
        }
        // If it looks like a valid address and is reasonable length, use it
        if (
          potentialAddr.length > 5 &&
          potentialAddr.length < 100 &&
          (potentialAddr.match(/^\d+/) ||
            potentialAddr.match(
              /\b(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr)\b/i
            ))
        ) {
          originalLineAddress = potentialAddr;
        }
      }
    }
  }

  // Use extracted address or fallback to parsed value
  let reconstructedAddress =
    originalLineAddress || values[1]?.trim().replace(/^"|"$/g, "") || "";

  // Clean the reconstructed address - remove any description phrases
  if (reconstructedAddress && reconstructedAddress !== "...") {
    const descPhrases = [
      "Phone:",
      "Email:",
      "Open:",
      "Directions:",
      "For those",
      "use DE",
      "Our farm",
      "Look for",
      "Be sure",
      "Ask for",
      "if they",
      "Click here",
      "Alternate Phone",
    ];
    for (const phrase of descPhrases) {
      const idx = reconstructedAddress
        .toLowerCase()
        .indexOf(phrase.toLowerCase());
      if (idx > 0) {
        reconstructedAddress = reconstructedAddress.substring(0, idx).trim();
        // Remove trailing punctuation
        reconstructedAddress = reconstructedAddress
          .replace(/[.,;:!?]+$/, "")
          .trim();
        break;
      }
    }
    // If address is too short or just "...", try to get it from values[1]
    if (reconstructedAddress.length < 5 || reconstructedAddress === "...") {
      const parsedAddr = values[1]?.trim().replace(/^"|"$/g, "") || "";
      if (
        parsedAddr &&
        parsedAddr.length > 5 &&
        !parsedAddr.match(/Phone:|Email:|Open:|Directions:/i)
      ) {
        reconstructedAddress = parsedAddr;
      }
    }
  }

  // Check against invalid patterns
  const isInvalid = invalidPatterns.some((pattern) => pattern.test(name));
  
  // Also check for invalid entries like "Gmail", "County", "Harvest Dates", etc.
  // These might be parsed incorrectly due to CSV issues, so check both name and raw field
  const rawFirstField = values[0]?.trim().replace(/^"+|"+$/g, "") || "";
  const invalidSimpleNames = ["Gmail", "County", "Harvest Dates", "Chattanooga", "Knoxville", "Nashville", "Memphis", "June", "Year", "July", "Pierre", "Juniata", "Pittsburgh", "Columbia", "Sweet Potatoes Plants"];
  if (invalidSimpleNames.includes(name) || invalidSimpleNames.some(inv => rawFirstField.startsWith(inv))) {
    removedCount++;
    continue;
  }
  
  // Check for patterns like "Gmail -", "County -", city names with "-", etc.
  const invalidPatternsList = [
    /^(Gmail|County|Harvest Dates|Central [A-Z][a-z]+|Salt Lake City|Berry Dairy Days|Chattanooga|Knoxville|Nashville|Memphis|June|Year|July|Sweet Potatoes Plants|To find choose|Pierre|Juniata|Pittsburgh|Columbia|Franklin County|Far Western [A-Z][a-z]+)\s*-/i,
    /^(Gmail|County|Harvest Dates)\s*,\s*[A-Z]/i,
    /^To find choose and cut-your-own/i,
  ];
  
  if (invalidPatternsList.some(pattern => pattern.test(name) || pattern.test(rawFirstField))) {
    removedCount++;
    continue;
  }

  // Also check for "Gmail -" entries which are invalid (may have quotes)
  // The name might be like "Gmail -" or "Gmail - ," so check both cleaned and original
  const cleanNameForCheck = name.replace(/^"+|"+$/g, "").trim();
  const originalName = values[0]?.trim().replace(/^"+|"+$/g, "") || "";

  if (
    /^Gmail\s*-/i.test(cleanNameForCheck) ||
    /^Gmail\s*-/i.test(originalName) ||
    /^County\s*-/i.test(cleanNameForCheck) ||
    /^County\s*-/i.test(originalName) ||
    /^Harvest Dates\s*-/i.test(cleanNameForCheck) ||
    /^Harvest Dates\s*-/i.test(originalName) ||
    /^Central [A-Z][a-z]+\s*-/i.test(cleanNameForCheck) ||
    /^Central [A-Z][a-z]+\s*-/i.test(originalName) ||
    /^Berry Dairy Days/i.test(cleanNameForCheck) ||
    /^Berry Dairy Days/i.test(originalName)
  ) {
    removedCount++;
    continue;
  }

  // Check for concatenated produce lists (e.g., "Watermelon festivalsPecan harvestingStrawberry celebrations")
  const hasConcatenatedProduce =
    /festivals[A-Z]|harvesting[A-Z]|picking[A-Z]|celebrations[A-Z]|experiences[A-Z]|foraging[A-Z]|tours[A-Z]|making[A-Z]|events[A-Z]|raking[A-Z]|tapping[A-Z]|hunting[A-Z]|stirring[A-Z]|chunkin[A-Z]|visits[A-Z]|feeds[A-Z]|hayrides[A-Z]|pressing[A-Z]|by the sea[A-Z]/i.test(
      name
    );

  // Check for single common words that are likely navigation elements
  const isSingleWordNav =
    /^(You|Copy|Find|Disclosure|Want|Share|Like|Follow|Subscribe|Privacy|Terms|About|Contact|Home|Menu|Search)$/i.test(
      name
    );

  // Check for invalid state values and convert abbreviations to full names
  let state = values[3]?.trim() || "";
  const invalidStates = [
    "Unknown",
    "Cherries",
    "Blueberries",
    "Tomatoes",
    "Raspberries",
    "Strawberries",
    "Search",
    "search engine",
    "Figs",
    "Blackberries",
    "Apples",
    "Peaches",
    "Pears",
    "Grapes",
    "Corn",
    "Pumpkins",
    "Find a co",
    "Green Beans",
    "Watermelons",
    "Other Vegetables",
    "Feedback",
  ];
  const hasInvalidState = invalidStates.includes(state);

  // Convert state abbreviation to full name if needed
  if (state && stateAbbrevToFull[state.toUpperCase()]) {
    state = stateAbbrevToFull[state.toUpperCase()];
  }

  // Check for very long names that are likely descriptions/metadata
  const isLongMetadata =
    name.length > 100 &&
    (name.includes("Since 2002") ||
      name.includes("Beware the copycat") ||
      name.includes("We update continuously") ||
      name.includes("learn to can and freeze"));

  // Clean up names that contain full addresses and descriptions
  // Extract just the farm name from entries like "Farm Name - Description" or "Farm Name, Address..."
  let cleanedName = name;

  // Always clean names that have " - " separator (take part before the dash)
  if (name.includes(" - ")) {
    const dashIndex = name.indexOf(" - ");
    const beforeDash = name.substring(0, dashIndex).trim();
    // Only use the part before dash if it's a reasonable farm name (3-80 chars)
    // Also check if it's a single word that's likely invalid (like "Wide", "Children", "Farm")
    const invalidSingleWords = [
      "Wide",
      "Children",
      "Farm",
      "Road",
      "Consumer",
      "Environmental",
      "Festivals",
      "Pumpkin",
      "Get",
      "With",
      "You",
      "Copy",
      "Find",
      "Disclosure",
      "Want",
      "Toggle",
      "Start",
      "Gmail",
      "Other",
      "Discover",
      "Don",
      "Click",
      "Water",
      "Pressure",
      "Canning",
      "Ball",
      "Blue",
      "Jars",
      "Lids",
      "Regular",
      "Food",
      "Dehydrator",
      "Bath",
      "Canner",
      "Air",
      "Fryer",
      "Smart",
      "All",
      "Need",
      "Share",
      "Like",
      "Follow",
      "Subscribe",
      "Privacy",
      "Terms",
      "About",
      "Contact",
      "Home",
      "Menu",
      "Search",
      "Olympia",
      "Skagit",
      "Charleston",
      "Harvest",
      "Dates",
      "Lettuce",
      "Onions",
      "Aug",
      "Mid",
      "Mountaineer",
      "Berry",
      "Dairy",
      "Days",
      "Coastal",
    ];
    // Check if it's a city/region name pattern
    const isCityOrRegion =
      /^(Olympia|Skagit|Charleston|Milwaukee|Madison|Detroit|Chicago|Atlanta|Phoenix|Houston|Dallas|Miami|Seattle|Portland|Denver|Boston|Philadelphia|Baltimore|Minneapolis|Oakland|Tucson|Fresno|Sacramento|Kansas|Mesa|Omaha|Cleveland|Tulsa|Wichita|Arlington|Tampa|Washington|Country|State)$/i.test(
        beforeDash
      );

    if (
      beforeDash.length >= 3 &&
      beforeDash.length <= 80 &&
      !invalidSingleWords.includes(beforeDash) &&
      !isCityOrRegion
    ) {
      cleanedName = beforeDash;
    } else {
      // Mark as invalid if it's just a single invalid word or city name
      cleanedName = ""; // Will be filtered out below
    }
  }

  if (cleanedName.length > 100) {
    // Pattern 1: If it contains "Phone:" or "Email:" or "Open:", truncate before that
    const phoneIndex = name.indexOf("Phone:");
    const emailIndex = name.indexOf("Email:");
    const openIndex = name.indexOf("Open:");
    const minIndex = Math.min(
      phoneIndex > 0 ? phoneIndex : Infinity,
      emailIndex > 0 ? emailIndex : Infinity,
      openIndex > 0 ? openIndex : Infinity
    );
    if (minIndex < Infinity && minIndex > 0 && minIndex < 200) {
      cleanedName = name.substring(0, minIndex).trim();
    }

    // Pattern 2: "Farm Name - Description" -> take part before " - " (but check it's reasonable)
    if (cleanedName.length > 100) {
      const dashMatch = cleanedName.match(/^([^-]+?)\s*-\s*/);
      if (dashMatch && dashMatch[1].length > 3 && dashMatch[1].length < 100) {
        cleanedName = dashMatch[1].trim();
      }
    }

    // Pattern 3: "Farm Name, Address..." -> take part before first comma if it's an address
    if (cleanedName.length > 100 && cleanedName.includes(",")) {
      const firstComma = cleanedName.indexOf(",");
      const afterComma = cleanedName.substring(firstComma + 1).trim();
      // If after comma looks like an address (starts with number or contains common address words)
      if (
        /^\d+/.test(afterComma) ||
        /^(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Highway|Hwy|Route|Rt|Boulevard|Blvd)/i.test(
          afterComma
        )
      ) {
        cleanedName = cleanedName.substring(0, firstComma).trim();
      }
    }

    // Pattern 4: If still too long, just take first 80 characters
    if (cleanedName.length > 100) {
      cleanedName = cleanedName.substring(0, 80).trim();
      // Remove trailing incomplete words and punctuation
      cleanedName = cleanedName.replace(/[\s,\.\-]+\S*$/, "");
    }
  }

  // Check if name ends with " - " (invalid entries like "Wide -", "Children -")
  // Also check the original name for patterns like "Name - ," or "Name" -"
  const endsWithDash =
    cleanedName.endsWith(" -") ||
    cleanedName.endsWith("-") ||
    name.endsWith(" -") ||
    name.endsWith(" - ,") ||
    name.match(/"\s*-\s*[,]?$/);

  // Check for entries with quotes and dashes like "Snohomish - ," or "County" -"
  const hasQuotedDashPattern =
    /^"[^"]+"\s*-\s*[,]?$/.test(name) || /^[^"]+"\s*-\s*[,]?$/.test(name);

  // Check for specific invalid patterns that appear in the data
  // These are invalid entries that should be removed
  const invalidNames = [
    "Gmail",
    "Snohomish",
    "County",
    "Island",
    "Coastal",
    "Washington",
    "State",
    "Berry",
    "Dairy",
    "Days",
    "Mountaineer",
    "Country",
    "Harvest",
    "Dates",
    "Berry Dairy Days",
    "Coastal Washington State",
    "Mountaineer Country",
    "Coastal North Carolina",
    "Richmond",
    "Fredericksburg",
    "Roanoke",
  ];
  const hasInvalidPattern = invalidNames.some((inv) => {
    const lowerName = cleanedName.toLowerCase();
    const lowerInv = inv.toLowerCase();
    const lowerOriginalName = name.toLowerCase();
    return (
      lowerName === lowerInv ||
      lowerName.startsWith(lowerInv + " -") ||
      lowerOriginalName.includes(lowerInv + " -") ||
      (lowerName.includes(lowerInv) &&
        (lowerOriginalName.includes(" -") ||
          lowerOriginalName.includes('"'))) ||
      (lowerName === lowerInv && lowerOriginalName.endsWith(" -"))
    );
  });

  // Also check if cleaned name is just "Gmail" or "County" (common invalid entries)
  const isJustInvalidWord = [
    "Gmail",
    "County",
    "Island",
    "Richmond",
    "Fredericksburg",
    "Roanoke",
  ].includes(cleanedName);

  // Check if it's just a city name (common pattern: "CityName -" or just "CityName")
  const isCityName =
    /^[A-Z][a-z]+$/.test(cleanedName) &&
    cleanedName.length < 20 &&
    (cleanedName.match(
      /^(Milwaukee|Madison|Detroit|Chicago|Atlanta|Phoenix|Houston|Dallas|Miami|Seattle|Portland|Denver|Boston|Philadelphia|Baltimore|Minneapolis|Oakland|Tucson|Fresno|Sacramento|Kansas|Mesa|Omaha|Cleveland|Tulsa|Wichita|Arlington|Tampa|New|San|Los|Las|St|Fort|North|South|East|West|Olympia|Skagit|Charleston|Washington)$/i
    ) ||
      (state && cleanedName === state)); // If name matches state, it's likely invalid

  // Check for invalid patterns like "Harvest Dates -", "Lettuce -", "Onions -", "Aug -"
  const isInvalidProduceOrDate =
    /^(Harvest|Dates|Lettuce|Onions|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Mid|Mountaineer|Gmail|Berry|Dairy|Days|Coastal)$/i.test(
      cleanedName
    );

  // Check for entries that are just region/state names
  const isRegionName = /^(Washington|Country|State|Mountaineer|Coastal)$/i.test(
    cleanedName
  );

  // Check for entries with quotes and dashes (like "Gmail" -", "Snohomish -", "County" -")
  const hasQuotesAndDash =
    /^"[^"]+"\s*-/i.test(name) ||
    /^[^"]+"\s*-/i.test(name) ||
    /County"\s*-/i.test(name) ||
    /Island"\s*-/i.test(name);

  // Also check for other invalid patterns
  if (
    isInvalid ||
    name === "First" ||
    name.startsWith("←") ||
    name.match(/^\d+$/) || // Just numbers
    cleanedName.length > 100 || // Still too long after cleaning
    cleanedName.length < 3 || // Too short
    hasConcatenatedProduce || // Concatenated produce lists
    hasInvalidState || // Invalid state values
    isLongMetadata || // Long metadata/description text
    isSingleWordNav || // Single word navigation elements
    endsWithDash || // Ends with dash (invalid)
    hasQuotedDashPattern || // Has quoted dash pattern (invalid)
    hasInvalidPattern || // Has specific invalid patterns
    isJustInvalidWord || // Is just an invalid word like "Gmail" or "County"
    isCityName || // Is a city name
    isInvalidProduceOrDate || // Invalid produce/date names
    isRegionName || // Is a region/state name
    /^With - you can/i.test(cleanedName) || // Incomplete phrases
    (/^[A-Z][a-z]+ - [a-z]+$/i.test(cleanedName) && cleanedName.length < 15) // Short incomplete phrases
  ) {
    removedCount++;
    continue;
  }

  // Clean up produce field - limit length to 150 characters for UI
  const produceIndex = 7; // produce is the 8th field (index 7)
  let cleanedProduce = values[produceIndex]?.trim().replace(/^"|"$/g, "") || "";

  if (cleanedProduce.length > 150) {
    // Truncate to 150 chars and add ellipsis if needed
    cleanedProduce = cleanedProduce.substring(0, 147).trim() + "...";
  }

  // Helper function to truncate long text fields for UI
  const truncateField = (field, maxLength = 100) => {
    if (!field) return "";
    const str = String(field).trim();
    if (str.length > maxLength) {
      return str.substring(0, maxLength - 3).trim() + "...";
    }
    return str;
  };

  // Clean up long fields that make UI ugly
  // Field indices: name(0), address(1), city(2), state(3), zip(4), full_address(5),
  // farm_type(6), produce(7), phone(8), website(9), email(10), distance(11), hours(12)
  const addressIndex = 1;
  const fullAddressIndex = 5;
  const hoursIndex = 12;

  // Get original field values before cleaning
  // Use reconstructed address if available, otherwise use the parsed value
  let originalAddress =
    reconstructedAddress ||
    values[addressIndex]?.trim().replace(/^"|"$/g, "") ||
    "";
  let originalFullAddress =
    values[fullAddressIndex]?.trim().replace(/^"|"$/g, "") || "";
  let originalHours = values[hoursIndex]?.trim().replace(/^"|"$/g, "") || "";

  // Truncate address - if it contains long descriptions, extract just the street address part
  let cleanedAddress = originalAddress;

  // If address is empty or just "...", try to extract from full_address or reconstructed address
  if (
    !cleanedAddress ||
    cleanedAddress === "..." ||
    cleanedAddress.length < 5
  ) {
    // Try to get address from full_address field
    if (originalFullAddress) {
      // Extract street address from full_address (before city/state)
      const addrMatch = originalFullAddress.match(/^([^,]+(?:\s+[^,]+)?)/);
      if (addrMatch && addrMatch[1].length > 5 && addrMatch[1].length < 100) {
        cleanedAddress = addrMatch[1].trim();
      }
    }
    // If still empty, try reconstructed address
    if (
      (!cleanedAddress ||
        cleanedAddress === "..." ||
        cleanedAddress.length < 5) &&
      reconstructedAddress
    ) {
      cleanedAddress = reconstructedAddress;
    }
  }

  // Clean address - remove description phrases
  if (cleanedAddress && cleanedAddress !== "...") {
    const descPhrases = [
      "Phone:",
      "Email:",
      "Open:",
      "Directions:",
      "For those",
      "use DE",
      "Our farm",
      "Look for",
      "Be sure",
      "Ask for",
      "if they",
      "Click here",
      "Alternate Phone",
    ];
    for (const phrase of descPhrases) {
      const idx = cleanedAddress.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx > 0) {
        cleanedAddress = cleanedAddress.substring(0, idx).trim();
        cleanedAddress = cleanedAddress.replace(/[.,;:!?]+$/, "").trim();
        break;
      }
    }
    // If address contains city/state, extract just the street part
    if (cleanedAddress.includes(",")) {
      const parts = cleanedAddress.split(",");
      // Take first part if it looks like a street address
      if (
        parts[0] &&
        (parts[0].match(/^\d+/) ||
          parts[0].match(
            /\b(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr)\b/i
          ))
      ) {
        cleanedAddress = parts[0].trim();
      }
    }
  }

  // If still too long, truncate (but not to "...")
  if (
    cleanedAddress &&
    cleanedAddress.length > 100 &&
    cleanedAddress !== "..."
  ) {
    cleanedAddress = truncateField(cleanedAddress, 100);
  }

  // Final check - if address is still "..." or too short, try to extract from the full line
  if (
    !cleanedAddress ||
    cleanedAddress === "..." ||
    cleanedAddress.length < 5
  ) {
    // Try to find a street address pattern in the line (e.g., "123 Main St" or "123 Main Street")
    const streetAddrPattern =
      /\b(\d+\s+[A-Za-z0-9\s]+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Highway|Hwy|Route|Rt|Boulevard|Blvd|Court|Ct|Circle|Cir|Way|Parkway|Pkwy))\b/i;
    const streetMatch = line.match(streetAddrPattern);
    if (streetMatch && streetMatch[1]) {
      cleanedAddress = streetMatch[1].trim();
      // If address contains description phrases, truncate before them
      const descPhrases = [
        "Phone:",
        "Email:",
        "Open:",
        "Directions:",
        "For those",
        "use DE",
      ];
      for (const phrase of descPhrases) {
        const idx = cleanedAddress.toLowerCase().indexOf(phrase.toLowerCase());
        if (idx > 0) {
          cleanedAddress = cleanedAddress.substring(0, idx).trim();
          cleanedAddress = cleanedAddress.replace(/[.,;:!?]+$/, "").trim();
          break;
        }
      }
    } else {
      // Fallback: try to get from values[1] directly
      const directAddr = values[1]?.trim().replace(/^"|"$/g, "") || "";
      if (
        directAddr &&
        directAddr.length > 5 &&
        directAddr !== "..." &&
        !directAddr.match(/Phone:|Email:|Open:|Directions:/i)
      ) {
        // Extract just the street address part
        const streetMatch = directAddr.match(/^([^,]+(?:\s+[^,]+)?)/);
        if (streetMatch) {
          cleanedAddress = streetMatch[1].trim();
        } else {
          cleanedAddress = directAddr.substring(0, 80).trim();
        }
      }
    }
  }

  // If address is still "..." or empty, try to extract from full_address
  if (
    !cleanedAddress ||
    cleanedAddress === "..." ||
    cleanedAddress.length < 5
  ) {
    if (originalFullAddress) {
      // Try to extract street address from full_address (usually first part before comma)
      const addrParts = originalFullAddress.split(",");
      if (addrParts[0] && addrParts[0].trim().length > 5) {
        const potentialAddr = addrParts[0].trim();
        // Check if it looks like a street address
        if (
          potentialAddr.match(/^\d+/) ||
          potentialAddr.match(
            /\b(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr)\b/i
          )
        ) {
          // Remove description phrases
          let cleanAddr = potentialAddr;
          const descPhrases = ["Phone:", "Email:", "Open:", "Directions:"];
          for (const phrase of descPhrases) {
            const idx = cleanAddr.toLowerCase().indexOf(phrase.toLowerCase());
            if (idx > 0) {
              cleanAddr = cleanAddr.substring(0, idx).trim();
              cleanAddr = cleanAddr.replace(/[.,;:!?]+$/, "").trim();
              break;
            }
          }
          if (cleanAddr.length > 5 && cleanAddr.length < 100) {
            cleanedAddress = cleanAddr;
          }
        }
      }
    }
  }

  // If address is still "..." or empty, set to empty string (don't use "...")
  if (!cleanedAddress || cleanedAddress === "...") {
    cleanedAddress = "";
  }

  // Truncate full_address and hours
  let cleanedFullAddress = truncateField(originalFullAddress, 120);
  let cleanedHours = truncateField(originalHours, 100);

  // Also truncate any field that contains long description phrases
  // Check all fields for long descriptions and truncate them
  const longDescriptionPhrases = [
    "Please call ahead",
    "check our Facebook page",
    "to make sure we are open",
    "to avoid disappointment",
    "Click here for",
    "UPDATED:",
    "ADDED:",
    "Click here to update",
    "We have to wait",
    "depending on the weather",
    "Directions:",
    "We are conveniently located",
    "For those coming from",
    "use DE 404/18",
    "DE 16 to reach",
    "Our farm market is on",
    "southbound side",
    "Look for",
    "Be sure to verify",
    "Ask for us at",
    "if they are using",
    "they are using TS Smith",
    "Click here for our Facebook",
    "Be sure to verify and see",
  ];

  // Clean all fields that might contain long descriptions
  // Apply stricter limits to specific fields that should be short
  const fieldMaxLengths = {
    1: 80, // address - should be just street address
    2: 30, // city - should be just city name
    5: 100, // full_address - can be longer but not too long
    12: 80, // hours - should be concise
  };

  const cleanedValues = values.map((val, idx) => {
    const fieldValue = val?.trim().replace(/^"|"$/g, "") || "";
    if (!fieldValue) return val;

    // Apply field-specific max length
    const maxLength = fieldMaxLengths[idx] || 150;

    // For city field (index 2), be very strict - it should only be a city name
    if (idx === 2 && fieldValue.length > 30) {
      // Extract just the city name (before any periods, commas with extra text, "Phone:", "Email:", etc.)
      // Remove common patterns that indicate it's not just a city name
      let cityName = fieldValue;

      // Remove everything after "Phone:", "Email:", "Open:", ". Phone", etc.
      const phoneMatch = cityName.match(/^([^.]*?)(?:\s*\.\s*Phone|Phone:)/i);
      const emailMatch = cityName.match(/^([^.]*?)(?:\s*\.\s*Email|Email:)/i);
      const openMatch = cityName.match(/^([^.]*?)(?:\s*\.\s*Open|Open:)/i);

      if (phoneMatch && phoneMatch[1].length < cityName.length) {
        cityName = phoneMatch[1].trim();
      } else if (emailMatch && emailMatch[1].length < cityName.length) {
        cityName = emailMatch[1].trim();
      } else if (openMatch && openMatch[1].length < cityName.length) {
        cityName = openMatch[1].trim();
      }

      // If still contains comma and looks like "City, State" or "City, State. Phone", extract just city
      if (cityName.includes(",")) {
        const parts = cityName.split(",");
        cityName = parts[0].trim();
      }

      // Remove trailing state abbreviations or zip codes
      cityName = cityName.replace(
        /\s+(DE|AL|AK|AZ|AR|CA|CO|CT|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\s*\d*$/i,
        ""
      );

      if (cityName.length <= 30 && cityName.length > 0) {
        return cityName;
      }
      return truncateField(cityName, 30);
    }

    // Check if it contains long description phrases
    const hasLongDescription = longDescriptionPhrases.some((phrase) =>
      fieldValue.toLowerCase().includes(phrase.toLowerCase())
    );

    if (hasLongDescription) {
      // Find the earliest occurrence of any phrase and truncate before it
      let earliestIndex = Infinity;
      for (const phrase of longDescriptionPhrases) {
        const phraseIdx = fieldValue
          .toLowerCase()
          .indexOf(phrase.toLowerCase());
        if (phraseIdx >= 0 && phraseIdx < earliestIndex) {
          earliestIndex = phraseIdx;
        }
      }

      if (earliestIndex < Infinity && earliestIndex > 0) {
        // Truncate before the phrase, but keep it under maxLength
        let truncated = fieldValue
          .substring(0, Math.min(earliestIndex, maxLength - 3))
          .trim();
        // Remove trailing punctuation and add ellipsis
        truncated = truncated.replace(/[.,;:!?]+$/, "").trim();
        return truncated + "...";
      } else if (fieldValue.length > maxLength) {
        // If phrase is at the start or not found, just truncate to maxLength
        return truncateField(fieldValue, maxLength);
      }
    } else if (fieldValue.length > maxLength) {
      // Truncate any long field even without phrases
      return truncateField(fieldValue, maxLength);
    }

    return val; // Return original if no truncation needed
  });

  // Update values array with cleaned values - remove existing quotes first
  const finalCleanedValues = cleanedValues.map((val) => {
    if (!val) return "";
    // Remove all existing quotes and trim
    let cleanVal = String(val)
      .replace(/^"+|"+$/g, "")
      .replace(/""/g, '"')
      .trim();
    return cleanVal;
  });

  for (
    let idx = 0;
    idx < Math.min(finalCleanedValues.length, values.length);
    idx++
  ) {
    values[idx] = finalCleanedValues[idx];
  }

  // Helper function to escape CSV fields (only escape when necessary, avoid double-escaping)
  const escapeCsvField = (field) => {
    if (!field) return "";
    // Remove any existing quotes first
    let str = String(field)
      .replace(/^"+|"+$/g, "")
      .trim();
    if (!str) return "";
    // Only escape if field contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      // Replace existing quotes with double quotes, then wrap
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Always update the line with cleaned name, produce, state, and other long fields
  const updatedValues = [...values];
  updatedValues[0] = escapeCsvField(cleanedName);
  updatedValues[3] = escapeCsvField(state); // Always use full state name
  updatedValues[produceIndex] = escapeCsvField(cleanedProduce);
  updatedValues[addressIndex] = escapeCsvField(cleanedAddress);

  // Ensure full_address and hours are properly cleaned
  if (updatedValues.length > fullAddressIndex) {
    updatedValues[fullAddressIndex] = escapeCsvField(cleanedFullAddress);
  }
  if (updatedValues.length > hoursIndex) {
    updatedValues[hoursIndex] = escapeCsvField(cleanedHours);
  }

  // Clean all other fields to remove quotes and ensure proper escaping
  for (let idx = 0; idx < updatedValues.length; idx++) {
    const val = updatedValues[idx];
    if (val && typeof val === "string") {
      // Remove excessive quotes
      let cleanVal = val.replace(/^"+|"+$/g, "").trim();
      // Re-escape if needed
      updatedValues[idx] = escapeCsvField(cleanVal);
    }
  }

  const updatedLine = updatedValues.join(",");

  validFarms.push(updatedLine);
}

// Write cleaned CSV
fs.writeFileSync(csvPath, validFarms.join("\n"));

console.log(`✅ Cleanup complete!`);
console.log(`   Removed: ${removedCount} invalid entries`);
console.log(`   Remaining: ${validFarms.length - 1} valid farms`);
console.log(`   Saved to: ${csvPath}\n`);
