/**
 * This script reads data from the `data` directory and transforms it for the LUIS model
 *
 * A template model input will get enhanced.
 */

/**
 * Config
 */

const inputModelPath = "./cognitiveModels/CognitiveModelBasis.json";
const outputModelPath = "./cognitiveModels/output.json";

/**
 * Init
 */
console.log("Starting enhancing model ...");

const fs = require("fs");

/**
 * Read data from data directory
 */
const rawData = fs.readFileSync("./data/data.json", "utf8");
data = JSON.parse(rawData);

const countryPropertiesRawData = fs.readFileSync(
  "./data/countryProperties.json",
  "utf8"
);
countryPropertiesData = JSON.parse(countryPropertiesRawData);

/**
 * Add counties
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
console.log("\t" + countries.subLists.length + " records modified ...");

/**
 * Add CountryProperties
 */

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

/**
 * Add utterances for QueryKM
 * 
 * {
        "text": "capital of italy?",
        "intent": "QueryKM",
        "entities": []
    },
 */
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

let utterancesList = [];
utterances.map(item => {
  let utterance = {
    text: item,
    intent: "QueryKM",
    entities: []
  };
  utterancesList.push(utterance);
});

/**
 * Add utterances for FilterQueryKM
 *
 */
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

/**
 * Add utterances for AggregateQueryKM
 *
 */
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

/**
 * Read Template and insert modified data
 */
let model = JSON.parse(fs.readFileSync("./" + inputModelPath, "utf8"));

model.closedLists.push(countries);
model.closedLists.push(countryProperties);
model.utterances = model.utterances.concat(utterancesList);
model.utterances = model.utterances.concat(utterancesFilterQuery);
model.utterances = model.utterances.concat(utterancesAggregateQuery);

//console.log(model)

/**
 * Write model
 */

fs.writeFileSync(outputModelPath, JSON.stringify(model), "utf8");
console.log("\tFile written to " + outputModelPath);
