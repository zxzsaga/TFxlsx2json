'use strict';

var fs = require('fs');
var path = require('path');

function AllObj() {
    this.obj = {};
    this.json = {};
};

AllObj.prototype.addObjs = function(singleFileObjs) {
    for (var j in singleFileObjs) {
        this.obj[j] = singleFileObjs[j];
    }
};

// translate number to string, if it's type in schema is string
AllObj.prototype.transNum2Str = function(xlsx) {
    for (var i = 0; i < xlsx.targets.length; i++) {
        var schema = xlsx.getSheetObj(xlsx.targets[i].sheet + '_schema');
        for (var j = 0; j < schema.length; j++) {
            if (schema[j].type == 'string') {
                var content = this.obj[xlsx.targets[i].outputfilename].content;
                for (var k = 0; k < content.length; k++) {
                    this.obj[xlsx.targets[i].outputfilename].content[k][schema[j].columns] = content[k][schema[j].columns].toString();
                }
            }
        }
    }
};

AllObj.prototype.addJSONFiles = function(jsonFiles) {
    for (var i = 0; i < jsonFiles.length; i++) {
        var name = path.basename(jsonFiles[i], '.json');
        if (this.obj[name]) {
            console.error(name + ": exist in both xlsx and JSON file. Perhaps you should modify your 'command.json'.");
            process.exit(1);
        }
        this.obj[name] = {};
        this.obj[name].headLine = [];
        this.obj[name].content = [];
        
        var tmpHeadLine = [];
        
        var jsonObj = JSON.parse(fs.readFileSync(jsonFiles[i], 'utf8'));
        this.json[path.basename(jsonFiles[i], '.json')] = jsonObj;
        if (jsonObj.constructor != Array) {
            jsonObj = [jsonObj];
        }
        for (var j = 0; j < jsonObj.length; j++) {
            for (var k in jsonObj[j]) {
                if (tmpHeadLine.indexOf(k) == -1) {
                    tmpHeadLine.push(k);
                    this.obj[name].headLine.push({ name: k });
                }
            }
            this.obj[name].content.push(jsonObj[j]);
        }
    }
};

AllObj.prototype.checkRule = function(rule, obj) {
    var errMsg = [];
    for (var i = 0; i < rule.length; i++) {
        var quoteValues = getValues(rule[i], 'quote', obj);
        var originValues = getValues(rule[i], 'origin', obj);
/*
        console.log(quoteValues);
        console.log(originValues);
        console.log('===========');
*/
        for (var j = 0; j < quoteValues.length; j++) {
            if (originValues.indexOf(quoteValues[j]) == -1 && quoteValues[j] !== null) { // bosses may contain null.
                var msg = 'configRule[' + i + "]:" + rule[i].originfile + ', ';
                if (rule[i].originconditionKey) {
                    msg += rule[i].originconditionKey + '=' + rule[i].origincondition + ', ';
                }
                msg += rule[i].originkey + ': ' + quoteValues[j] + " doesn't exist.";
                errMsg.push(msg);
            }
        }
    }

    if (errMsg.length > 0) {
        console.error(JSON.stringify(errMsg, null, "  "));
        process.exit(1);
    }
};

function getValues(rule, type, obj) {
    // console.log('getValues: ' + rule.quotefile + ', ' + type);
    var values = [];

    var fileType = 'quotefile';
    var keyType = 'quotekey';
    var conditionKeyType = 'conditionalKey';
    var conditionType = 'condition';
    if (type == 'origin') {
        fileType = 'originfile';
        keyType = 'originkey';
        conditionKeyType = 'originconditionKey';
        conditionType = 'origincondition';
    }

    var fileObj = getFileObj(rule[fileType], obj);
    // console.log(rule[conditionKeyType]);
    var filteredObj = filterObj(rule[conditionKeyType], rule[conditionType], fileObj);
    for (var i = 0; i < filteredObj.length; i++) {
        if (filteredObj[i][rule[keyType]]) {
            var event = filteredObj[i][rule[keyType]];
            if (event.constructor == Array) {
                // console.log("ARRAY");
                for (var j = 0; j < event.length; j++) {
                    values.push(event[j]);
                }
            }
            else if (event.constructor == Object) {
                // console.log("OBJECT");
                for (var j in event) {
                    if (event[j].constructor == Array) {
                        for (var k = 0; k < event[j].length; k++) {
                            values.push(event[j][k]);
                        }
                    }
                    else {
                        values.push(event[j]);
                    }
                }
            }
            else {
                // console.log("NUMBER");
                values.push(filteredObj[i][rule[keyType]]);
            }
        }
    }
   /*
    if (rule.condition == 2) {
        console.log(filteredObj);
        console.log(values);
        process.exit();
    }*/
    return values;
}

function getFileObj(filename, obj) {
    var filenameArr = filename.split('.');
    
    if (filenameArr.length == 1) {
        if (obj[filename]) {
            return obj[filename].content;
        }
        else {
            console.error('file: ' + filename + " doesn't exist.");
            process.exit(1);
        }
    }
    else {
        if (filenameArr.length == 2) {
            var content = [];
            for (var i = 0; i < obj[filenameArr[0]].content.length; i++) {
                var currentContent = obj[filenameArr[0]].content[i];
                for (var j = 0; j < currentContent[filenameArr[1]].length; j++) {
                    var currentProperty = currentContent[filenameArr[1]][j];
                    content.push(currentProperty);
                }
            }
            return content;
        }
        else {
            console.error('file: ' + filenameArr[0] + ', property: ' + filenameArr[1] + " doesn't exist.");
            process.exit(1);        
        }
    }
}

function filterObj(conditionKey, condition, fileObj) {
    // console.log(conditionKey + ': ' + condition);
    if (!conditionKey) {
        return fileObj;
    }
    else {
        var filteredObj = [];
        for (var i = 0; i < fileObj.length; i++) {
            var currentObj = fileObj[i];
            if (currentObj[conditionKey]) {
                if (currentObj[conditionKey] == condition) {
                    filteredObj.push(currentObj);
                    // console.log("push: " + JSON.stringify(currentObj, null, '  '));
                }
            }
        }
/*
        if (condition == 2) {
            console.log(filteredObj);
            process.exit();
        }
*/
        return filteredObj;
    }
}

exports.AllObj = AllObj;
