'use strict';

var XLSX = require('xlsx');
var revalidator = require('revalidator');

// 检查 content 中 targets 行的 sheet 列和 outputfilename 列是否有值
exports.verifyContentSheet = function(targets) {
    for (var i = 0; i < targets.length; i++) {
        var tmp = targets[i];
        if (!tmp.sheet) {
            console.error(tmp.outputfilename + ' Target[' + i + "]: 'sheet' is empty.");
            process.exit(1);
        }
        /*
        if (tmp.format != 'csv' && tmp.format != 'json') {
            console.error(tmp.outputfilename + 'Target[' + i + "]: 'format' must be 'csv' or 'json'.");
            process.exit(1);
        }
        */
        if (!tmp.outputfilename) {
            console.error(tmp.outputfilename + 'Target[' + i + "]: 'outputfilename' is empty.");
            process.exit(1);
        }
    }
};

// 检查是否有目标 sheet 和 目标的 schema sheet, 以及检查 schema sheet 中是否有相同 columns 的行
exports.verifySchema = function(xlsx) {
    for (var i = 0; i < xlsx.targets.length; i++) {
        var targetSheetName = xlsx.targets[i].sheet;
        var detailSheet = xlsx.obj.Sheets[targetSheetName];
        if (!detailSheet) {
            console.log('Target[' + i + "]: " + targetSheetName + " sheet doesn't exist.");
            process.exit(1);            
        };
        var schemaSheet = xlsx.obj.Sheets[targetSheetName + '_schema'];
        if (!schemaSheet) {
            console.log('Target[' + i + "]: " + targetSheetName + "_schema sheet doesn't exist.");
            process.exit(1);
        };
        var rows = XLSX.utils.sheet_to_row_object_array(schemaSheet);
        var rowNum = rows.length;
        for (var i = 0; i < rowNum; i++) {
            for (var j = i+1; j < rowNum; j++) {
                if (rows[i].columns == rows[j].columns) {
                    console.log('Same column names: ' + rows[i].columns);
                    console.log("In sheet '" + targetSheet + "' row[" + i + '] and row[' + j + ']');
                    process.exit(1);
                }
            }
        }
    }
};

exports.verifyProperties = function(allObj, target, output_schema) {
    var schema = require('../' + output_schema);
    var rows = allObj.obj[target.outputfilename].content;
    for (var i = 0; i < rows.length; i++) {
        var tmp = revalidator.validate(rows[i], schema[target.outputfilename + '_properties'].content.items)
        if (tmp.valid == false) {
            console.log('Sheet ' + target.sheet + ', rows ' + i + ': ');
            console.dir(tmp);
            process.exit(1);
        }
    }
};
