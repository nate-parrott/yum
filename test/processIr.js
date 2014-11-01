var assert = require("assert");
var fs = require("fs");

var ast = require("../ast.js");
var ir = require("../ir.js");
var processIr = require("../processIr.js");

function assertResult(code, result) {
	assert.deepEqual(processIr.process(ir.ir(ast.ast(code).result)), result, "Template:\n" + JSON.stringify(result) + "\nis not equal to result:\n" + JSON.stringify(ir.ir(ast.ast(code).result)));
}

function assertNoError(code) {
	processIr.process(ir.ir(ast.ast(code).result));
}

function assertError(code) {
	var errored = false;
	try {
		processIr.process(ir.ir(ast.ast(code).result));
	}
	catch (e) {
		errored = true;
	}
	assert(errored);
}

describe('processIr', function() {
	it("works", function() {
		assertResult("(1)", [
			{expression: {type: 'number', value: 1}}
		]);
		assertNoError("Number called n = 2");
		
		assertNoError("List called n = [1]");
		assertError("Number called n = [1]");
		
		assertNoError("{Number -> Number} called n = {Number called n -> Number in n}")
		assertError("Number called n = {Number called n -> Number in n}")
	})
});
