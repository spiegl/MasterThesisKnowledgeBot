/**
 *
 * This script reads data from the `data` directory and files from this directory and transforms it for the LUIS model
 */

const fs = require("fs");
const path = require("path");

/**
 * Init
 */
console.log("\nStarting enhancing LUIS model ...");

/**
 * Config
 */
const inputModelPath = "./CognitiveModelBasis.json";
const outputModelPath = "./output.json";

/**
 * Add entities with sub lists
 *
 * Read data from data directory
 */
let data = require("../data/data.json");
let countryPropertiesData = require("../data/countryProperties.json");

/**
 * Add countries
 * Modify data into following format
 *
 * {
 *  "canonicalForm": "germany",
 *  "list": [
 *      "brd",
 *      "ger",
 *      "germany"
 *  ]
 * }
 */

console.log("\n\tProcessing countries");

let countries = {
  name: "Country",
  subLists: [],
  roles: []
};

data.map(item => {
  let country = {};
  country["canonicalForm"] = item.iso.toLowerCase();
  country["list"] = [];
  country.list.push(item.name);
  country.list.push(item.name.toLowerCase());
  country.list.push(item.iso);
  item.synonyms.map(innerItem => country.list.push(innerItem));

  countries.subLists.push(country);
});

// log number of countries
console.log("\t" + countries.subLists.length + " records processed ...");

/**
 * Add CountryProperties
 */

console.log("\n\tProcessing CountryProperties");

let countryProperties = {
  name: "CountryProperty",
  subLists: [],
  roles: []
};

countryPropertiesData.map(item => {
  let prop = {};
  prop["canonicalForm"] = item.canonicalForm.toLowerCase();
  prop["list"] = [];
  prop.list.push(item.name);
  item.synonyms.map(innerItem => prop.list.push(innerItem));

  countryProperties.subLists.push(prop);
});

// log number of countries
console.log(
  "\t" + countryProperties.subLists.length + " records processed ..."
);

/**
 * Add utterances for QueryKM
 * 
 * {
        "text": "capital of italy?",
        "intent": "QueryKM",
        "entities": []
    },
 */
console.log("\n\tProcessing utterances for QueryKM");

let utterancesRaw = [];
countryPropertiesData.map(item => {
  item.utterances.map(utterance => utterancesRaw.push(utterance));
});

let utterances = [];
utterancesRaw.map(utterance => {
  data.map(country => {
    utterances.push(utterance.replace("$country", country.name));
  });
});

let utterancesFilterKM = [];
utterances.map(item => {
  let utterance = {
    text: item,
    intent: "QueryKM",
    entities: []
  };
  utterancesFilterKM.push(utterance);
});

// log number of countries
console.log("\t" + utterancesFilterKM.length + " records processed ...");

/**
 * Add utterances for FilterQueryKM
 *
 */
console.log("\n\tProcessing utterances for FilterQueryKM");

let utterancesFilterQueryRaw = require("./utterancesFilterQueryKM.json");

let utterancesFilterQuery = [];
utterancesFilterQueryRaw.map(item => {
  let entities = [];
  for (i in item.entities) {
    let entity = i;
    let text = item.entities[i];

    entities.push({
      entity: entity,
      startPos: item.text.indexOf(text),
      endPos: item.text.indexOf(text) + text.length - 1
    });
  }

  let utterance = {
    text: item.text,
    intent: "FilterQueryKM",
    entities: entities
  };
  utterancesFilterQuery.push(utterance);
});

// log number of countries
console.log("\t" + utterancesFilterQuery.length + " records processed ...");

/**
 * Add utterances for AggregateQueryKM
 *
 */
console.log("\n\tProcessing utterances for AggregateQueryKM");

let utterancesAggregateQueryRaw = require("./utterancesAggregateQueryKM.json");

let utterancesAggregateQuery = [];
utterancesAggregateQueryRaw.map(item => {
  let entities = [];
  for (i in item.entities) {
    let entity = i;
    let text = item.entities[i];

    entities.push({
      entity: entity,
      startPos: item.text.indexOf(text),
      endPos: item.text.indexOf(text) + text.length - 1
    });
  }

  let utterance = {
    text: item.text,
    intent: "AggregateQueryKM",
    entities: entities
  };
  utterancesAggregateQuery.push(utterance);
});

// log number of countries
console.log("\t" + utterancesAggregateQuery.length + " records processed ...");

/**
 * Read Template and insert modified data
 */
let model = require(inputModelPath);

model.closedLists.push(countries);
model.closedLists.push(countryProperties);
model.utterances = model.utterances.concat(utterancesFilterKM);
model.utterances = model.utterances.concat(utterancesFilterQuery);
model.utterances = model.utterances.concat(utterancesAggregateQuery);

/**
 * Write model
 */

fs.writeFileSync(
  path.resolve(__dirname, outputModelPath),
  JSON.stringify(model),
  "utf8"
);
console.log("\n\tFile written to " + outputModelPath);
