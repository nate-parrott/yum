var utils = require('./utils.js');
var shallowCopy = utils.shallowCopy;
var assert = require('assert');
var defaultScope = require('./defaultScope.js');

var offsetOfLabel = function(code, label) {
	for (var i=0; i<code.length; i++) {
		if (code[0] == 'LABEL' && code[1] == label) {
			return i;
		}
	}
	assert(false, "Couldn't find label: " + label);
}

var nativeFunctions = defaultScope.getNativeFunctionDictionary();

var runFunction = function(code, offset, vars) {
	var openFunctionCallCtx = null;
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
			if (closure.type == 'native_function') {
				result = nativeFunctions[closure.name](function(arg_name) { // get_arg function
					return openFunctionCallCtx[arg_name];
				});
			} else {
				assert(false, 'Tried to call un-callable object: ' + closure.type);
			}
			vars[op[2]] = result;
		}
		else {
			assert(false, "Unknown instruction: " + JSON.stringify(op))
		}
		offset++;
	}
}

exports.run = function(code) {
	return runFunction(code, 0, {});
}
