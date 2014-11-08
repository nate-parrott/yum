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
				bodyNativeFunction: function(args, extraArgs) {
				
				},
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
				bodyNativeFunction: function(args, extraArgs) {
				
				},
				functionType: {
					functionWithInputTypes: [{name: "Number"}, {name: "Number"}],
					functionWithOutputType: {name: "Number"}
				}
			}
}		
