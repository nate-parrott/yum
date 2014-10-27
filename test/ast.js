var assert = require("assert");

var ast = require("../ast.js");

describe('ast', function() {
	
	var assertSuccess = function(code) {
		var parsed = ast.ast(code);
		assert(parsed.result != null, "Failed to parse:\n" + code + "\nResult was: \n" + JSON.stringify(parsed));
	}
	
	it('works', function() {
		assertSuccess("a = 123");
		assertSuccess("b=123");
		assertSuccess("c = 12\nd = 13");
	})
});
