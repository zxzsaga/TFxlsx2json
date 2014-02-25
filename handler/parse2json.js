'use strict';

var XLSX = require('xlsx');

exports.parse2json = function(xlsx, sheet_name, schemaNeedHeadLine) {
    var content = XLSX.utils.sheet_to_row_object_array(xlsx.Sheets[sheet_name]);

    var ret = [];

    var headLine = [];
    var sheet = xlsx.Sheets[sheet_name];
    var range = XLSX.utils.decode_range(sheet["!ref"]);
    for (var i = range.s.c; i <= range.e.c; i++) {
        var box_name = XLSX.utils.encode_cell({
            c: i,
            r: 0
        });
        if (sheet[box_name]) {
            headLine.push(sheet[box_name].v);
        }
    }
    for (var i = 0; i < content.length; i++) {
        var tmpObj = {};
        for (var j = 0; j < schemaNeedHeadLine.length; j++) {
            if (schemaNeedHeadLine[j].type == 'int') {
                if (typeof content[i][schemaNeedHeadLine[j].name] == 'number') {
                    tmpObj[schemaNeedHeadLine[j].name] = Math.round(content[i][schemaNeedHeadLine[j].name]);
                }
            }
            else if (schemaNeedHeadLine[j].type == 'array') {
                tmpObj[schemaNeedHeadLine[j].name] = [];
                for (var k = 0; k < headLine.length; k++) {
                    if (headLine[k].indexOf(schemaNeedHeadLine[j].name) > -1) {
                        if (content[i][headLine[k]]) {
                            tmpObj[schemaNeedHeadLine[j].name].push(content[i][headLine[k]]);
                        }
                        else {
                            tmpObj[schemaNeedHeadLine[j].name].push(null);
                        }
                    }
                }
            }
            else { 
                if (content[i][schemaNeedHeadLine[j].name]) {
                    tmpObj[schemaNeedHeadLine[j].name] = content[i][schemaNeedHeadLine[j].name];
                }
            }
        }
        ret.push(tmpObj);
    }
    return ret;
};

/*
exports.parse2json = function(xlsx, sheet_name, schemaEvents) {
    var sheet = xlsx.Sheets[sheet_name];
    var needList = {};
    var arrList = [];
    for (var i in schemaEvents) {
        if (schemaEvents[i].type == 'array') {
            arrList.push(i);
        }
    }
    var range = XLSX.utils.decode_range(sheet["!ref"]);
    var all_line = [];

    for (var i = range.s.c; i <= range.e.c; i++) {
        var box_name = XLSX.utils.encode_cell({
            c: i,
            r: 0
        });
        if (sheet[box_name]) {
            if (schemaEvents[sheet[box_name].v]) {
                needList[sheet[box_name].v] = i;
            }
            else {
                for (var k = 0 , lenk = arrList.length; k < lenk; k++) {
                    if (sheet[box_name].v.indexOf(arrList[k]) > -1) {
                        if (!needList[arrList[k]]) {
                            needList[arrList[k]] = [];
                        }
                        needList[arrList[k]].push(i);
                    }
                }
            }
        }
    }
    // console.log(needList);

    var headLine = [];
    for (var i in needList) {
        headLine.push(i);
    }
    all_line.push(headLine);

    for (var i = 1; i <= range.e.r; i++) {
        var line = [];
        for (var j in needList) {
            if (typeof needList[j] == 'object') {
                var tmpArr = [];
                for (var k = 0, lenk = needList[j].length; k < lenk; k++) {
                    var boxName = XLSX.utils.encode_cell({
                        c: needList[j][k],
                        r: i
                    });
                    tmpArr.push(boxModify(sheet[boxName], schemaEvents[j].type));
                }
                line.push()
            }
            else if (typeof needList[j] == 'number') {
                var boxName = XLSX.utils.encode_cell({
                    c: needList[j],
                    r: i
                });

            }
        }
        all_line.push(line);
    }
    return all_line;
};
*/
