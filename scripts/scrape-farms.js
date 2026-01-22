/**
 * Web Scraping Script for Farms Data from Multiple Sources
 *
 * Sources:
 * - https://findupickfarms.com/
 * - https://pickyourown.farm/
 * - https://www.pickyourown.org/US.htm
 * - https://upickguide.com/
 *
 * Install dependencies:
 * npm install puppeteer
 *
 * Usage: node scripts/scrape-farms.js
 *
 * IMPORTANT: Always check robots.txt and terms of service before scraping!
 * Be respectful - add delays between requests!
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Helper function to escape CSV fields
function escapeCsvField(field) {
  if (!field) return "";
  const str = String(field).trim();
  // Replace double quotes with two double quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Helper function to delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Normalize farm object to ensure it has all 12 required properties
 * This matches the exact CSV format: name,address,city,state,zip,full_address,farm_type,produce,phone,website,email,distance,hours
 */
function normalizeFarm(farm) {
  return {
    name: (farm.name || "").trim(),
    address: (farm.address || "").trim(),
    city: (farm.city || "").trim(),
    state: (farm.state || "").trim(),
    zip: (farm.zip || "").trim(),
    full_address: (farm.full_address || "").trim(),
    farm_type: (farm.farm_type || "U-Pick Farm, Orchard").trim(),
    produce: (farm.produce || "").trim(),
    phone: (farm.phone || "").trim(),
    website: (farm.website || "").trim(),
    email: (farm.email || "").trim(),
    distance: (farm.distance || "").trim(),
    hours: (farm.hours || "").trim(),
  };
}

/**
 * Parse existing CSV file - same logic as pre-geocode-farms.js
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const farms = [];
  const header = lines[0] || "";

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
    };

    if (farm.name && farm.name.trim() !== "") {
      farms.push(farm);
    }
  }

  return farms;
}

/**
 * Scrape from findupickfarms.com
 */
