const fs = require('fs');
const path = require('path');
const store = require('app-store-scraper');

async function scrapeAppDetails(appIds, outputDir) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Iterate through each app ID
  for (const appId of appIds) {
    try {
      // Fetch full app details with ratings
      const appDetails = await store.app({
        id: appId,
        ratings: true
      });

      // Write app details to a JSON file
      const outputFile = path.join(outputDir, `${appId}_details.json`);
      fs.writeFileSync(outputFile, JSON.stringify(appDetails, null, 2));
      
      console.log(`Scraped details for app ${appId}`);
    } catch (error) {
      console.error(`Error scraping details for app ${appId}:`, error);
    }
  }
}

// Load Apple App Store URLs from the file
const inputFilePath = path.join(__dirname, 'apple_store_urls.txt');
const urls = fs.readFileSync(inputFilePath, 'utf-8').split('\n').filter(Boolean);

// Extract unique app IDs
const appIds = [...new Set(urls.map(url => {
  const regex = /\/id(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}).filter(Boolean))];

// Output directory for app details files
const outputDir = path.join(__dirname, 'app_details');

// Run the scraping process
scrapeAppDetails(appIds, outputDir);
