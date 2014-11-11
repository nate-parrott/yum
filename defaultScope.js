var assert = require('assert');

exports.builtinStatements = function() {
	return [
	list, add, subtract, multiply, divide, equal, and, or, not, mod
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

var newUnaryOperator = function(name, inputTypes, outputType, op) {
	return {
		lvalue: {name: name, type: null}, 
		expression: {
			type: 'functionLiteral',
			argNames: [],
			bodyNativeFunction: function(getArg) {
				var m1 = getArg("$0");
				if (inputTypes[0]) {
					assert.equal(m1.type, inputTypes[0].name);
				}
				return op(m1);
			},
			nativeFunctionName: name,
			functionType: {
				functionWithInputTypes: inputTypes,
				functionWithOutputType: outputType
			}
		}
	}
}

var newBinaryOperator = function(name, inputTypes, outputType, op) {
	return {
		lvalue: {name: name, type: null}, 
		expression: {
			type: 'functionLiteral',
			argNames: [],
			bodyNativeFunction: function(getArg) {
				var m1 = getArg("$0");
				var m2 = getArg("$1");
				if (inputTypes[0]) {
					assert.equal(m1.type, inputTypes[0].name);
				}
				if (inputTypes[1]) {
					assert.equal(m2.type, inputTypes[1].name);
				}
				return op(m1, m2);
			},
			nativeFunctionName: name,
			functionType: {
				functionWithInputTypes: inputTypes,
				functionWithOutputType: outputType
			}
		}
	}
}

var num = {name: 'Number'};
var bool = {name: 'Bool'};
var multiply = newBinaryOperator('multiply', [num,num], num, function(m1,m2){return {type: 'Number', value: m1.value*m2.value}});
var add = newBinaryOperator('add', [num,num], num, function(m1,m2){return {type: 'Number', value: m1.value+m2.value}});
var subtract = newBinaryOperator('subtract', [num,num], num, function(m1,m2){return {type: 'Number', value: m1.value-m2.value}});
var divide = newBinaryOperator('divide', [num,num], num, function(m1,m2){return {type: 'Number', value: m1.value/m2.value}});
var equal = newBinaryOperator('equal', [null,null], bool, function(m1,m2) {
	var eq = m1.type===m2.type && ((m1.type=='Bool' && m1.value===m2.value) || (m1.type=='Number' && m1.value===m2.value));
	return {type: 'Bool', value: eq};
})
var and = newBinaryOperator('and', [bool, bool], bool, function(m1,m2) {
	return {type: 'Bool', value: m1.value&&m2.value};
})
var or = newBinaryOperator('or', [bool, bool], bool, function(m1,m2) {
	return {type: 'Bool', value: m1.value||m2.value};
})
var not = newUnaryOperator('not', [bool], bool, function(m1) {
	return {type: 'Bool', value: !m1.value};
})
var mod = newBinaryOperator('mod', [num,num], num, function(m1,m2) {
	return {type: 'Number', value: m1.value % m2.value};
});

exports.getNativeFunctionDictionary = function() {
	var d = {};
	exports.builtinStatements().forEach(function(st) {
		d[st.expression.nativeFunctionName] = st.expression.bodyNativeFunction;
	})
	return d;
}
