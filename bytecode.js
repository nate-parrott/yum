var processIr = require('./processIr.js');
var utils = require('./utils.js');
var shallowCopy = utils.shallowCopy;

var lastAssignedUniqueId = 0;
var uniqueId = function() {
	return lastAssignedUniqueId++;
}

var bytecodeForKeys = {};

var generateBytecode = function(statements, scope) {
	statements.forEach(function(statement) {
		var result = 
	});
}

exports.generateBytecode = function(rootStatements) {
	return generateBytecode(rootStatements, {});
}
