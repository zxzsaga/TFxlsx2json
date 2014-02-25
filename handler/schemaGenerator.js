'use strict';

var path = require('path');
var fs = require('fs');
var XLSX = require('xlsx');

function Schema(outputDir) {
    this.filename = outputDir + '/schema/ConfigurationSchemas';
    this.properties = {};
    this.configurationConfigs = {};
}

Schema.prototype.generateSchema = function(outputDir, filename, xlsx) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    if (!fs.existsSync(outputDir + '/schema')) {
        fs.mkdirSync(outputDir + '/schema');
    }
    var outputSchema = outputDir + '/schema/' + path.basename(filename, '.xlsx') + '_schema.js';
    fs.writeFileSync(outputSchema, '');
    fs.appendFileSync(outputSchema, "'use strict';\n\n");
    for (var i = 0; i < xlsx.targets.length; i++) {
        var singleSchema = this.arraySchema(xlsx.obj, xlsx.targets[i]);
        fs.appendFileSync(outputSchema, singleSchema);
    };

    /*var configs = */
    this.configSchema(xlsx.targets);
    // fs.appendFileSync(outputSchema, configs);

    return outputSchema;
};

Schema.prototype.arraySchema = function(xlsx, target) {
    var obj = {};
    obj.name = {};
    obj.name.enum = [];
    obj.name.enum.push(target.outputfilename);
    obj.name.required = true;

    obj.content = {};
    obj.content.type = 'array';
    obj.content.items = {};
    obj.content.items.type = 'object';
    var properties = {};
    var schema_json = XLSX.utils.sheet_to_row_object_array(xlsx.Sheets[target.sheet + '_schema']);
    var schema_num = schema_json.length;
    for (var i=0; i<schema_num; i++) {
        var row = schema_json[i];
        if (row.type == 'int') {
            row.type = 'integer';
        };
        properties[row.columns] = {type: row.type, required: row.required, description: row.desc};
    }
    obj.content.items.properties = properties;
    this.properties[obj.name.enum[0]] = obj;
    var result_str = 'exports.' +
        obj.name.enum[0] +
        '_properties = ' +
        JSON.stringify(obj, null, "  ") +
        "\n";
    return result_str;
};

Schema.prototype.configSchema = function(targets) {
/*
    var obj = {};
    obj.description = 'configurations collection';
    //not always 'object'?
    obj.type = 'object';
    var properties = {};
    var targets_num = targets.length;
    for (var i=0; i<targets_num; i++) {
        var pro_event = {};
        var pro_key = targets[i].outputfilename;
        pro_event.description = pro_key + '.' + targets[i].format;
        pro_event.type = 'object';
        pro_event.properties = pro_key + '_properties';
        // need change required
        pro_event.required = true;
        properties[pro_key] = pro_event;
    }
    obj.properties = properties;
    this.configurationConfigs = obj;
    var result_str = 'exports.configurations = ' + JSON.stringify(obj, null, "  ") + "\n";
    return result_str;
*/
    for (var i = 0; i < targets.length; i++) {
        this.configurationConfigs[targets[i].outputfilename] = {
            description: targets[i].outputfilename + '.' + targets[i].format,
            type: 'object',
            properties: this.properties[targets[i].outputfilename],
            required: true
        }
        // console.log(this.configurationConfigs[targets[i].outputfilename]);
    }
};

Schema.prototype.writeConfiguration = function(configTarget) {
    var output = {
        description: "configurations collection",
        type: "object",
        properties: {}
    };
    var outputClient = {
        description: "configurations collection",
        type: "object",
        properties: {}
    };
    for (var i in this.configurationConfigs) {
        if (configTarget[i] == 'a' || configTarget[i] == 's') {
            output.properties[i] = this.configurationConfigs[i];
        }
        if (configTarget[i] == 'a' || configTarget[i] == 'c') {
            outputClient.properties[i] = this.configurationConfigs[i];
        }
    }
    writeHelper(this.filename + '.js', output);
    writeHelper(this.filename + '_c.js', outputClient);
};

function writeHelper(filename, output) {
    fs.writeFileSync(filename, '');
    fs.appendFileSync(filename, "'use strict';\n\n");
    fs.appendFileSync(filename, 'exports.configurations = ')
    fs.appendFileSync(filename, JSON.stringify(output, null, '  '));    
}

exports.Schema = Schema;
