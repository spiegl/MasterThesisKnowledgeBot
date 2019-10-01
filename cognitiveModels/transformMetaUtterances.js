/**
 *
 * This script reads data from the `data` directory and files from this directory and transforms it for the LUIS model
 */

const fs = require("fs");
const path = require("path");

/**
 * Init
 */
console.log("\nStarting transforming meta data ...");

/**
 * Config
 */
const inputModelPath = "./utterancesFilterQueryKMNumMeta.json";
const outputModelPath = "./utterancesFilterQueryKMNum.json";

/** 
 * Read file 
 */
let meta = require(inputModelPath);

/**
 * Transform
 */

console.log(meta.utterances)

let utterances1 = [];

meta.utterances.map(utterance => {
    meta.vars['$filterValue'].map(filterValue => {
        meta.vars['$operator'].map(operator => {
            let tmp = utterance.text.replace('$filterValue', filterValue);
            let finalUtterance = tmp.replace('$operator', operator);
            utterances1.push({
                "text": finalUtterance,
                "entities": {
                    "FilterValue": filterValue,
                    "FilterOperator": operator,
                    "CountryProperty": utterance.entities.CountryProperty
                }
            });
        });
    });
});

// let utterances2 = [];

// meta.string.utterances.map(utterance => {
//     utterances2.push({
//         "text": utterance.text,
//         "entities": {
//             "FilterValue": utterance,
//             "FilterOperator": operator,
//             "CountryProperty": utterance.entities.CountryProperty
//         }
//     });
// });


let utterances = utterances1;

/**
 * Write file
 */
fs.writeFileSync(
    path.resolve(__dirname, outputModelPath),
    JSON.stringify(utterances),
    "utf8"
);
console.log("\n\tFile written to " + outputModelPath);
