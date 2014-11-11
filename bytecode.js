var processIr = require('./processIr.js');
var utils = require('./utils.js');
var shallowCopy = utils.shallowCopy;
var assert = require('assert');

var lastAssignedUniqueId = 1;
var uniqueId = function(hint) {
	if (hint) {
		return lastAssignedUniqueId++ + "("+hint+")"
	} else {
		return lastAssignedUniqueId++ + "";
	}
}

var generateBytecodeForExpressionAndReturnRegisterContainingResult = function(expr, program, currentFunction, scope) {
	if (expr.type == 'number') {
		var retId = uniqueId(expr.value);
		currentFunction.push(["NUMBER", parseFloat(expr.value), retId]);
		return retId;
	} else if (expr.type == 'reference') {
		return scope['var_' + expr.name];
	} else if (expr.type == 'functionLiteral') {
		var retId = uniqueId("closure");
		if (expr.bodyStatements) {
			var functionBody = [];
			var bodyIndex = program.functions.length;
			program.functions.push(functionBody);
			var childScope = shallowCopy(scope);
			expr.argNames.forEach(function(name) {
				var id = uniqueId(name);
				childScope['var_' + name] = id;
				functionBody.push(["READ_ARG", name, id]);
			});
			generateBytecode(expr.bodyStatements, program, functionBody, childScope);
			currentFunction.push(["CREATE_CLOSURE", bodyIndex, retId]);
			expr.captureVars.forEach(function(name) {
				currentFunction.push(["CAPTURE_VAR", scope['var_' + name]]);
			})
			currentFunction.push(["END_CLOSURE"]);
		} else {
			currentFunction.push(["CREATE_NATIVE_FUNCTION", expr.nativeFunctionName, retId]);
		}
		return retId;
	} else if (expr.type == 'functionCall') {
		var retId = uniqueId("function result");
		var closureReg = generateBytecodeForExpressionAndReturnRegisterContainingResult(expr.functionExpr, program, currentFunction, scope);
		var argRegisters = [];
		var argNames = [];
		expr.args.forEach(function(arg) {
			argRegisters.push(generateBytecodeForExpressionAndReturnRegisterContainingResult(arg.value, program, currentFunction, scope));
			argNames.push(arg.name);
		});
		currentFunction.push(["START_CALL"]);
		argRegisters.forEach(function(reg, i) {
			var name = argNames[i];
			currentFunction.push(["ARG", reg, name]);
		});
		currentFunction.push(["CALL_CLOSURE", closureReg, retId]);
		return retId;
	}
	assert(false, "Not sure what to do with expression: " + JSON.stringify(expr));
}

var generateBytecode = function(statements, program, currentFunction, scope) {
	statements.forEach(function(statement, i) {
		var resultRegister = generateBytecodeForExpressionAndReturnRegisterContainingResult(statement.expression, program, currentFunction, scope);
		if (statement.lvalue) {
			scope = shallowCopy(scope);
			if (!scope['var_'+statement.lvalue.name]) {
				scope['var_'+statement.lvalue.name] = uniqueId(statement.lvalue.name);
			}
			currentFunction.push(["COPY", resultRegister, scope['var_'+statement.lvalue.name]]);
		}
		if (i == statements.length-1) {
			currentFunction.push(["RETURN", resultRegister]);
		}
	})
}

var linearizeProgram = function(program) {
	var code = [];
	program.functions.forEach(function(fn, i) {
		code.push(["LABEL", i]);
		code = code.concat(fn);
	});
	return code;
}

exports.generateBytecode = function(rootStatements) {
	var program = {};
	var currentFunction = [];
	program.functions = [currentFunction];
	generateBytecode(rootStatements, program, currentFunction, {});
	return linearizeProgram(program);
}
