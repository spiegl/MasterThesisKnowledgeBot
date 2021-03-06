/**
 * This script reads the data file and creates a query cache file for KnowledgeBot
 */

const fs = require("fs");
const path = require("path");

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
outputFile = "./dataQueryCache.json";

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
fs.writeFileSync(
  path.resolve(__dirname, outputFile),
  JSON.stringify(queryCache),
  "utf8"
);
console.log("\tFile written to " + outputFile);

/**
 * Cities data file
 */

// Config
inputFile = "./cities.json";
outputFile = "./citiesQueryCache.json";

// Start processing
console.log("\n\tProcessing " + inputFile);
cities = require(inputFile, "utf8");

queryCache = {};

cities.map(item => {
  queryCache[item.canonicalForm.toLowerCase()] = item;
});

// log number of countries
console.log("\t" + cities.length + " records modified ...");

// Write query cache file
fs.writeFileSync(
  path.resolve(__dirname, outputFile),
  JSON.stringify(queryCache),
  "utf8"
);
console.log("\tFile written to " + outputFile);

/**
 * Country properties file
 */

// Config
inputFile = "./countryProperties.json";
outputFile = "./countryPropertiesQueryCache.json";

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
fs.writeFileSync(
  path.resolve(__dirname, outputFile),
  JSON.stringify(queryCache),
  "utf8"
);
console.log("\tFile written to " + outputFile);

/**
 * City properties file
 */

// Config
inputFile = "./cityProperties.json";
outputFile = "./cityPropertiesQueryCache.json";

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
fs.writeFileSync(
  path.resolve(__dirname, outputFile),
  JSON.stringify(queryCache),
  "utf8"
);
console.log("\tFile written to " + outputFile);

