/**
 * This script reads the data file and creates a query cache file for KnowledgeBot
 */

const fs = require("fs");

/**
 * Init
 */
console.log("\nStarting 'Create query cache files' ...");

let inputFile = "",
  outputFile = "",
  data = null,
  queryCache = null;

/**
 * Main data file
 */

// Config
inputFile = "./data.json";
outputFile = "./data/dataQueryCache.json";

// Start processing
console.log("\n\tProcessing " + inputFile);
data = require(inputFile, "utf8");

// Modify data into following format
//     "aut": {
//         "name": "Austria",
//         "capital": "Vienna",
//         ...
//     }

queryCache = {};

data.map(item => {
  queryCache[item.iso.toLowerCase()] = item;
});

// log number of countries
console.log("\t" + data.length + " records modified ...");

// Write query cache file
fs.writeFileSync(outputFile, JSON.stringify(queryCache), "utf8");
console.log("\tFile written to " + outputFile);

/**
 * Country properties file
 */

// Config
inputFile = "./countryProperties.json";
outputFile = "./data/countryPropertiesQueryCache.json";

// Start processing
console.log("\n\tProcessing " + inputFile);
data = require(inputFile, "utf8");

// Modify data into following format
//     "aut": {
//         "canonicalForm": "population",
//         "name": "population",
//         ...
//     }
queryCache = {};

data.map(item => {
  queryCache[item.canonicalForm.toLowerCase()] = item;
});

// log number of countries
console.log("\t" + data.length + " records modified ...");

// Write query cache file
fs.writeFileSync(outputFile, JSON.stringify(queryCache), "utf8");
console.log("\tFile written to " + outputFile);
