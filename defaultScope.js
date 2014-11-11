var assert = require('assert');

exports.builtinStatements = function() {
	return [
	list, add, subtract, multiply, divide
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

var newBinaryOperator = function(name, type, op) {
	return {
		lvalue: {name: name, type: null}, 
		expression: {
			type: 'functionLiteral',
			argNames: [],
			bodyNativeFunction: function(getArg) {
				var m1 = getArg("$0");
				var m2 = getArg("$1");
				assert.equal(m1.type, type);
				assert.equal(m2.type, type);
				return op(m1, m2);
			},
			nativeFunctionName: name,
			functionType: {
				functionWithInputTypes: [{name: type}, {name: type}],
				functionWithOutputType: {name: type}
			}
		}
	}
}

var multiply = newBinaryOperator('multiply', 'Number', function(m1,m2){return {type: 'Number', value: m1.value*m2.value}});
var add = newBinaryOperator('add', 'Number', function(m1,m2){return {type: 'Number', value: m1.value+m2.value}});
var subtract = newBinaryOperator('subtract', 'Number', function(m1,m2){return {type: 'Number', value: m1.value-m2.value}});
var divide = newBinaryOperator('divide', 'Number', function(m1,m2){return {type: 'Number', value: m1.value/m2.value}});

exports.getNativeFunctionDictionary = function() {
	var d = {};
	exports.builtinStatements().forEach(function(st) {
		d[st.expression.nativeFunctionName] = st.expression.bodyNativeFunction;
	})
	return d;
}