async function scrapeFindUpickFarms(browser) {
  console.log("\n=== Scraping findupickfarms.com ===");
  const farms = [];
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate to main page with longer timeout
    try {
      await page.goto("https://findupickfarms.com/", {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      await delay(3000);
    } catch (error) {
      console.log("  Warning: Page load timeout, trying to continue...");
      await delay(2000);
    }

    // Get all state links - filter for actual US states
    const stateLinks = await page.$$eval(
      "a[href*='/state/'], a[href*='?state=']",
      (links) => {
        const usStates = [
          "Alabama",
          "Alaska",
          "Arizona",
          "Arkansas",
          "California",
          "Colorado",
          "Connecticut",
          "Delaware",
          "Florida",
          "Georgia",
          "Hawaii",
          "Idaho",
          "Illinois",
          "Indiana",
          "Iowa",
          "Kansas",
          "Kentucky",
          "Louisiana",
          "Maine",
          "Maryland",
          "Massachusetts",
          "Michigan",
          "Minnesota",
          "Mississippi",
          "Missouri",
          "Montana",
          "Nebraska",
          "Nevada",
          "New Hampshire",
          "New Jersey",
          "New Mexico",
          "New York",
          "North Carolina",
          "North Dakota",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Pennsylvania",
          "Rhode Island",
          "South Carolina",
          "South Dakota",
          "Tennessee",
          "Texas",
          "Utah",
          "Vermont",
          "Virginia",
          "Washington",
          "West Virginia",
          "Wisconsin",
          "Wyoming",
        ];

        return links
          .map((link) => ({
            text: link.textContent.trim(),
            href: link.href,
          }))
          .filter((link) => {
            if (!link.text) return false;
            const isState = usStates.some(
              (state) =>
                link.text.includes(state) ||
                link.text.match(new RegExp(`^${state}`, "i"))
            );
            return isState;
          });
      }
    );

    console.log(`Found ${stateLinks.length} state links`);
    if (stateLinks.length > 0) {
      console.log(
        `  First few: ${stateLinks
          .slice(0, 5)
          .map((l) => l.text)
          .join(", ")}`
      );
    }

    // Scrape each state (remove limit to scrape all states)
    for (let i = 0; i < stateLinks.length; i++) {
      const stateLink = stateLinks[i];
      console.log(`Scraping state: ${stateLink.text}...`);

      let retryCount = 0;
      const maxRetries = 2;
      let pageLoaded = false;

      while (retryCount <= maxRetries && !pageLoaded) {
        try {
          await page.goto(stateLink.href, {
            waitUntil: "domcontentloaded",
            timeout: 120000, // Increased timeout
          });
          await delay(3000);
          pageLoaded = true;
        } catch (error) {
          retryCount++;
          if (retryCount > maxRetries) {
            console.log(
              `  Warning: Timeout loading ${stateLink.text} after ${maxRetries} retries, skipping...`
            );
            break; // Break out of while loop, then continue to next state
          }
          console.log(
            `  Retrying ${stateLink.text} (attempt ${retryCount + 1})...`
          );
          await delay(5000);
        }
      }

      if (!pageLoaded) {
        continue; // Skip to next state if page didn't load
      }

      try {
        // Wait for farm listings to load - wait longer and try multiple strategies
        try {
          await page.waitForSelector(
            "article, [class*='card'], [class*='farm'], [class*='listing'], h2, h3",
            {
              timeout: 15000,
            }
          );
          await delay(3000); // Extra wait for dynamic content
        } catch (e) {
          // Continue anyway, might still find data
        }

        // Auto-scroll to load all lazy-loaded content
        console.log(`  Scrolling to load all farms...`);
        let previousHeight = 0;
        let currentHeight = await page.evaluate(
          () => document.body.scrollHeight
        );
        let scrollAttempts = 0;
        const maxScrollAttempts = 20; // Prevent infinite scrolling

        while (
          previousHeight !== currentHeight &&
          scrollAttempts < maxScrollAttempts
        ) {
          previousHeight = currentHeight;

          // Scroll to bottom
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
          });

          await delay(2000); // Wait for new content to load

          // Check for "Load More" or "Show More" buttons and click them
          try {
            const loadMoreButton = await page.evaluate(() => {
              const buttons = Array.from(
                document.querySelectorAll(
                  'button, a, [class*="load"], [class*="more"], [class*="show"]'
                )
              );
              const loadMore = buttons.find((btn) => {
                const text = btn.textContent?.toLowerCase() || "";
                return (
                  text.includes("load more") ||
                  text.includes("show more") ||
                  text.includes("see more") ||
                  text.includes("next")
                );
              });
              if (loadMore) {
                loadMore.click();
                return true;
              }
              return false;
            });

            if (loadMoreButton) {
              await delay(3000); // Wait after clicking
            }
          } catch (e) {
            // Ignore errors
          }

          currentHeight = await page.evaluate(() => document.body.scrollHeight);
          scrollAttempts++;
        }

        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await delay(1000);

        // Extract farm data - match CSV structure exactly: name,address,city,state,zip,full_address,farm_type,produce,phone,website,distance,hours
        const stateFarms = await page.evaluate((currentState) => {
          const farms = [];

          // Strategy 1: Try multiple selectors to find farm cards
          const selectors = [
            "article",
            "[class*='card']",
            "[class*='farm']",
            "[class*='listing']",
            "[class*='item']",
            "div[class*='Farm']",
            "div[class*='farm']",
            "li[class*='farm']",
            "div[role='article']",
          ];

          let farmCards = [];
          let usedSelector = "";
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 2) {
              // Need at least a few to be valid
              farmCards = Array.from(elements);
              usedSelector = selector;
              break;
            }
          }

          // Strategy 2: If no cards found, look for headings with nearby content
          if (farmCards.length === 0) {
            const headings = Array.from(
              document.querySelectorAll("h2, h3, h4")
            );
            headings.forEach((heading) => {
              // Get parent container
              let parent = heading.parentElement;
              // Look for a container that has multiple children (likely a card)
              while (parent && parent !== document.body) {
                if (
                  parent.children.length > 1 ||
                  parent.textContent.length > 20
                ) {
                  farmCards.push(parent);
                  break;
                }
                parent = parent.parentElement;
              }
            });
          }

          // Strategy 3: Always look for more divs/sections that might contain farm info
          // Look for any divs/sections that might contain farm info
          const allDivs = Array.from(
            document.querySelectorAll("div, section, article, li")
          );
          allDivs.forEach((div) => {
            const text = div.textContent?.trim() || "";
            // Check if it looks like a farm entry (has name-like text and location)
            if (text.length > 30 && text.length < 500) {
              const hasLocation = /[A-Z][a-z]+,\s*[A-Z]{2}/.test(text);
              const firstLine = text.split("\n")[0]?.trim() || "";
              const hasName =
                /^[A-Z][a-z]+/.test(firstLine) &&
                firstLine.length > 3 &&
                firstLine.length < 100;
              // Also check for farm-related keywords
              const hasFarmKeyword = /farm|orchard|berry|pick|u-pick/i.test(
                text
              );

              if (
                hasName &&
                (hasLocation || hasFarmKeyword) &&
                !farmCards.includes(div)
              ) {
                // Make sure it's not a duplicate by checking text similarity
                const isDuplicate = farmCards.some((card) => {
                  const cardText = card.textContent?.trim() || "";
                  return cardText.substring(0, 50) === text.substring(0, 50);
                });
                if (!isDuplicate) {
                  farmCards.push(div);
                }
              }
            }
          });

          // Remove duplicates
          const uniqueCards = [];
          const seenText = new Set();

          farmCards.forEach((card) => {
            const cardText = card.textContent?.trim() || "";
            if (cardText.length < 10 || seenText.has(cardText)) return;
            seenText.add(cardText);
            uniqueCards.push(card);
          });

          // Return metadata for logging
          const metadata = {
            totalCards: uniqueCards.length,
            usedSelector: usedSelector,
            sampleNames: [],
          };

          uniqueCards.forEach((card) => {
            // Extract name - look for headings or bold text, or first significant text
            let name = "";
            const nameEl = card.querySelector(
              "h1, h2, h3, h4, [class*='name'], [class*='title'], strong, b"
            );
            if (nameEl) {
              name = nameEl.textContent?.trim() || "";
            } else {
              // Try to get first line of text
              const text = card.textContent?.trim() || "";
              const lines = text
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l && l.length > 2);
              if (lines.length > 0) {
                name = lines[0].substring(0, 100); // Limit length
              }
            }

            if (!name || name.length < 2) return; // Skip if no valid name

            // Collect sample names for logging
            if (metadata.sampleNames.length < 3) {
              metadata.sampleNames.push(name);
            }

            // Extract location - look for location text (usually "City, State" format)
            let locationText = "";
            const locationEl = card.querySelector(
              "[class*='location'], [class*='address'], [class*='city'], svg + span, [class*='pin'] + span, [class*='map'] + span, [class*='place']"
            );
            if (locationEl) {
              locationText = locationEl.textContent?.trim() || "";
            } else {
              // Try to find "City, ST" pattern in card text
              const cardText = card.textContent || "";
              const locationMatch = cardText.match(
                /([A-Z][a-z]+(?: [A-Z][a-z]+)*(?:, [A-Z][a-z]+)*),\s*([A-Z]{2})\b/
              );
              if (locationMatch) {
                locationText = locationMatch[0];
              }
            }

            // Parse city and state from location text (format: "City, State" or "City, ST")
            let city = "";
            let state = "";
            if (locationText) {
              const parts = locationText.split(",").map((p) => p.trim());
              if (parts.length >= 2) {
                city = parts[0];
                // Check if second part is state abbreviation (2 letters)
                if (parts[1].length <= 2) {
                  state = parts[1];
                } else {
                  // Might be full state name, extract abbreviation or use as-is
                  state = parts[1];
                }
              } else {
                city = locationText;
              }
            }

            // Extract full address if available
            const fullAddressEl = card.querySelector(
              "[class*='full-address'], [class*='complete-address']"
            );
            let fullAddress = fullAddressEl?.textContent?.trim() || "";

            // Build full address if not found
            if (!fullAddress && (city || state)) {
              fullAddress = locationText || `${city}, ${state}`.trim();
            }

            // Extract other fields
            const address =
              card
                .querySelector("[class*='street'], [class*='street-address']")
                ?.textContent?.trim() || "";
            const zip =
              card
                .querySelector("[class*='zip'], [class*='postal']")
                ?.textContent?.trim() || "";
            const produce =
              card
                .querySelector(
                  "[class*='produce'], [class*='crops'], [class*='products']"
                )
                ?.textContent?.trim() || "";
            const phoneEl = card.querySelector(
              "[class*='phone'], a[href^='tel:']"
            );
            const phone =
              phoneEl?.textContent?.trim() ||
              phoneEl?.getAttribute("href")?.replace("tel:", "") ||
              "";
            const websiteEl = card.querySelector(
              "a[href^='http']:not([href*='findupickfarms']), a[href^='https']:not([href*='findupickfarms'])"
            );
            const website = websiteEl?.href || "";

            // Extract email
            const emailEl = card.querySelector("a[href^='mailto:']");
            const email =
              emailEl?.getAttribute("href")?.replace("mailto:", "") || "";
            // Also try to find email in text (pattern: text@domain.com)
            const emailMatch = card.textContent?.match(
              /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
            );
            const emailFromText = emailMatch ? emailMatch[0] : "";
            const finalEmail = email || emailFromText;

            const distance =
              card.querySelector("[class*='distance']")?.textContent?.trim() ||
              "";
            const hours =
              card
                .querySelector("[class*='hours'], [class*='time']")
                ?.textContent?.trim() || "";

            // Default farm type
            const farmType = "U-Pick Farm, Orchard";

            farms.push({
              name,
              address,
              city,
              state: state || currentState, // Use current state if not found
              zip,
              full_address:
                fullAddress ||
                `${address}, ${city}, ${state || currentState}`.trim(),
              farm_type: farmType,
              produce,
              phone,
              website,
              email: finalEmail,
              distance,
              hours,
            });
          });

          return { farms, metadata };
        }, stateLink.text.match(/^([A-Za-z\s]+)/)?.[1]?.trim() || "");

        // Log extraction details
        if (stateFarms.metadata) {
          console.log(
            `  📊 Extraction stats for ${stateLink.text}: ${stateFarms.metadata.totalCards} cards found using selector "${stateFarms.metadata.usedSelector}"`
          );
          if (stateFarms.metadata.sampleNames.length > 0) {
            console.log(
              `  📝 Sample farms: ${stateFarms.metadata.sampleNames.join(", ")}`
            );
          }
        }

        // Normalize farms after extraction
        const extractedFarms = stateFarms.farms || stateFarms; // Handle both old and new format
        const normalizedFarms = extractedFarms.map((farm) =>
          normalizeFarm(farm)
        );
        farms.push(...normalizedFarms);
        console.log(
          `  ✅ Found ${normalizedFarms.length} farms in ${stateLink.text}`
        );
      } catch (error) {
        console.error(`  Error scraping ${stateLink.text}:`, error.message);
      }

      await delay(2000); // Be respectful
    }
  } catch (error) {
    console.error("Error scraping findupickfarms.com:", error.message);
    console.log("Continuing with other sources...");
  } finally {
    await page.close();
  }

  console.log(`\n✅ findupickfarms.com: Total ${farms.length} farms scraped`);
  if (farms.length > 0) {
    console.log(
      `   Sample farms: ${farms
        .slice(0, 5)
        .map((f) => f.name)
        .join(", ")}`
    );
  }
  return farms;
}

