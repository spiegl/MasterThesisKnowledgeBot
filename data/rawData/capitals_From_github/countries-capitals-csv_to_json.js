var fs = require('fs');

rawData = fs.readFileSync("countries-capitals.csv", "utf8");

rawData = rawData.split("\n")

data = {};

rawData.forEach(item => {
    pair = item.split(',')
    country = pair[0];
    city = pair[1];

    id = country.toLowerCase();
    id = id.replace(new RegExp(" ", 'g'), '_');

    data[id] = {};
    data[id]['name'] = country;
    data[id]['capital'] = city;
});

fs.writeFileSync('countries.json', JSON.stringify(data), 'utf8')