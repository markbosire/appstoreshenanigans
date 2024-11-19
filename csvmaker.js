const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function convertJsonToCsv(inputDir, outputFile) {
  // Read all JSON files in the input directory
  const files = fs.readdirSync(inputDir)
    .filter(file => file.endsWith('_details.json'));

  // Process each JSON file
  const csvData = files.map(file => {
    const filePath = path.join(inputDir, file);
    const appData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    return {
      appName: appData.title,
      score: appData.score,
      reviews: appData.reviews,
 
    };
  });

  // Create CSV writer
  const csvWriter = createCsvWriter({
    path: outputFile,
    header: [
      {id: 'appName', title: 'App Name'},
      {id: 'score', title: 'Score'},
      {id: 'reviews', title: 'Reviews'},

    ]
  });

  // Write to CSV
  csvWriter.writeRecords(csvData)
    .then(() => console.log('CSV file created successfully'))
    .catch((error) => console.error('Error creating CSV:', error));
}

// Directories
const inputDir = path.join(__dirname, 'app_details');
const outputFile = path.join(__dirname, 'app_summary.csv');

// Run conversion
convertJsonToCsv(inputDir, outputFile);