/**
 * Scrape from pickyourown.farm
 */
async function scrapePickYourOwnFarm(browser) {
  console.log("\n=== Scraping pickyourown.farm ===");
  const farms = [];
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate to main page
    try {
      await page.goto("https://pickyourown.farm/", {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      await delay(3000);
    } catch (error) {
      console.log("  Warning: Page load timeout, trying to continue...");
      await delay(2000);
    }

    // Get state links - filter for actual US states
    const stateLinks = await page.$$eval(
      "a[href*='/state/'], a[href*='state=']",
      (links) => {
        const usStates = [
          "Alabama",
          "Alaska",
          "Arizona",
          "Arkansas",
          "California",
          "Colorado",
          "Connecticut",
          "Delaware",
          "Florida",
          "Georgia",
          "Hawaii",
          "Idaho",
          "Illinois",
          "Indiana",
          "Iowa",
          "Kansas",
          "Kentucky",
          "Louisiana",
          "Maine",
          "Maryland",
          "Massachusetts",
          "Michigan",
          "Minnesota",
          "Mississippi",
          "Missouri",
          "Montana",
          "Nebraska",
          "Nevada",
          "New Hampshire",
          "New Jersey",
          "New Mexico",
          "New York",
          "North Carolina",
          "North Dakota",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Pennsylvania",
          "Rhode Island",
          "South Carolina",
          "South Dakota",
          "Tennessee",
          "Texas",
          "Utah",
          "Vermont",
          "Virginia",
          "Washington",
          "West Virginia",
          "Wisconsin",
          "Wyoming",
        ];

        return Array.from(links)
          .map((link) => ({
            text: link.textContent.trim(),
            href: link.href,
          }))
          .filter((link) => {
            if (!link.text || !link.href) return false;
            const isState = usStates.some(
              (state) =>
                link.text.includes(state) ||
                link.text.match(new RegExp(`^${state}`, "i"))
            );
            return isState;
          });
      }
    );

    console.log(`Found ${stateLinks.length} state links`);
    if (stateLinks.length > 0) {
      console.log(
        `  First few: ${stateLinks
          .slice(0, 5)
          .map((l) => l.text)
          .join(", ")}`
      );
    }

    // Scrape each state
    for (let i = 0; i < stateLinks.length; i++) {
      const stateLink = stateLinks[i];
      console.log(`Scraping state: ${stateLink.text}...`);

      try {
        try {
          await page.goto(stateLink.href, {
            waitUntil: "domcontentloaded",
            timeout: 90000,
          });
          await delay(3000);
        } catch (error) {
          console.log(
            `  Warning: Timeout loading ${stateLink.text}, skipping...`
          );
          continue;
        }

        // Wait for content to load
        await page
          .waitForSelector(
            "article, [class*='card'], [class*='farm'], [class*='listing']",
            {
              timeout: 10000,
            }
          )
          .catch(() => {});

        // Auto-scroll to load all lazy-loaded content
        let previousHeight = 0;
        let currentHeight = await page.evaluate(
          () => document.body.scrollHeight
        );
        let scrollAttempts = 0;
        const maxScrollAttempts = 15;

        while (
          previousHeight !== currentHeight &&
          scrollAttempts < maxScrollAttempts
        ) {
          previousHeight = currentHeight;
          await page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight)
          );
          await delay(2000);

          try {
            await page.evaluate(() => {
              const buttons = Array.from(
                document.querySelectorAll("button, a")
              );
              buttons.forEach((btn) => {
                const text = btn.textContent?.toLowerCase() || "";
                if (
                  text.includes("load more") ||
                  text.includes("show more") ||
                  text.includes("see more")
                ) {
                  btn.click();
                }
              });
            });
            await delay(2000);
          } catch (e) {}

          currentHeight = await page.evaluate(() => document.body.scrollHeight);
          scrollAttempts++;
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await delay(1000);

        const stateFarms = await page.evaluate((currentState) => {
          const farms = [];
          const seenNames = new Set();

          // Strategy 1: Look for structured farm elements
          const farmElements = document.querySelectorAll(
            ".farm, .farm-listing, .listing, [class*='farm'], article, .card, [class*='item'], li, p, div[class*='listing']"
          );

          farmElements.forEach((element) => {
            // Extract name
            const nameEl = element.querySelector(
              "h1, h2, h3, h4, .title, [class*='title'], [class*='name'], strong, b, a[href*='farm'], a[href*='orchard']"
            );
            let name = nameEl?.textContent?.trim() || "";

            // If no name element, try first line of text
            if (!name) {
              const text = element.textContent?.trim() || "";
              const firstLine = text.split("\n")[0]?.trim() || "";
              // Check if first line looks like a farm name
              if (
                firstLine.length > 3 &&
                firstLine.length < 100 &&
                /^[A-Z]/.test(firstLine)
              ) {
                name = firstLine;
              }
            }

            if (!name || name.length < 3 || name.length > 150) return;

            // Skip duplicates
            const nameKey = name.toLowerCase().trim();
            if (seenNames.has(nameKey)) return;
            seenNames.add(nameKey);

            // Extract location/address
            const addressText =
              element
                .querySelector(
                  ".address, [class*='address'], .location, [class*='location'], [class*='city']"
                )
                ?.textContent?.trim() || "";

            // Parse address components
            let address = "";
            let city = "";
            let state = "";
            let zip = "";
            let fullAddress = addressText;

            if (addressText) {
              const parts = addressText.split(",").map((p) => p.trim());
              if (parts.length >= 2) {
                address = parts[0];
                city = parts[1] || "";
                if (parts.length >= 3) {
                  const stateZipPart = parts[2];
                  const zipMatch = stateZipPart?.match(/(\d{5})/);
                  zip = zipMatch ? zipMatch[1] : "";
                  state =
                    stateZipPart?.replace(/\d{5}/, "").trim() ||
                    parts[2]?.trim() ||
                    "";
                } else {
                  state = parts[1]?.length <= 2 ? parts[1] : "";
                }
              } else {
                address = addressText;
              }
            }

            // Extract other fields matching CSV structure
            const produce =
              element
                .querySelector(
                  ".produce, [class*='produce'], .crops, [class*='crops'], [class*='product']"
                )
                ?.textContent?.trim() || "";
            const phoneEl = element.querySelector(
              ".phone, [class*='phone'], a[href^='tel:']"
            );
            const phone =
              phoneEl?.textContent?.trim() ||
              phoneEl?.getAttribute("href")?.replace("tel:", "") ||
              "";
            const websiteEl = element.querySelector(
              "a[href*='http']:not([href*='pickyourown'])"
            );
            const website = websiteEl?.href || "";

            // Extract email
            const emailEl = element.querySelector("a[href^='mailto:']");
            const email =
              emailEl?.getAttribute("href")?.replace("mailto:", "") || "";
            const emailMatch = element.textContent?.match(
              /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
            );
            const emailFromText = emailMatch ? emailMatch[0] : "";
            const finalEmail = email || emailFromText;

            const distance =
              element
                .querySelector("[class*='distance']")
                ?.textContent?.trim() || "";
            const hours =
              element
                .querySelector("[class*='hours'], [class*='time']")
                ?.textContent?.trim() || "";

            farms.push({
              name,
              address,
              city,
              state: state || currentState,
              zip,
              full_address:
                addressText ||
                `${address}, ${city}, ${state || currentState} ${zip}`.trim(),
              farm_type: "U-Pick Farm, Orchard",
              produce,
              phone,
              website,
              email: finalEmail,
              distance: "",
              hours: "",
            });
          });

          return farms;
        }, stateLink.text.match(/^([A-Za-z\s]+)/)?.[1]?.trim() || "");

        // Normalize farms after extraction
        const normalizedFarms = stateFarms.map((farm) => normalizeFarm(farm));
        farms.push(...normalizedFarms);
        console.log(
          `  Found ${normalizedFarms.length} farms in ${stateLink.text}`
        );
      } catch (error) {
        console.error(`  Error scraping ${stateLink.text}:`, error.message);
      }

      await delay(2000);
    }
  } catch (error) {
    console.error("Error scraping pickyourown.farm:", error.message);
  } finally {
    await page.close();
  }

  return farms;
}

