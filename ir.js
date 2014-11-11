var assert = require('./error.js').assert;

// MARK: Utility functions

var flattenToList = function(item, listType, itemType, ignoreTypes) {
	if (item.name == itemType) {
		return [item];
	} else if (item.name == listType) {
		var items = [];
		item.children.forEach(function(child) {
			items = items.concat(flattenToList(child, listType, itemType, ignoreTypes));
		})
		return items;
	} else if (ignoreTypes !== undefined && ignoreTypes.indexOf(item.name) != -1) {
		return [];
	} else {
		assert(false, "Tried to unwrap item '" + item.name + "' as a list '" + listType + "' of type '" + itemType + "'");
	}
}

var findChild = function(node, name, tolerateMissing) {
	for (var i=0; node.children && i<node.children.length; i++) {
		if (node.children[i].name == name) {
			return node.children[i];
		}
	}
	if (!tolerateMissing) {
		assert(false, "Couldn't find child '" + name + "' in '" + node.name + "'");
	}
	return null;
}

var hasChild = function(node, name) {
	return !!findChild(node, name, true);
}

// MARK: AST -> IR

// each program is an array of statements
var programFromRoot = function(root) {
	assert(root.name == '$root');
	return flattenToList(findChild(root, "$line_list"), "$line_list", "$line", ["$newlines"]).map(statementFromLine);
}

// each statement has an lvalue and an expression
var statementFromLine = function(line) {
	if (hasChild(line, "$assignment")) {
		var asgn = findChild(line, "$assignment");
		return {
			lvalue: lvalueFromDeclaration(findChild(asgn, '$declaration')),
			expression: topLevelExpression(findChild(asgn, '$top_level_expression'))
		}
	} else if (hasChild(line, "$top_level_expression")) {
		return {
			expression: topLevelExpression(findChild(line, "$top_level_expression"))
		};
	} else {
		assert(false, "Unknown kind of statement:\n" + JSON.stringify(line));
	}
}

var lvalueFromDeclaration = function(declaration) {
	var type = null;
	if (hasChild(declaration, "$type")) {
		type = typeFromType(findChild(declaration, "$type"));
	}
	var name = findChild(declaration, "symbol").text;
	return {type: type, name: name};
}

// MARK: Expressions (these all return expression objects)

var topLevelExpression = function(exp) {
	if (hasChild(exp, "$expression")) {
		return expression(findChild(exp, "$expression"));
	} else if (hasChild(exp, "$function_call")) {
		return functionCall(findChild(exp, "$function_call"));
	}
}

var expression = function(exp) {
	if (hasChild(exp, "$parenthesized_expression")) {
		return topLevelExpression(findChild(findChild(exp, "$parenthesized_expression"), "$top_level_expression"));
	} else if (hasChild(exp, "number")) {
		return {type: 'number', value: parseFloat(findChild(exp, "number").text)};
	} else if (hasChild(exp, "symbol")) {
		return {type: 'reference', name: findChild(exp, 'symbol').text};
	} else if (hasChild(exp, "$array_literal")) {
		return arrayLiteral(findChild(exp, "$array_literal"));
	} else if (hasChild(exp, "$function_literal")) {
		return functionLiteral(findChild(exp, "$function_literal"));
	} else if (hasChild(exp, "$bool")) {
		var child = findChild(exp, "$bool");
		return {type: 'bool', value: hasChild(child, "true")};
	} else {
		assert(false, "Unknown expression:\n" + JSON.stringify(exp));
	}
}

var functionLiteral = function(lit) {
	var statements = flattenToList(findChild(lit, "$line_list"), "$line_list", "$line", ["$newlines"]).map(statementFromLine);
	var returnType = hasChild(lit, "$type") ? typeFromType(findChild(lit, "$type")) : null;
	var inputLValues = hasChild(lit, "$declaration_list") ? flattenToList(findChild(lit, "$declaration_list"), "$declaration_list", "$declaration", ["comma"]).map(lvalueFromDeclaration) : [];
	var argTypes = inputLValues.map(function(lv) {return lv.type});
	var argNames = inputLValues.map(function(lv) {return lv.name});
	return {
		type: 'functionLiteral',
		argNames: argNames,
		bodyStatements: statements,
		functionType: {
			functionWithInputTypes: argTypes,
			functionWithOutputType: returnType
		}
	}
}

var arrayLiteral = function(lit) {
	var itemsAsArgs = flattenToList(findChild(lit, '$comma_separated_expression_list'), '$comma_separated_expression_list', "$top_level_expression", ['comma']).map(topLevelExpression).map(function(expr, i) {
		return {name: "$" + i, value: expr};
	});
	return {
		type: 'functionCall',
		functionExpr: {type: 'reference', name: 'List'},
		args: itemsAsArgs
	}
}

var functionCall = function(call) {
	return {
		type: 'functionCall',
		functionExpr: expression(findChild(call, '$expression')),
		args: flattenToList(findChild(call, "$arg_list"), "$arg_list", "$arg").map(argFromArg)
	}
}

// argument objects:
var argFromArg = function(arg, index) {
	var expr = expression(findChild(arg, "$expression"));
	if (hasChild(arg, 'equals')) {
		return {
			name: findChild(arg, 'symbol').text,
			value: expr
		}
	} else {
		return {
			name: "$" + index,
			value: expr
		}
	}
}

// each 'type' is a dictionary (possibly recursive)
var typeFromType = function(type) {
	var child = type.children[0];
	if (child.name == 'symbol') {
		return {name: child.text};
	} else if (child.name == '$function_type') {
		return typeFromFunctionType(child);
	}
}

var typeFromFunctionType = function(functionType) {
	return {
		functionWithInputTypes: findChild(functionType, "$type_list").children.map(typeFromType),
		functionWithOutputType: findChild(functionType, "$type", true) ? typeFromType(findChild(functionType, "$type")) : undefined
	};
}

exports.ir = function(ast) {
	return programFromRoot(ast);
}
