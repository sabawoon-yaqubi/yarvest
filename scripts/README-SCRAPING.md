# Web Scraping Guide for Farms Data

## ⚠️ Important Legal & Ethical Considerations

1. **Check robots.txt**: Visit `https://target-website.com/robots.txt` before scraping
2. **Read Terms of Service**: Make sure scraping is allowed
3. **Respect Rate Limits**: Add delays between requests (2-5 seconds)
4. **Use Proper Headers**: Set User-Agent to identify your bot
5. **Don't Overload Servers**: Be respectful of the website's resources

## Methods

### Method 1: Puppeteer (Dynamic Sites)

- **Best for**: Sites with JavaScript-rendered content
- **Install**: `npm install puppeteer`
- **File**: `scripts/scrape-farms.js`

### Method 2: Cheerio (Static HTML)

- **Best for**: Static HTML pages (faster)
- **Install**: `npm install cheerio axios`
- **Note**: Cheerio example removed - use Puppeteer for dynamic sites

### Method 3: Python with BeautifulSoup

```python
# Install: pip install beautifulsoup4 requests pandas
import requests
from bs4 import BeautifulSoup
import pandas as pd

url = 'https://example-farm-directory.com'
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

farms = []
for item in soup.find_all('div', class_='farm-item'):
    farms.append({
        'name': item.find('h3').text.strip(),
        'address': item.find('.address').text.strip(),
        # ... extract other fields
    })

df = pd.DataFrame(farms)
df.to_csv('farms_scraped.csv', index=False)
```

## Common Tools

1. **Puppeteer** - Browser automation (Node.js)
2. **Cheerio** - HTML parsing (Node.js)
3. **BeautifulSoup** - HTML parsing (Python)
4. **Scrapy** - Full scraping framework (Python)
5. **Playwright** - Modern browser automation
6. **Selenium** - Browser automation (multiple languages)

## Best Practices

1. **Add Delays**: `await new Promise(resolve => setTimeout(resolve, 2000))`
2. **Handle Errors**: Wrap in try-catch blocks
3. **Respect Headers**: Set proper User-Agent
4. **Save Progress**: Save data incrementally
5. **Log Everything**: Track what you're scraping

## Example: Scraping a Farm Directory

```javascript
// 1. Identify the target website structure
// 2. Inspect HTML elements (use browser DevTools)
// 3. Write selectors for data extraction
// 4. Handle pagination
// 5. Save to CSV/JSON

const farms = await page.$$eval(".farm-card", (cards) => {
  return cards.map((card) => ({
    name: card.querySelector("h2").textContent,
    address: card.querySelector(".address").textContent,
    // ... extract other fields
  }));
});
```

## Rate Limiting Example

```javascript
// Wait between requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (const url of urls) {
  await scrapePage(url);
  await delay(2000); // 2 second delay
}
```

## Handling Different Data Sources

1. **API Endpoints**: Check if website has an API (easier than scraping)
2. **JSON Data**: Some sites load data via AJAX - intercept network requests
3. **Static HTML**: Use Cheerio for faster parsing
4. **Dynamic Content**: Use Puppeteer/Playwright
