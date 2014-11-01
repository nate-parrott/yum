exports.defaultScope = function() {
	return {
		key_List: {
			id: "builtinList",
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
}
