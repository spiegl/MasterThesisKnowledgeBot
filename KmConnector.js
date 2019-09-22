

class KmConnector {
    constructor(){
        this.data = require('./data/query.json');
        this.countryProperties = require('./data/countryPropertiesQuery.json');
    }

    query(country, property){
        return (this.data[country][property]);
    }

    getAnswerText(property) {
        return (this.countryProperties[property].defaultAnswer);
    }
}


module.exports.KmConnector = KmConnector;