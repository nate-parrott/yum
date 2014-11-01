exports.builtinStatements = function() {
	return [
		{
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
	]
}
