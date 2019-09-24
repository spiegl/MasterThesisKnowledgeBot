/**
 * This script reads the data file and creates a query cache file for KnowledgeBot
 */

/**
 * Config
 */

let input = "./data/data.json";
let output = "./data/query.json";

/**
 * Init
 */
console.log("Starting 'Create query cache files' ...");

const fs = require("fs");

/**
 * Read data from data directory
 */
let rawData = fs.readFileSync("./data/data.json", "utf8");
data = JSON.parse(rawData);

/**
 * Modify data into following format
 *
 * "aut": {
 *    "name": "Austria",
 *    "capital": "Vienna",
 *    ...
 * }
 */

let queryCache = {};

data.map(item => {
  queryCache[item.iso.toLowerCase()] = item;
});

// log number of countries
console.log("\t" + data.length + " records modified ...");

/**
 * Write query cache file
 */

fs.writeFileSync(output, JSON.stringify(queryCache), "utf8");
console.log("\tFile written to " + output);

/////////////////////////////////////

input = "./data/countryProperties.json";
output = "./data/countryPropertiesQuery.json";

/**
 * Read data from data directory
 */
rawData = fs.readFileSync("./data/countryProperties.json", "utf8");
data = JSON.parse(rawData);

/**
 * Modify data into following format
 *
 * "aut": {
 *    "name": "Austria",
 *    "capital": "Vienna",
 *    ...
 * }
 */

queryCache = {};

data.map(item => {
  queryCache[item.canonicalForm.toLowerCase()] = item;
});

// log number of countries
console.log("\t" + data.length + " records modified ...");

/**
 * Write query cache file
 */

fs.writeFileSync(output, JSON.stringify(queryCache), "utf8");
console.log("\tFile written to " + output);
