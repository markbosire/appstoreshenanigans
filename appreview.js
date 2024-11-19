const fs = require('fs');
const path = require('path');
const store = require('app-store-scraper');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAppName(appId) {
  try {
    const appDetails = await store.app({ id: appId });
    await sleep(1000); // Rate limiting
    return appDetails.title;
  } catch (error) {
    console.error(`Error fetching app name for ${appId}:`, error);
    return `Unknown App (${appId})`;
  }
}

async function combineReviews(appIds, outputFile) {
  const allReviews = [];
  const processedApps = new Map(); // Track processed apps and their names

  for (const appId of appIds) {
    try {
      console.log(`Processing app ${appId}`);
      
      // Get app name first
      const appName = await getAppName(appId);
      processedApps.set(appId, appName);
      
      console.log(`Fetching reviews for ${appName} (${appId})`);
      const allAppReviews = [];

      // Fetch 10 pages of reviews
      for (let page = 1; page <= 10; page++) {
        try {
          console.log(`Fetching page ${page} for ${appName}`);
          
          const reviews = await store.reviews({
            id: appId,
            sort: store.sort.RECENT,
            page: page
          });

          if (reviews && reviews.length > 0) {
            // Add app information to each review
            const enhancedReviews = reviews.map(review => ({
              ...review,
              appId: appId,
              appName: appName
            }));
            
            allAppReviews.push(...enhancedReviews);
          } else {
            console.log(`No more reviews found for ${appName} at page ${page}`);
            break;
          }

          await sleep(1000); // Rate limiting between pages
        } catch (pageError) {
          console.error(`Error fetching page ${page} for ${appName}:`, pageError);
          break;
        }
      }

      allReviews.push(...allAppReviews);
      console.log(`Added ${allAppReviews.length} reviews for ${appName}`);
      
      // Save progress periodically
      fs.writeFileSync(
        outputFile,
        JSON.stringify({
          totalReviews: allReviews.length,
          lastUpdated: new Date().toISOString(),
          processedApps: Array.from(processedApps).map(([id, name]) => ({ id, name })),
          reviews: allReviews
        }, null, 2)
      );

      await sleep(2000); // Rate limiting between apps

    } catch (error) {
      console.error(`Error processing app ${appId}:`, error);
    }
  }

  // Final save
  const finalOutput = {
    totalReviews: allReviews.length,
    lastUpdated: new Date().toISOString(),
    processedApps: Array.from(processedApps).map(([id, name]) => ({ id, name })),
    reviews: allReviews
  };

  fs.writeFileSync(outputFile, JSON.stringify(finalOutput, null, 2));
  console.log(`Completed processing ${processedApps.size} apps with ${allReviews.length} total reviews`);
}

// Load app IDs from the JSON file
const appIdsFile = path.join(__dirname, 'app_ids.json');
const appIdsData = JSON.parse(fs.readFileSync(appIdsFile, 'utf-8'));
const appIds = appIdsData.appIds;

// Output file for combined reviews
const outputFile = path.join(__dirname, 'all_reviews.json');

// Run the process
combineReviews(appIds, outputFile)
  .then(() => console.log('Review collection completed'))
  .catch(console.error);
