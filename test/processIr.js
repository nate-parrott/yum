var assert = require("assert");
var fs = require("fs");

var ast = require("../ast.js");
var ir = require("../ir.js");
var processIr = require("../processIr.js");

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
	it("appears to fail type-checking only when it should", function() {
		assertNoError("Number called n = 2");
		
		assertNoError("List called n = [1]");
		assertError("Number called n = [1]");
		
		assertNoError("Bool called x = TRUE");
		assertError("Number called x = FALSE");
		
		assertNoError("String called x = \"abc def\"");
		assertError("Number called x = \"xyz\"");
		
		assertNoError("{Number -> Number} called n = {Number called n -> Number in n}");
		assertError("Number called n = {Number called n -> Number in n}");
		
		assertNoError("x = [1]");
		assertError("Number called x = [1]");
		
		assertError("xyz 12");
		
		assertNoError(" n = {Number called n -> Number in n}\nn 12");
		assertNoError(" n = {Number called n -> Number in n}\nNumber called n2 = n 12");
		assertError(" n = {Number called n -> Number in n}\nn 12 13");
		assertError(" n = {Number called n -> Number in n}\nList called n2 = n 12");
		
		assertNoError("{Number called n -> Number in 12}")
		assertError("{Number called n -> List in 12}")
	})
	
	it("determines when variable capture is needed", function() {
		var code, result, lastFn;
		
		code = "n = 2\n{n}";
		result = processIr.process(ir.ir(ast.ast(code).result));
		lastFn = result[result.length-1].expression;
		assert.deepEqual(lastFn.captureVars, ["n"]);
		
		code = "n = 2\n{n in n}";
		result = processIr.process(ir.ir(ast.ast(code).result));
		lastFn = result[result.length-1].expression;
		assert.deepEqual(lastFn.captureVars, []);
	})
});