/**
 * Scrape from pickyourown.org
 */
async function scrapePickYourOwnOrg(browser) {
  console.log("\n=== Scraping pickyourown.org ===");
  const farms = [];
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate to US page
    try {
      await page.goto("https://www.pickyourown.org/US.htm", {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      await delay(3000);
    } catch (error) {
      console.log("  Warning: Page load timeout, trying to continue...");
      await delay(2000);
    }

    // Get state links - only actual US states
    const stateLinks = await page.$$eval("a[href*='.htm']", (links) => {
      const usStates = [
        "Alabama",
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming",
      ];

      return Array.from(links)
        .map((link) => ({
          text: link.textContent.trim(),
          href: link.href,
        }))
        .filter((link) => {
          if (!link.text || !link.href.includes(".htm")) return false;
          // Check if it's a US state
          const isState = usStates.some(
            (state) =>
              link.text.includes(state) ||
              link.text.match(new RegExp(`^${state}`, "i"))
          );
          // Also check for state abbreviations
          const stateAbbrevs = [
            "AL",
            "AK",
            "AZ",
            "AR",
            "CA",
            "CO",
            "CT",
            "DE",
            "FL",
            "GA",
            "HI",
            "ID",
            "IL",
            "IN",
            "IA",
            "KS",
            "KY",
            "LA",
            "ME",
            "MD",
            "MA",
            "MI",
            "MN",
            "MS",
            "MO",
            "MT",
            "NE",
            "NV",
            "NH",
            "NJ",
            "NM",
            "NY",
            "NC",
            "ND",
            "OH",
            "OK",
            "OR",
            "PA",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VT",
            "VA",
            "WA",
            "WV",
            "WI",
            "WY",
          ];
          const hasAbbrev = stateAbbrevs.some((abbrev) =>
            link.text.startsWith(abbrev)
          );

          return (isState || hasAbbrev) && link.text.length < 50;
        })
        .slice(0, 50); // Get first 50 state links
    });

    console.log(`Found ${stateLinks.length} state links`);
    if (stateLinks.length > 0) {
      console.log(
        `  First few: ${stateLinks
          .slice(0, 5)
          .map((l) => l.text)
          .join(", ")}`
      );
    }

    // Scrape each state
    for (let i = 0; i < stateLinks.length; i++) {
      const stateLink = stateLinks[i];
      console.log(`Scraping state: ${stateLink.text}...`);

      try {
        try {
          await page.goto(stateLink.href, {
            waitUntil: "domcontentloaded",
            timeout: 90000,
          });
          await delay(3000);
        } catch (error) {
          console.log(
            `  Warning: Timeout loading ${stateLink.text}, skipping...`
          );
          continue;
        }

        const stateFarms = await page.evaluate((currentState) => {
          const farms = [];
          const seenNames = new Set();

          // Strategy 1: Look for structured farm listings
          const content = document.body.innerText;
          const lines = content
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l && l.length > 0);

          let currentFarm = null;
          for (const line of lines) {
            // Look for farm name patterns (more flexible)
            if (
              line.match(
                /^[A-Z][a-z]+.*(?:Farm|Orchard|Berry|Farms|Orchards|U-Pick|U-Pik|Pick|Garden|Acres|Ranch)/i
              ) ||
              (line.length > 5 &&
                line.length < 100 &&
                /^[A-Z][a-z]+/.test(line) &&
                (line.includes("Farm") ||
                  line.includes("Orchard") ||
                  line.includes("Berry")))
            ) {
              if (currentFarm && currentFarm.name) {
                const nameKey = currentFarm.name.toLowerCase().trim();
                if (!seenNames.has(nameKey)) {
                  seenNames.add(nameKey);
                  farms.push(currentFarm);
                }
              }
              currentFarm = {
                name: line,
                address: "",
                city: "",
                state: currentState || "",
                zip: "",
                full_address: "",
                farm_type: "U-Pick Farm, Orchard",
                produce: "",
                phone: "",
                website: "",
                email: "",
                distance: "",
                hours: "",
              };
            } else if (currentFarm) {
              // Try to extract address, phone, etc.
              if (
                line.match(
                  /\d+.*(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Highway|Hwy|Route|Rt|Boulevard|Blvd|County|Cty)/i
                )
              ) {
                currentFarm.address = line;
                currentFarm.full_address = line;

                // Try to extract city, state, zip from address line
                const cityStateMatch = line.match(
                  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\s*(\d{5})?/
                );
                if (cityStateMatch) {
                  currentFarm.city = cityStateMatch[1];
                  currentFarm.state = cityStateMatch[2] || currentState || "";
                  currentFarm.zip = cityStateMatch[3] || "";
                }
              } else if (line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)) {
                currentFarm.phone = line.match(
                  /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
                )[0];
              } else if (line.match(/https?:\/\//)) {
                currentFarm.website =
                  line.match(/https?:\/\/[^\s]+/)?.[0] || "";
              } else if (
                line.match(
                  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
                )
              ) {
                currentFarm.email = line.match(
                  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
                )[0];
              } else if (
                line.match(
                  /(strawberry|blueberry|apple|pumpkin|cherry|peach|pear|raspberry|blackberry|tomato|corn|pea|bean)/i
                )
              ) {
                if (!currentFarm.produce) {
                  currentFarm.produce = line;
                } else {
                  currentFarm.produce += ", " + line;
                }
              }
            }
          }

          if (currentFarm && currentFarm.name) {
            const nameKey = currentFarm.name.toLowerCase().trim();
            if (!seenNames.has(nameKey)) {
              seenNames.add(nameKey);
              farms.push(currentFarm);
            }
          }

          // Strategy 2: Look for farms in HTML structure
          const farmElements = document.querySelectorAll(
            "p, div, li, td, span, strong, b"
          );
          farmElements.forEach((element) => {
            const text = element.textContent?.trim() || "";
            if (text.length < 20 || text.length > 500) return;

            // Check if it looks like a farm entry
            const farmNameMatch = text.match(
              /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Farm|Orchard|Berry|Farms|Orchards|U-Pick|U-Pik))?)/
            );
            if (farmNameMatch) {
              const name = farmNameMatch[1].trim();
              const nameKey = name.toLowerCase().trim();

              if (
                !seenNames.has(nameKey) &&
                name.length >= 3 &&
                name.length <= 150
              ) {
                seenNames.add(nameKey);

                // Extract address
                const addressMatch = text.match(
                  /(\d+[\s\w\.,]+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Highway|Hwy|Route|Rt|Boulevard|Blvd)[\s\w\.,]*)/i
                );
                const address = addressMatch ? addressMatch[1].trim() : "";

                // Extract city, state, zip
                const cityStateMatch = text.match(
                  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\s*(\d{5})?/
                );
                const city = cityStateMatch ? cityStateMatch[1].trim() : "";
                const state = cityStateMatch
                  ? cityStateMatch[2].trim()
                  : currentState || "";
                const zip = cityStateMatch ? cityStateMatch[3]?.trim() : "";

                // Extract phone
                const phoneMatch = text.match(
                  /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/
                );
                const phone = phoneMatch ? phoneMatch[1].trim() : "";

                // Extract website
                const websiteEl = element.querySelector("a[href^='http']");
                const website = websiteEl ? websiteEl.href : "";

                // Extract email
                const emailEl = element.querySelector("a[href^='mailto:']");
                const email =
                  emailEl?.getAttribute("href")?.replace("mailto:", "") || "";
                const emailMatch = text.match(
                  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
                );
                const emailFromText = emailMatch ? emailMatch[0] : "";
                const finalEmail = email || emailFromText;

                // Extract produce
                const produceKeywords = [
                  "strawberries",
                  "blueberries",
                  "apples",
                  "peaches",
                  "cherries",
                  "raspberries",
                  "blackberries",
                  "pumpkins",
                  "tomatoes",
                  "corn",
                  "peas",
                  "beans",
                  "grapes",
                  "pears",
                  "plums",
                ];
                const produce = produceKeywords
                  .filter((keyword) =>
                    text.toLowerCase().includes(keyword.toLowerCase())
                  )
                  .join(", ");

                if (name && (address || city || state)) {
                  farms.push({
                    name,
                    address,
                    city,
                    state: state || currentState || "",
                    zip,
                    full_address: address
                      ? `${address}, ${city}, ${
                          state || currentState
                        } ${zip}`.trim()
                      : `${city}, ${state || currentState} ${zip}`.trim(),
                    farm_type: "U-Pick Farm, Orchard",
                    produce,
                    phone,
                    website,
                    email: finalEmail,
                    distance: "",
                    hours: "",
                  });
                }
              }
            }
          });

          return farms;
        }, stateLink.text.match(/^([A-Za-z\s]+)/)?.[1]?.trim() || "");

        // Normalize farms after extraction
        const normalizedFarms = stateFarms.map((farm) => normalizeFarm(farm));
        farms.push(...normalizedFarms);
        console.log(
          `  Found ${normalizedFarms.length} farms in ${stateLink.text}`
        );
      } catch (error) {
        console.error(`  Error scraping ${stateLink.text}:`, error.message);
      }

      await delay(2000);
    }

    console.log(`\n✅ pickyourown.org: Total ${farms.length} farms scraped`);
    if (farms.length > 0) {
      console.log(
        `   Sample farms: ${farms
          .slice(0, 5)
          .map((f) => f.name)
          .join(", ")}`
      );
    }
  } catch (error) {
    console.error("Error scraping pickyourown.org:", error.message);
  } finally {
    await page.close();
  }

  return farms;
}

