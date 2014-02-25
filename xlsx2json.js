'use strict';

var fs = require('fs');
var path = require('path');

var cmdHandler = require('./handler/cmdHandler.js');
var xlsxHandler = require('./handler/xlsxHandler.js');
var verifier = require('./handler/verifier.js');
var schemaGenerator = require('./handler/schemaGenerator.js');
var allObjHandler = require('./handler/allObjHandler.js');
var writeHandler = require('./handler/writeHandler.js');

var task = new cmdHandler.Task();
var inputFiles = task.getInputFiles();
var configTarget = task.getConfigTarget();
var configRule = task.getConfigRule();
var formatTable = {};
var allObj = new allObjHandler.AllObj();
var schema = new schemaGenerator.Schema(task.outputDir);

for (var i = 0; i < inputFiles.length; i++) {
    var xlsx = new xlsxHandler.Xlsx(inputFiles[i]);
    
    verifier.verifyContentSheet(xlsx.targets);
    verifier.verifySchema(xlsx);
    
    for (var j = 0; j < xlsx.targets.length; j++) {
        formatTable[xlsx.targets[j].outputfilename] = xlsx.targets[j].format;
    }
    
    var singleFileObjs = xlsx.transToUse();
    allObj.addObjs(singleFileObjs);
    allObj.transNum2Str(xlsx); 

    var outputSchema = schema.generateSchema(task.outputDir, path.basename(inputFiles[i]), xlsx);

    for (var j = 0; j < xlsx.targets.length; j++) {
        verifier.verifyProperties(allObj, xlsx.targets[j], outputSchema);
    }
}

allObj.addJSONFiles(task.getInputJSONFiles());
allObj.checkRule(configRule, allObj.obj);
schema.writeConfiguration(configTarget);
writeHandler.writeFile(task.outputDir, allObj.obj, allObj.json, configTarget, task.updateEnd, formatTable);
