const fs = require('fs');

const saveToJSON = (jsonObj, filename) => {
    fs.writeFile(`./${filename}.json`, JSON.stringify(jsonObj), err => {});    
}

const cleanJson = (jsonObj, matchChar, replaceChar) => {
    let result = jsonObj;
    Object.keys(jsonObj).forEach(key => {
        // if obj itself, recursion
        // if string then replace
        // else do nothing
        if(typeof jsonObj[key] == 'object') {
            let cleanObj = cleanJson(jsonObj[key]);
            result[key] = cleanObj;
        } else if(typeof jsonObj[key] == 'string') {
            result[key] = jsonObj[key].replace(matchChar, replaceChar); // replace commas
        } else {
            // do nothing
        }
    })
    // return the json obj without the commas
    return result;
}

exports.saveToJSON = saveToJSON;
exports.cleanJson = cleanJson;