/**
 * Scrape from upickguide.com
 */
async function scrapeUpickGuide(browser) {
  console.log("\n=== Scraping upickguide.com ===");
  const farms = [];
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate to main page
    try {
      await page.goto("https://upickguide.com/", {
        waitUntil: "networkidle2",
        timeout: 90000,
      });
      await delay(5000); // Wait for React app to load
    } catch (error) {
      console.log("  Warning: Page load timeout, trying to continue...");
      await delay(3000);
    }

    // Get state links - they're in the "Search by State" section
    const stateLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      const stateLinks = [];
      const stateAbbrevs = [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
      ];

      links.forEach((link) => {
        const text = link.textContent?.trim() || "";
        const href = link.href || "";

        // Check if it's a state link (has state abbrev + state name)
        for (const abbrev of stateAbbrevs) {
          if (
            text.startsWith(abbrev) &&
            text.length > abbrev.length &&
            text.length < 30
          ) {
            const stateName = text.substring(abbrev.length).trim();
            if (stateName && href.includes("upickguide.com")) {
              stateLinks.push({
                text: text,
                href: href,
                abbrev: abbrev,
                stateName: stateName,
              });
              break;
            }
          }
        }
      });

      // Remove duplicates
      const unique = [];
      const seen = new Set();
      stateLinks.forEach((link) => {
        if (!seen.has(link.abbrev)) {
          seen.add(link.abbrev);
          unique.push(link);
        }
      });

      return unique;
    });

    console.log(`Found ${stateLinks.length} state links`);

    // Scrape each state
    for (let i = 0; i < stateLinks.length; i++) {
      const stateLink = stateLinks[i];
      console.log(
        `Scraping state: ${stateLink.text} (${i + 1}/${stateLinks.length})...`
      );

      try {
        try {
          await page.goto(stateLink.href, {
            waitUntil: "networkidle2",
            timeout: 90000,
          });
          await delay(5000); // Wait for React app to load
        } catch (error) {
          console.log(
            `  Warning: Timeout loading ${stateLink.text}, skipping...`
          );
          continue;
        }

        // Scroll to load all farms
        console.log(`  Scrolling to load all farms...`);
        let previousHeight = 0;
        let currentHeight = await page.evaluate(
          () => document.body.scrollHeight
        );
        let scrollAttempts = 0;
        const maxScrollAttempts = 15;

        while (
          previousHeight !== currentHeight &&
          scrollAttempts < maxScrollAttempts
        ) {
          previousHeight = currentHeight;
          await page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight)
          );
          await delay(2000);

          // Try clicking "Load More" or "Show More" buttons
          try {
            await page.evaluate(() => {
              const buttons = Array.from(
                document.querySelectorAll("button, a")
              );
              buttons.forEach((btn) => {
                const text = btn.textContent?.toLowerCase() || "";
                if (
                  text.includes("load more") ||
                  text.includes("show more") ||
                  text.includes("see more") ||
                  text.includes("view all")
                ) {
                  btn.click();
                }
              });
            });
            await delay(2000);
          } catch (e) {}

          currentHeight = await page.evaluate(() => document.body.scrollHeight);
          scrollAttempts++;
        }

        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await delay(1000);

        // Extract farms from the page
        const stateFarms = await page.evaluate(
          (stateAbbrev, stateName) => {
            const farms = [];

            // Strategy 1: Look for farm cards/items (common patterns)
            const farmSelectors = [
              '[class*="farm"]',
              '[class*="card"]',
              '[class*="item"]',
              "article",
              '[data-testid*="farm"]',
              "h2, h3, h4", // Farm names might be in headings
            ];

            const allElements = [];
            farmSelectors.forEach((selector) => {
              try {
                const elements = Array.from(
                  document.querySelectorAll(selector)
                );
                allElements.push(...elements);
              } catch (e) {}
            });

            // Strategy 2: Look for featured farms section
            const featuredSection = document.querySelector(
              '[class*="featured"], [class*="farm"]'
            );
            if (featuredSection) {
              const farmItems = featuredSection.querySelectorAll(
                "div, article, section"
              );
              farmItems.forEach((item) => {
                const text = item.textContent?.trim() || "";
                if (text.length > 20 && text.length < 500) {
                  // Check if it looks like a farm entry
                  const hasName = /^[A-Z][a-z]+/.test(
                    text.split("\n")[0]?.trim() || ""
                  );
                  const hasLocation =
                    /[A-Z][a-z]+,\s*[A-Z]{2}/.test(text) ||
                    text.includes(stateName);

                  if (hasName && hasLocation) {
                    const lines = text
                      .split("\n")
                      .map((l) => l.trim())
                      .filter((l) => l);
                    const name = lines[0] || "";

                    // Extract address
                    let address = "";
                    let city = "";
                    let zip = "";
                    let phone = "";
                    let website = "";
                    let email = "";
                    let produce = "";

                    for (const line of lines) {
                      // Address pattern
                      if (
                        /\d+.*(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Highway|Hwy|Route|Rt)/i.test(
                          line
                        )
                      ) {
                        address = line;
                        // Try to extract city and state
                        const cityMatch = line.match(
                          /([A-Z][a-z]+),\s*([A-Z]{2})\s*(\d{5})?/
                        );
                        if (cityMatch) {
                          city = cityMatch[1];
                          zip = cityMatch[3] || "";
                        }
                      }
                      // Phone pattern
                      if (/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(line)) {
                        phone =
                          line.match(
                            /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
                          )?.[0] || "";
                      }
                      // Website pattern
                      if (/https?:\/\//.test(line)) {
                        website = line.match(/https?:\/\/[^\s]+/)?.[0] || "";
                      }
                      // Email pattern
                      const emailMatch = line.match(
                        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
                      );
                      if (emailMatch && !email) {
                        email = emailMatch[0];
                      }
                      // Produce keywords
                      if (
                        /strawberry|blueberry|apple|pumpkin|cherry|peach|pear|raspberry|blackberry/i.test(
                          line
                        )
                      ) {
                        if (!produce) produce = line;
                      }
                    }

                    // Skip invalid names
                    const invalidNamePatterns = [
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
                    ];
                    const isInvalid = invalidNamePatterns.some((pattern) =>
                      pattern.test(name)
                    );

                    if (
                      name &&
                      name.length > 2 &&
                      name.length < 150 &&
                      !isInvalid
                    ) {
                      farms.push({
                        name: name,
                        address: address,
                        city: city || stateName,
                        state: stateAbbrev,
                        zip: zip,
                        full_address:
                          address || `${city || stateName}, ${stateAbbrev}`,
                        farm_type: "U-Pick Farm, Orchard",
                        produce: produce,
                        phone: phone,
                        website: website,
                        email: email,
                        distance: "",
                        hours: "",
                      });
                    }
                  }
                }
              });
            }

            // Strategy 3: Look for any divs/sections with farm-like content
            const allDivs = Array.from(
              document.querySelectorAll("div, section, article")
            );
            allDivs.forEach((div) => {
              const text = div.textContent?.trim() || "";
              if (text.length > 30 && text.length < 500) {
                const hasLocation =
                  /[A-Z][a-z]+,\s*[A-Z]{2}/.test(text) ||
                  text.includes(stateName);
                const firstLine = text.split("\n")[0]?.trim() || "";
                const hasName =
                  /^[A-Z][a-z]+/.test(firstLine) &&
                  firstLine.length > 3 &&
                  firstLine.length < 100;
                const hasFarmKeyword = /farm|orchard|berry|pick|u-pick/i.test(
                  text
                );

                if (hasName && (hasLocation || hasFarmKeyword)) {
                  // Check if we already have this farm
                  const isDuplicate = farms.some((f) => {
                    const farmText = f.name || "";
                    return (
                      farmText.substring(0, 30) === firstLine.substring(0, 30)
                    );
                  });

                  if (!isDuplicate) {
                    const lines = text
                      .split("\n")
                      .map((l) => l.trim())
                      .filter((l) => l);
                    const name = lines[0] || "";

                    let address = "";
                    let city = "";
                    let zip = "";
                    let phone = "";
                    let website = "";
                    let email = "";
                    let produce = "";

                    for (const line of lines) {
                      if (
                        /\d+.*(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Highway|Hwy|Route|Rt)/i.test(
                          line
                        )
                      ) {
                        address = line;
                        const cityMatch = line.match(
                          /([A-Z][a-z]+),\s*([A-Z]{2})\s*(\d{5})?/
                        );
                        if (cityMatch) {
                          city = cityMatch[1];
                          zip = cityMatch[3] || "";
                        }
                      }
                      if (/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(line)) {
                        phone =
                          line.match(
                            /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
                          )?.[0] || "";
                      }
                      if (/https?:\/\//.test(line)) {
                        website = line.match(/https?:\/\/[^\s]+/)?.[0] || "";
                      }
                      // Email pattern
                      const emailMatch = line.match(
                        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
                      );
                      if (emailMatch && !email) {
                        email = emailMatch[0];
                      }
                      if (
                        /strawberry|blueberry|apple|pumpkin|cherry|peach|pear|raspberry|blackberry/i.test(
                          line
                        )
                      ) {
                        if (!produce) produce = line;
                      }
                    }

                    // Skip invalid names
                    const invalidNamePatterns = [
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
                    ];
                    const isInvalid = invalidNamePatterns.some((pattern) =>
                      pattern.test(name)
                    );

                    if (
                      name &&
                      name.length > 2 &&
                      name.length < 150 &&
                      !isInvalid
                    ) {
                      farms.push({
                        name: name,
                        address: address,
                        city: city || stateName,
                        state: stateAbbrev,
                        zip: zip,
                        full_address:
                          address || `${city || stateName}, ${stateAbbrev}`,
                        farm_type: "U-Pick Farm, Orchard",
                        produce: produce,
                        phone: phone,
                        website: website,
                        email: email,
                        distance: "",
                        hours: "",
                      });
                    }
                  }
                }
              }
            });

            return farms;
          },
          stateLink.abbrev,
          stateLink.stateName
        );

        // Normalize farms after extraction
        const normalizedFarms = stateFarms.map((farm) => normalizeFarm(farm));
        farms.push(...normalizedFarms);
        console.log(
          `  Found ${normalizedFarms.length} farms in ${stateLink.text}`
        );
        if (normalizedFarms.length > 0) {
          console.log(
            `    Sample: ${normalizedFarms
              .slice(0, 2)
              .map((f) => f.name)
              .join(", ")}`
          );
        }
      } catch (error) {
        console.error(`  Error scraping ${stateLink.text}:`, error.message);
      }

      await delay(3000); // Be respectful with delays
    }

    console.log(`\n✅ upickguide.com: Total ${farms.length} farms scraped`);
    if (farms.length > 0) {
      console.log(
        `   Sample farms: ${farms
          .slice(0, 5)
          .map((f) => f.name)
          .join(", ")}`
      );
    }
  } catch (error) {
    console.error("Error scraping upickguide.com:", error.message);
  } finally {
    await page.close();
  }

  return farms;
}

