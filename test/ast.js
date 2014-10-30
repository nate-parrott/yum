var assert = require("assert");

var ast = require("../ast.js");
var parse = require('../parse.js');

describe('ast', function() {
	
	var assertSuccess = function(code) {
		var parsed = ast.ast(code);
		assert(parsed.result != null, "Failed to parse:\n" + code + "\nResult was: \n" + parse.printError(parsed.error));
	}
	
	it('works', function() {
		assertSuccess("a = 123");
		assertSuccess("b=123");
		assertSuccess("c = 12\nd = 13");
		assertSuccess("c = 12\nd = 13\ne = 14");
		assertSuccess("Number called sum = add 7 3")
		assertSuccess("List called onetwothree = [1,2,3]");
		assertSuccess("Number called sum = add 7 [1,2,3]");
		assertSuccess("Number called sum = add [1,2, 3] 7");
		assertSuccess("(v)")
		assertSuccess("x [1,2,3] b")
		assertSuccess("(x 1)")
		assertSuccess("(x 1 2)")
		assertSuccess("n = x 1 2")
		assertSuccess("n = (x 1 2)")
		assertSuccess("{Number -> Number} called n = the_function")
		assertSuccess("{Number called n -> Number in multiply 2 n}")
		assertSuccess("{Number -> Number} called double = {Number called n -> Number in multiply 2 n}")
		assertSuccess("{Number -> Number} called double = {Number called n -> Number in multiply 2 n}\n {Number -> Number} called double = {Number called n -> Number in multiply 2 n}")
		assertSuccess(" six = concat_lists (range 4 6) [1, 2, 3]")
		assertSuccess(" six = concat_lists [1, 2, 3] (range 4 6)")
		assertSuccess("List called six = concat_lists [1, 2, 3] (range 4 6)")
		
		// console.log(JSON.stringify(ast.ast("{Number -> Number} called double = {Number called n -> Number in multiply 2 n}")))
		// console.log(JSON.stringify(ast.ast("abc = function 1 2 [3,4,5]")))
	})
});
