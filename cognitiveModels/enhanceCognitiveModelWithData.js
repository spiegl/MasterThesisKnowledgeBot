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
let dataEU = require("../data/dataEU.json");
let cities = require("../data/cities.json");
let countryPropertiesData = require("../data/countryProperties.json");
let cityPropertiesData = require("../data/cityProperties.json");

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

// add EU as country
let eu = {
    "canonicalForm": dataEU.iso.toLowerCase(),
    "list": [
        dataEU.name,
        dataEU.name.toLowerCase(),
        dataEU.iso
    ]
};
dataEU.synonyms.map(item => eu.list.push(item));
countries.subLists.push(eu);

// add cities as countries
cities.map(item => {
    let country = {};
    country["canonicalForm"] = item.canonicalForm.toLowerCase();
    country["list"] = [];
    country.list.push(item.name);
    country.list.push(item.name.toLowerCase());
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
 * Add CityProperties
 */

console.log("\n\tProcessing CityProperties");

// add CityProperties to CountryProperties for the sake of easiness
cityPropertiesData.map(item => {
  let prop = {};
  prop["canonicalForm"] = item.canonicalForm.toLowerCase();
  prop["list"] = [];
  prop.list.push(item.name);
  item.synonyms.map(innerItem => prop.list.push(innerItem));

  countryProperties.subLists.push(prop);
});

// log number of countries
console.log(
  "\t" + cityPropertiesData.length + " records processed ..."
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

// countries
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

//  cities
cityPropertiesData.map(cityProperty => {
    cityProperty.utterances.map(utterance => {
        cities.map(city => {
            utterances.push(utterance.replace("$city", city.name));
        });
    });
});

// finalize for model
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
 * Add utterances for FilterQueryKMNum
 *
 */
console.log("\n\tProcessing utterances for FilterQueryKMNum");

let utterancesFilterQueryNumRaw = require("./utterancesFilterQueryKMNum.json");

let utterancesFilterQueryNum = [];
utterancesFilterQueryNumRaw.map(item => {
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
    intent: "FilterQueryKMNum",
    entities: entities
  };
  utterancesFilterQueryNum.push(utterance);
});

// log number of countries
console.log("\t" + utterancesFilterQueryNum.length + " records processed ...");

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
model.utterances = model.utterances.concat(utterancesFilterQueryNum);
model.utterances = model.utterances.concat(utterancesAggregateQuery);

model.versionId += " " + Math.floor(Date.now() / 1000);

/**
 * Write model
 */

fs.writeFileSync(
  path.resolve(__dirname, outputModelPath),
  JSON.stringify(model),
  "utf8"
);
console.log("\n\tFile written to " + outputModelPath);
