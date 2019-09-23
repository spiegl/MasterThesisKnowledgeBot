/**
 * This script reads data from the `data` directory and transforms it for the LUIS model
 *
 * A template model input will get enhanced.
 */

/**
 * Config
 */

let inputModelPath = "./CognitiveModelForLUIS-Template-v1.json";
let outputModelPath = "./output.json";

/**
 * Init
 */
console.log("Starting ...");

const fs = require("fs");

/**
 * Read data from data directory
 */
const rawData = fs.readFileSync("../data/data.json", "utf8");
data = JSON.parse(rawData);

const countryPropertiesRawData = fs.readFileSync(
  "../data/countryProperties.json",
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
 * Add Properties
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
 * Add utterances
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
 * Read Template and insert modified data
 */
let model = JSON.parse(fs.readFileSync("./" + inputModelPath, "utf8"));

model.closedLists.push(countries);
model.closedLists.push(countryProperties);
model.utterances = model.utterances.concat(utterancesList);

//console.log(model)

/**
 * Write model
 */

fs.writeFileSync(outputModelPath, JSON.stringify(model), "utf8");
console.log("\tFile written to " + outputModelPath);