/**
 * Main scraping function
 */
async function scrapeAllFarms() {
  console.log("Starting farm data scraping...");
  console.log("This will take a while. Please be patient.\n");

  // Read existing CSV file - same path as pre-geocode-farms.js
  const csvPath = path.join(__dirname, "../public/farms_fixed.csv");
  console.log("Reading existing farms from:", csvPath);

  let existingFarms = [];
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    existingFarms = parseCSV(csvContent);
    console.log(`Found ${existingFarms.length} existing farms in CSV\n`);
  } else {
    console.log("CSV file does not exist, will create new one\n");
  }

  // Try to find Chrome in common Windows locations
  const os = require("os");
  const platform = os.platform();

  const commonChromePaths = [
    process.env.CHROME_PATH,
    ...(platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          (process.env.LOCALAPPDATA || "") +
            "\\Google\\Chrome\\Application\\chrome.exe",
        ]
      : []),
  ].filter(Boolean);

  let chromePath = null;
  for (const path of commonChromePaths) {
    if (path && fs.existsSync(path)) {
      chromePath = path;
      console.log(`Found Chrome at: ${chromePath}`);
      break;
    }
  }

  // Launch browser
  let browser;
  try {
    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (chromePath) {
      launchOptions.executablePath = chromePath;
    }

    browser = await puppeteer.launch(launchOptions);
  } catch (error) {
    console.error("\n❌ Error launching browser:", error.message);
    console.log("\n📋 To fix this, you have two options:");
    console.log("\nOption 1: Install Chrome for Puppeteer (recommended)");
    console.log("  Run: npx puppeteer browsers install chrome");
    console.log("\nOption 2: Use system Chrome");
    console.log(
      "  Set CHROME_PATH environment variable to your Chrome installation"
    );
    console.log(
      "  Example: set CHROME_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    );
    process.exit(1);
  }

  const allFarms = [...existingFarms]; // Start with existing farms

  try {
    // Scrape from all three sources
    console.log("Starting to scrape from websites...\n");

    const farms1 = await scrapeFindUpickFarms(browser);
    console.log(`Scraped ${farms1.length} farms from findupickfarms.com`);
    allFarms.push(...farms1);

    const farms2 = await scrapePickYourOwnFarm(browser);
    console.log(`Scraped ${farms2.length} farms from pickyourown.farm`);
    allFarms.push(...farms2);

    const farms3 = await scrapePickYourOwnOrg(browser);
    console.log(`Scraped ${farms3.length} farms from pickyourown.org`);
    allFarms.push(...farms3);

    const farms4 = await scrapeUpickGuide(browser);
    console.log(`Scraped ${farms4.length} farms from upickguide.com`);
    allFarms.push(...farms4);

    // Filter out invalid entries (headers, metadata, etc.)
    const validFarms = allFarms.filter((farm) => {
      const name = (farm.name || "").trim();

      // Skip if no name or name is too short
      if (!name || name.length < 3) return false;

      // Skip common header/metadata patterns
      const invalidPatterns = [
        /^(Looking|Notes|See|State|Resources|Electric|Easter|Farms|Maple|Christmas|Where|Before|If|Most|Green|In|Winter|Local|Oregon|Answer|The|Share|Alabama|Alaska|Arkansas|Arizona|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New|North|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode|South|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West|Wisconsin|Wyoming)/i,
        /U-Pick Farm Directory/i,
        /PickYourOwn\.ORG/i,
        /Farm Locator/i,
        /Apple Orchard Locator/i,
        /^[A-Z\s]+U-Pick Farms/i,
        /and Orchards$/i,
        /^[A-Z\s]+U-Pick Farms and Orchards$/i,
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
        /^\d+miles north of/i,
        /^\d+\s+miles$/i,
        /^[A-Z][a-z]+\d+$/i, // City names with numbers like "Somerville4"
        /^[A-Z][a-z]+\d+[A-Z][a-z]+\d+$/i, // Multiple city names with numbers
        /^[A-Z][a-z]+\d+[A-Z][a-z]+$/i, // City names concatenated
      ];

      for (const pattern of invalidPatterns) {
        if (pattern.test(name)) return false;
      }

      // Skip if name is too long (likely description text)
      if (name.length > 150) return false;

      return true;
    });

    // Remove duplicates based on name and address
    const uniqueFarms = [];
    const seen = new Set();

    for (const farm of validFarms) {
      // Normalize farm to ensure all properties exist
      const normalizedFarm = normalizeFarm(farm);

      // Create a unique key from name and full address
      const nameKey = normalizedFarm.name.toLowerCase().trim();
      const addressKey = (
        normalizedFarm.full_address ||
        `${normalizedFarm.address}, ${normalizedFarm.city}, ${normalizedFarm.state}`
      )
        .toLowerCase()
        .trim();
      const key = `${nameKey}_${addressKey}`;

      if (
        !seen.has(key) &&
        normalizedFarm.name &&
        normalizedFarm.name.trim() !== ""
      ) {
        seen.add(key);
        uniqueFarms.push(normalizedFarm);
      }
    }

    console.log(`\n=== Scraping Complete ===`);
    console.log(`Existing farms: ${existingFarms.length}`);
    console.log(`New farms scraped: ${allFarms.length - existingFarms.length}`);
    console.log(`Valid farms (after filtering): ${validFarms.length}`);
    console.log(`Total farms (before deduplication): ${allFarms.length}`);
    console.log(`Unique farms (after deduplication): ${uniqueFarms.length}`);
    console.log(
      `New farms added: ${uniqueFarms.length - existingFarms.length}`
    );

    // Save to CSV (overwrite existing file)
    const csvHeader =
      "name,address,city,state,zip,full_address,farm_type,produce,phone,website,email,distance,hours\n";

    const csvRows = uniqueFarms.map((farm) => {
      return [
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
        escapeCsvField(farm.email),
        escapeCsvField(farm.distance),
        escapeCsvField(farm.hours),
      ].join(",");
    });

    fs.writeFileSync(csvPath, csvHeader + csvRows.join("\n"));
    console.log(`\n✅ Saved ${uniqueFarms.length} farms to: ${csvPath}`);
    console.log(
      `   (Updated existing file with ${
        uniqueFarms.length - existingFarms.length
      } new farms)`
    );
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
  }
}

// Run the scraper
if (require.main === module) {
  scrapeAllFarms().catch(console.error);
}

module.exports = { scrapeAllFarms };
