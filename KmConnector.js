

class KmConnector {
    constructor(){
        this.data = require('./data/dataQueryCache.json');
        this.countryProperties = require('./data/countryPropertiesQueryCache.json');
    }

    query(country, property){
        return (this.data[country][property]);
    }

    getAnswerText(property) {
        return (this.countryProperties[property].defaultAnswer);
    }
}


module.exports.KmConnector = KmConnector;