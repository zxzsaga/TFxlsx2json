'use strict';

var XLSX = require('xlsx');
var xlsx2json = require('./parse2json.js');

/* Xlsx:
 *   "inputFile": string,
 *   "obj": object,
 *   "targets": [    // depends on the content of 'content' sheet
 *     {
 *       "sheet": string,
 *       "format": string,
 *       "outputfilename": string
 *     }
 *   ]
 */
function Xlsx(inputFile) {
    this.inputFile = inputFile;
    try {
        this.obj = XLSX.readFile(this.inputFile); // this XLSX.readFile is Sync.
    } catch (err) {
        var msg = 'Xlsx parsing error.\n';
        msg += this.inputFile + ': ' + err;
        console.error(msg);
        process.exit(1);
    }
    try {
        this.targets = XLSX.utils.sheet_to_row_object_array(this.obj.Sheets['content']);
    } catch (err) {
        var msg = "Getting content sheet failed. Please ensure your .xlsx file has content sheet.\n";
        msg += err;
        console.error(msg);
        process.exit(1);
    }
};

/* Return:
 *   {
 *     sheetName: {
 *       "headLine": [
 *         {
 *           "name": string,
 *           "type": string
 *         }
 *       ],
 *       "content": [ object ]
 *     }
 *     sheetName2: ...
 *   }
 */
Xlsx.prototype.transToUse = function() {
    var ret = {};
    for (var i = 0; i < this.targets.length; i++) {
        var name = this.targets[i].outputfilename;
        ret[name] = {};
        ret[name].headLine = [];

        var schemaList = XLSX.utils.sheet_to_row_object_array(this.obj.Sheets[this.targets[i].sheet + '_schema']);

        for (var j = 0; j < schemaList.length; j++) {
            ret[name].headLine.push(
                {
                    name: schemaList[j].columns,
                    type: schemaList[j].type
                }
            );
        }
        ret[name].content = xlsx2json.parse2json(this.obj, this.targets[i].sheet, ret[name].headLine);
    }
    return ret;
};

Xlsx.prototype.getSheetObj = function(sheetName) {
    return XLSX.utils.sheet_to_row_object_array(this.obj.Sheets[sheetName]);
};

exports.Xlsx = Xlsx;


