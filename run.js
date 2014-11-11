var utils = require('./utils.js');
var shallowCopy = utils.shallowCopy;
var assert = require('assert');
var defaultScope = require('./defaultScope.js');

var offsetOfLabel = function(code, label) {
	for (var i=0; i<code.length; i++) {
		if (code[i][0] == 'LABEL' && code[i][1] == label) {
			return i;
		}
	}
	assert(false, "Couldn't find label: " + label);
}

var nativeFunctions = defaultScope.getNativeFunctionDictionary();

var runFunction = function(code, offset, vars, getArgByName) {
	var currentPositionalArg = 0;
	var openFunctionCallCtx = null;
	var buildingClosureCtx = null;
	while (1) {
		assert(offset < code.length, "overran end of code");
		var op = code[offset];
		var opcode = op[0];
		if (opcode == 'LABEL') {
			// ignore
		} else if (opcode == 'NUMBER') {
			vars = shallowCopy(vars);
			vars[op[2]] = {type: 'number', value: op[1]};
		} else if (opcode == 'COPY') {
			vars = shallowCopy(vars);
			vars[op[2]] = vars[op[1]];
		} else if (opcode == 'CREATE_NATIVE_FUNCTION') {
			vars = shallowCopy(vars);
			vars[op[2]] = {type: 'native_function', name: op[1]};
		} else if (opcode == 'RETURN') {
			return vars[op[1]];
		} else if (opcode == 'START_CALL') {
			openFunctionCallCtx = {};
		} else if (opcode == 'ARG') {
			assert(openFunctionCallCtx != null, "Can't call ARG outside of a START_CALL-CALL_CLOSURE block");
			openFunctionCallCtx[op[2]] = vars[op[1]];
		} else if (opcode == 'CALL_CLOSURE') {
			assert(openFunctionCallCtx != null, "CALL_CLOSURE must be matched with a prior START_CALL block");
			vars = shallowCopy(vars);
			var closure = vars[op[1]];
			var result;
			var getChildArgByName = function(arg_name) {
				return openFunctionCallCtx[arg_name];
			};
			if (closure.type == 'native_function') {
				result = nativeFunctions[closure.name](getChildArgByName);
			} else if (closure.type == 'closure') {
				var childVars = shallowCopy(vars);
				closure.capture_vars.forEach(function(cap) {
					childVars[cap[0]] = cap[1];
				});
				result = runFunction(code, offsetOfLabel(code, closure.label), childVars, getChildArgByName);
			} else {
				assert(false, 'Tried to call un-callable object: ' + closure.type);
			}
			vars[op[2]] = result;
			openFunctionCallCtx = null;
		} else if (opcode == 'CREATE_CLOSURE') {
			vars = shallowCopy(vars);
			buildingClosureCtx = {capture_vars: [], type: 'closure', label: op[1]};
			vars[op[2]] = buildingClosureCtx;
		} else if (opcode == 'CAPTURE_VAR') {
			assert(buildingClosureCtx != null, "Can't call CAPTURE_VAR outside of a CREATE_CLOSURE-END_CLOSURE block");
			buildingClosureCtx.capture_vars.push([op[1], vars[op[1]]]);
		} else if (opcode == 'END_CLOSURE') {
			assert(buildingClosureCtx != null, "END_CLOSURE must be matched with a prior CREATE_CLOSURE block");
			buildingClosureCtx = null;
		} else if (opcode == 'READ_ARG') {
			vars = shallowCopy(vars);
			var val = getArgByName(op[1]) || getArgByName("$" + (currentPositionalArg++));
			assert(val!==undefined, "Couldn't find arg: " + op[1]);
			vars[op[2]] = val;
		} else {
			assert(false, "Unknown instruction: " + JSON.stringify(op))
		}
		offset++;
	}
}

exports.run = function(code) {
	return runFunction(code, 0, {}, function(_) {assert(false, "You can't read arguments inside the top-level function")});
}
