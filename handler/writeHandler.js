'use strict';

var fs = require('fs');

exports.writeFile = function(outputDir, allObj, json, configTarget, updateFolder, formatTable) {
    for (var i in allObj) {
        var output =  [];
        if (formatTable[i] == 'csv') {
            var headLine = [];
            for (var j = 0; j < allObj[i].headLine.length; j++) {
                headLine.push(allObj[i].headLine[j].name);
            }
            output.push(headLine);
            for (var j = 0; j < allObj[i].content.length; j++) {
                var contentLine = []
                for (var k = 0; k < headLine.length; k++) {
                    contentLine.push(allObj[i].content[j][headLine[k]]);
                }
                output.push(contentLine);
            }
        }
        else if (formatTable[i] == 'json') {
            output = allObj[i].content;
        }
        else {
            output = json[i];
        }

        if (configTarget[i]) {
            writeFileByConfigTargetAndUpdateFolder(outputDir, i, output, configTarget, updateFolder);
        }
        else {
            console.error(i + ': server or client undefined');
            process.exit();
        }
    }
};

function writeFileByConfigTargetAndUpdateFolder(outputDir, filename, output, configTarget, updateEnd) {
    if (!fs.existsSync(outputDir + '/server')) {
        fs.mkdirSync(outputDir + '/server');
    }
    if (!fs.existsSync(outputDir + '/client')) {
        fs.mkdirSync(outputDir + '/client');
    }
                
    if (updateEnd == 'a') {
        if (configTarget[filename] == 'a') {
            fs.writeFile(outputDir + '/server/' + filename + '.json', JSON.stringify(output));
            fs.writeFile(outputDir + '/client/' + filename + '.json', JSON.stringify(output));
        }
        else if (configTarget[filename] == 's') {
            fs.writeFile(outputDir + '/server/' + filename + '.json', JSON.stringify(output));
        }
        else if (configTarget[filename] == 'c') {
            fs.writeFile(outputDir + '/client/' + filename + '.json', JSON.stringify(output));
        }
    }
    else if (updateEnd == 's') {
        if (configTarget[filename] == 'a') {
            fs.writeFile(outputDir + '/server/' + filename + '.json', JSON.stringify(output));
        }
        else if (configTarget[filename] == 's') {
            fs.writeFile(outputDir + '/server/' + filename + '.json', JSON.stringify(output));
        }
    }
    else if (updateEnd == 'c') {
        if (configTarget[filename] == 'a') {
            fs.writeFile(outputDir + '/client/' + filename + '.json', JSON.stringify(output));
        }
        else if (configTarget[filename] == 'c') {
            fs.writeFile(outputDir + '/client/' + filename + '.json', JSON.stringify(output));
        }
    }
};
