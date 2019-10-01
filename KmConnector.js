class KmConnector {
    constructor() {
        this.data = require("./data/dataQueryCache.json");
        this.countryProperties = require("./data/countryPropertiesQueryCache.json");
    }

    query(country, property) {
        return this.data[country][property];
    }

    filter(property, operator, value) {
        // check weather the property is an integer value
        if (this.countryProperties[property].dataType = 'int') {
            value = parseInt(value);
        }
        else {
            // this is not an int - only equal operator is possilbe
            operator = null;
        }
        // this is an integer
        let countries = [];
        let countriesString = "";

        switch (operator) {
            case 'more':
                console.log('more');
                for (let i in this.data) {
                    let item = this.data[i];
                    if (item[property] > value) {
                        countries.push(item);
                    }
                }
                break;
            case 'less':
                console.log('less');
                for (let i in this.data) {
                    let item = this.data[i];
                    if (item[property] < value) {
                        countries.push(item);
                    }
                }
                break;
            default:
                console.log('default');
                for (let i in this.data) {
                    let item = this.data[i];
                    if (item[property] == value) {
                        countries.push(item);
                    }
                }
        }


        // build return object
        for (let i in countries) {
            countriesString += countries[i].name;
            if (i < countries.length-1) countriesString += ", ";
        }

        return {
            num: countries.length,
            items: countries,
            string: countriesString
        };
    }

    aggregateFunction(property, operator, value) {
        // check weather the property is an integer value
        if (this.countryProperties[property].dataType = 'int') {
            value = parseInt(value);
        }
        else {
            // this is not an int - only equal operator is possilbe
            operator = 'count';
        }
        switch (operator) {
            case "avg":
                break;
            case 'max':
                break;
            case 'min':
                break;
            case 'med':
                break;
            case 'sum':
                break;
            default: // count
        }

        return null;
    }

    getAnswerText(property) {
        return this.countryProperties[property].defaultAnswer;
    }
}

module.exports.KmConnector = KmConnector;
