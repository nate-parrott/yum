var ast = require("../ast.js");
var ir = require("../ir.js");
var processIr = require("../processIr.js");
var bytecode = require("../bytecode.js");
var run = require('../run.js');
var assert = require('assert');

var assertCodeResult = function(code, expectedResult) {
	var processed = processIr.process(ir.ir(ast.ast(code).result));;
	var generatedBytecode = bytecode.generateBytecode(processed);
	// console.log(JSON.stringify(generatedBytecode))
	var result = run.run(generatedBytecode);
	assert.deepEqual(result, expectedResult);
}

describe('bytecode generation and execution', function() {
	it("works w/ simple assignment and return", function() {
		assertCodeResult("x=5\nx", {type: 'Number', value: 5});
	});
	
	it("works w/ function calls", function() {
		assertCodeResult("multiply 2 3", {type: 'Number', value: 6});
	});
	
	it("works w/ nested function calls", function() {
		assertCodeResult("multiply 2 (multiply 4 5)", {type: 'Number', value: 40});
	});
	
	it("works w/ closures", function() {
		assertCodeResult("triple = {n in multiply n 3}\ntriple 4", {type: 'Number', value: 12});
	});
	
	it("works w/ more closures", function() {
		assertCodeResult("add_and_double = {x, y in multiply 2 (add x y)}\nadd_and_double 2 3", {type: 'Number', value: 10});
	});
	
	it("works w/ booleans", function() {
		assertCodeResult("t = TRUE\nt", {type: 'Bool', value: true});
		assertCodeResult("t = FALSE\nt", {type: 'Bool', value: false});
	});
	
});
