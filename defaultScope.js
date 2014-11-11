var assert = require('assert');

exports.builtinStatements = function() {
	return [
	list, multiply
	]
}
var list = {
			lvalue: {name: "List", type: null}, 
			expression: {
				type: 'functionLiteral',
				argNames: [],
				bodyNativeFunction: function(getArg) {
				
				},
				nativeFunctionName: 'list',
				functionType: {
					functionWithOverflowArgs: true,
					functionWithInputTypes: [],
					functionWithOutputType: {name: "List"}
				}
			}
}

var multiply = {
			lvalue: {name: "multiply", type: null}, 
			expression: {
				type: 'functionLiteral',
				argNames: [],
				bodyNativeFunction: function(getArg) {
					var m1 = getArg("$0");
					var m2 = getArg("$1");
					assert.equal(m1.type, 'number');
					assert.equal(m2.type, 'number');
					return {type: 'number', value: m1.value * m2.value};
				},
				nativeFunctionName: 'multiply',
				functionType: {
					functionWithInputTypes: [{name: "Number"}, {name: "Number"}],
					functionWithOutputType: {name: "Number"}
				}
			}
}		
exports.getNativeFunctionDictionary = function() {
	var d = {};
	exports.builtinStatements().forEach(function(st) {
		d[st.expression.nativeFunctionName] = st.expression.bodyNativeFunction;
	})
	return d;
}
