exports.tokenDefs = [
	['called', /called/],
	['called', /:/],
	['in', /in/],
	['number', /-?[0-9]*(\.[0-9]*)?/],
	['symbol', /[a-zA-Z_][a-zA-Z0-9_-]*/],
	['whitespace', /\s+/],
	['lparen', /\(/],
	['rparen', /\)/],
	['lbracket', /\{/],
	['rbracket', /\}/],
	['lsquare', /\[/],
	['rsquare', /\]/],
	['newline', /\n/],
	['comma', /,/],
	['equals', /=/],
	['yields', /\-\>?/]
]

exports.grammar = [
	['$root', ['$statement_list']],
	
	['$statement_list', ['$statement']],
	['$statement_list', ["$statement_list", 'newline', "$statement_list"]],
	
	['$statement', ['$assignment']],
	
	['$assignment', ["$definition", "equals", "$expression"]],
	
	["$definition", ["symbol"]],
	["$definition", ["$type", "called", "symbol"]],
	
	["$type", ["$symbol"]],
	["$type", ["$function_type"]],
	
	["$expression", ["symbol"]],
	["$expression", ["number"]],
	["$expression", ["$function_call"]],
	["$expression", ["$parenthesized_expression"]],
	["$expression", ["$array_literal"]],
	["$expression", ["$function_literal"]],
	
	["$parenthesized_expression", ["lparen", "$expression", "rparen"]],
	
	["$function_call", ["$expression", "$arg_list"]],
	["$arg_list", ["$arg"]],
	["$arg_list", ["$arg_list", "$arg_list"]],
	
	["$arg", ["$expression"]],
	["$arg", ["$symbol", "equals", "$expression"]],
	
	["$array_literal", ["lsquare", "$comma_separated_expression_list", 'rsquare']],
	["$comma_separated_expression_list", ['$expression']],
	["$comma_separated_expression_list", ['$comma_separated_expression_list', 'comma', '$comma_separated_expression_list']],
	
	["$function_literal", ["lbracket", "$function_type", 'in', "$statement_list", "rbracket"]],
	["$function_literal", ["lbracket", "$function_type", 'in', "newline", "$statement_list", "rbracket"]],
	
	["$function_type", ["$type_list"]],
	["$function_type", ["$type_list", 'yields', "$type"]],
	
	["$type_list", ["$type"]],
	["$type_list", ["$type_list", "comma", "$type_list"]]
]
