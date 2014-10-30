exports.tokenDefs = [
	['called', /called/],
	['called', /:/],
	['in', /in/],
	['number', /-?[0-9]*(\.[0-9]*)?/],
	['symbol', /[a-zA-Z_][a-zA-Z0-9_-]*/],
	['newline', /\n/],
	['whitespace', /[ \t]+/],
	['lparen', /\(/],
	['rparen', /\)/],
	['lbracket', /\{/],
	['rbracket', /\}/],
	['lsquare', /\[/],
	['rsquare', /\]/],
	['comma', /,/],
	['equals', /=/],
	['yields', /\-\>?/]
]

exports.grammar = [
	['$root', ['$line_list']],

	['$line_list', ["$line", '$newlines', "$line_list"]],	
	['$line_list', ["$line", "$line_list"]],
	['$line_list', ["$newlines", "$line_list"]],
	['$line_list', ['$line']],

	['$line', ['$assignment']],	
	['$line', ['$top_level_expression']],
	
	["$newlines", ["newline", "$newlines"]],
	["$newlines", ["newline"]],
	
	['$assignment', ["$declaration", "equals", "$top_level_expression"]],

	["$declaration", ["$type", "called", "symbol"]],	
	["$declaration", ["symbol"]],
	
	["$type", ["symbol"]],
	["$type", ["$function_type"]],
	
	["$function_type", ["lbracket", "$type_list", "rbracket"]],
	['$function_type', ["lbracket", "$type_list", "yields", "$type", "rbracket"]],
	
	["$top_level_expression", ["$expression"]],
	["$top_level_expression", ["$function_call"]],
	
	["$expression", ["symbol"]],
	["$expression", ["number"]],
	["$expression", ["$parenthesized_expression"]],
	["$expression", ["$array_literal"]],
	["$expression", ["$function_literal"]],
	
	["$parenthesized_expression", ["lparen", "$top_level_expression", "rparen"]],
	
	["$function_call", ["$expression", "$arg_list"]],
	["$arg_list", ["$arg", "$arg_list"]],
	["$arg_list", ["$arg"]],
	
	["$arg", ["symbol", "equals", "$expression"]],
	["$arg", ["$expression"]],
	
	["$array_literal", ["lsquare", "$comma_separated_expression_list", 'rsquare']],
	["$comma_separated_expression_list", ['$top_level_expression', 'comma', '$comma_separated_expression_list']],
	["$comma_separated_expression_list", ['$top_level_expression']],
	
	["$function_literal", ["lbracket", "$declaration_list", 'in', "$line_list", "rbracket"]],
	["$function_literal", ["lbracket", "$declaration_list", 'yields', '$type', 'in', "$line_list", "rbracket"]],
	
	['$declaration_list', ['$declaration', 'comma', '$declaration_list']],
	['$declaration_list', ['$declaration']],

	["$type_list", ["$type", "comma", "$type_list"]],	
	["$type_list", ["$type"]],
]
