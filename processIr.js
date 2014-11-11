/*
this takes the IR and does a few things:
- identifies type conflicts where possible
- determines variables that need to be captured when creating closures
*/

var assert = require('./error.js').assert;
var defaultScope = require('./defaultScope.js');
var utils = require('./utils.js');
var shallowCopy = utils.shallowCopy;
var deepCompare = utils.deepCompare;

var lastAssignedUniqueId = 0;
var uniqueId = function() {
	return lastAssignedUniqueId++;
}

var lookup = function(variable, scope) {
	var key = "key_" + variable; // to avoid collision w/ js object default props
	if (scope[key]) {
		return scope[key];
	}
	return null;
}

var inferExpressionType = function(expr, scope) {
	if (expr.type == 'reference') {
		var res = lookup(expr.name, scope);
		assert(res != null, "Unknown variable '" + expr.name + "'");
		return res.type;
	} else if (expr.type == 'number') {
		return {name: 'Number'};
	} else if (expr.type == 'bool') {
		return {name: 'Bool'};
	} else if (expr.type == 'functionLiteral') {
		return expr.functionType;
	} else if (expr.type == 'functionCall') {
		var fn = inferExpressionType(expr.functionExpr, scope);
		return fn.functionWithOutputType;
	} else {
		assert(false, "Unknown expression type '" + expr.type + "' with\n" + JSON.stringify(expr));
	}
}

var doTypesMatch = function(t1, t2) {
	if (t1 === null || t2 === null) return true;
	if (deepCompare(t1, t2)) return true;
	if (deepCompare(t1, {})) return true;
	if (deepCompare(t2, {})) return true;
	if (t1.functionWithInputTypes && t2.functionWithInputTypes) {
		var shorterFunction = t1.functionWithInputTypes.length < t2.functionWithInputTypes.length ? t1 : t2;
		var longerFunction = t1.functionWithInputTypes.length < t2.functionWithInputTypes.length ? t2 : t1;
		if (!(shorterFunction.functionWithInputTypes.length === longerFunction.functionWithInputTypes.length || shorterFunction.functionWithOverflowArgs)) return false;
		for (var i=0; i<shorterFunction.functionWithInputTypes.length; i++) {
			if (!doTypesMatch(t1.functionWithInputTypes[i], t2.functionWithInputTypes[i])) return false;
		}
		if (!doTypesMatch(t1.functionWithOutputType, t2.functionWithOutputType)) return false;
		return true;
	}
	return false;
}

var assertTypeMatch = function(t1, t2) {
	assert(doTypesMatch(t1, t2), "Types don't match: '" + JSON.stringify(t1) + "' != '" + JSON.stringify(t2) + "'");
}

var processExpression = function(expr, scope, onVariableLookup) {
	expr = shallowCopy(expr);
	if (expr.type == 'functionLiteral') {
		expr.captureVars = [];
		var childScope = shallowCopy(scope);
		for (var i=0; i<expr.argNames.length; i++) {
			childScope["key_" + expr.argNames[i]] = {type: expr.functionType.functionWithInputTypes[i], id: uniqueId()};
		}
		if (expr.bodyStatements) { // builtin fn's may not have body statements
			expr.bodyStatements = processStatements(expr.bodyStatements, childScope, function(varName, resultInChildScope) {
				var resultInParentScope = lookup(varName, scope);
				if (resultInParentScope && resultInParentScope.id === resultInChildScope.id) {
					if (expr.captureVars.indexOf(varName) == -1) expr.captureVars.push(varName);
					onVariableLookup(varName, resultInChildScope);
				}
			});
		}
		var returnTypeInferred = null; // todo: figure out how to represent 'returns nothing' as opposed to 'returns something unknown'
		if (expr.bodyStatements && expr.bodyStatements.length) {
			returnTypeInferred = inferExpressionType(expr.bodyStatements[expr.bodyStatements.length-1].expression, childScope);
		}
		assertTypeMatch(returnTypeInferred, expr.functionType.functionWithOutputType);
	} else if (expr.type == 'functionCall') {
		expr.functionExpr = processExpression(expr.functionExpr, scope, onVariableLookup);
		expr.args = expr.args.map(function(arg) {
			arg = shallowCopy(arg);
			arg.value = processExpression(arg.value, scope, onVariableLookup);
			return arg;
		})
		var calledFunctionType = inferExpressionType(expr.functionExpr, scope);
		assert(!!calledFunctionType.functionWithInputTypes, "Tried to call '" + JSON.stringify(calledFunctionType) + "' as a function, which it isn't");
		assert(expr.args.length == calledFunctionType.functionWithInputTypes.length || (expr.args.length > calledFunctionType.functionWithInputTypes.length && calledFunctionType.functionWithOverflowArgs), "Gave " + expr.args.length + " arguments to function that takes " + calledFunctionType.functionWithInputTypes.length + " arguments");
		for (var i=0; i<calledFunctionType.functionWithInputTypes.length; i++) {
			assertTypeMatch(inferExpressionType(expr.args[i].value, scope), calledFunctionType.functionWithInputTypes[i]);
		}
	} else if (expr.type == 'reference') {
		onVariableLookup(expr.name, lookup(expr.name, scope));
	}
	return expr;
}

/*
the onVariableLookup callback is used to determine which variables
a closure needs to capture from the outer scope.
it's called with 2 args: name of var, and the result of the lookup in the child scope.
if this matches the result of the lookup in the parent scope (by comparing ids), capture is needed.
*/

var processStatements = function(statements, scope, onVariableLookup) {
	scope = shallowCopy(scope);
	return statements.map(function(statement) {
		statement = shallowCopy(statement);
		statement.expression = processExpression(statement.expression, scope, onVariableLookup);
		if (statement.lvalue) {
			assertTypeMatch(statement.lvalue.type, inferExpressionType(statement.expression, scope));
			scope = shallowCopy(scope);
			scope["key_" + statement.lvalue.name] = {type: inferExpressionType(statement.expression, scope), id: uniqueId()};
		}
		return statement;
	});
}

exports.process = function(rootStatements) {
	return processStatements(defaultScope.builtinStatements().concat(rootStatements), {}, function() {});
}
