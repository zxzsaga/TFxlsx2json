'use strict';

var program = require('commander');
var fs = require('fs');
var path = require('path');
var XLSX = require('xlsx');

program
    .version('0.0.1')
    .usage('')
    .option('-s, --server', 'update server configs')
    .option('-c, --client', 'update client configs')
    .option('-a, --all', 'update client and server configs')
    .parse(process.argv);

/* Task:
 *   "inputDir":  string,
 *   "outputDir": string,
 *   "configTarget": string,
 *   "configRules": string,
 *   "updateEnd": 's' or 'c' or 'a'
 */
function Task() {
    if (program.server == true) {
        this.updateEnd = 's';
    }
    else if (program.client == true) {
        this.updateEnd = 'c';
    }
    else if (program.all == true) {
        this.updateEnd = 'a';
    }

    this.inputDir = '../input/Excels';
    this.outputDir = '../configurations';
    this.configTarget = '../input/configTarget.csv';
    this.configRules = '../input/configRules.xlsx';
};

/* return:
 *    [ string ]
 */
Task.prototype.getInputFiles = function() {
    var filenames = fs.readdirSync(this.inputDir);
    var inputFiles = [];
    for (var i = 0; i < filenames.length; i++) {
        if (path.extname(filenames[i]) == '.xlsx') {
            inputFiles.push(this.inputDir + '/' + filenames[i]);
        }
    }
    return inputFiles;
};

Task.prototype.getInputJSONFiles = function() {
    var filenames = fs.readdirSync(this.inputDir);
    var jsonFiles = [];
    for (var i = 0; i < filenames.length; i++) {
        if (path.extname(filenames[i]) == '.json') {
            jsonFiles.push(this.inputDir + '/' + filenames[i]);
        }
    }
    return jsonFiles;
};

/* return:
 *   e.g:
 *   {
 *     basements: 'a',
 *     items: 's',
 *     c_items: 'c'
 *     ...
 *   }
 */
Task.prototype.getConfigTarget = function() {
    var configTarget = {};
    try {
        var csvStr = fs.readFileSync(this.configTarget, 'utf8');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
    var rows = csvStr.split("\r\n");
    for (var i = 1; i < rows.length; i++) {
        if (rows[i] != '') {
            var currentRow = rows[i].split(',');
            if (currentRow.length != 2) {
                console.error('configTarget.csv error. It should have two columns.');
                process.exit(1);
            }
            else {
                configTarget[currentRow[0]] = currentRow[1];
            }
        }
    }
    return configTarget;
};

/* return:
 *   [ object ]
 */
Task.prototype.getConfigRule = function() {
    try {
        var configRuleFile = XLSX.readFile(this.configRules);
    } catch (err) {
        var msg = 'Read configRule file error.\n';
        msg += this.inputFile + ': ' + err;
        console.error(msg);
        process.exit(1);
    }
    var configRule = XLSX.utils.sheet_to_row_object_array(configRuleFile.Sheets['relations']);
    return configRule;
};

function appendSlash(str) {
    if (str[str.length -1 ] != '/') {
        str += '/';
    }
    return str;
};

exports.Task = Task;
