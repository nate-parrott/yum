var assert = require("assert");

var parse = require("../parse.js");
var tokenize = require("../tokenize.js");

describe('parse', function() {
	var tokenDefs = [
		['number', /[0-9]+(\.[0-9]*)?/],
		['whitespace', /\s+/],
		['symbol', /[a-zA-Z_][a-zA-Z0-9_]*/],
		['lparen', /\(/],
		['rparen', /\)/],
		['comma', /,/]
	]
	var grammar = [
		["$root", ["$expr"]],
		["$expr", ["number"]],
		["$expr", ["$parens"]],
		
		["$parens", ["lparen", "$expr", "rparen"]],

		["$list", ["symbol", "$list"]],		
		["$list", ["symbol"]],
		["$root", ["$list"]]
	];
	
	var doesParseTreeHaveStructure = function(tree, structure) {
		if (tree.name != structure.name) return false;
		if (structure.children) {
			if (!tree.children || structure.children.length != tree.children.length) {
				return false;
			}
			for (var i=0; i<tree.children.length; i++) {
				if (!doesParseTreeHaveStructure(tree.children[i], structure.children[i])) {
					return false;
				}
			}
		}
		return true;
	}
	
	var assertParsedStringHasStructure = function(string, structure) {
		var parseTree = parse.parse(tokenize.tokenize(string, tokenDefs), grammar);
		assert(parseTree.result);
		assert(doesParseTreeHaveStructure(parseTree.result, structure), JSON.stringify({expected: structure, got: parseTree.result}));
	}
	
	it("should work with a single expr", function() {
		assertParsedStringHasStructure("1", {name: "$root", children: [{name: "$expr", children: [{name: "number"}]}]});
	})
	
	it("should ignore whitespace", function() {
		assertParsedStringHasStructure(" 1 ", {name: "$root", children: [{name: "$expr", children: [{name: "number"}]}]});
	})
	
	it("should work with a parenthesized expr", function() {
		assertParsedStringHasStructure("(1)", {name: "$root", children: [{name: "$expr", children: [{name: "$parens", children: [{name: "lparen"}, {name: "$expr", children: [{name: "number"}]}, {name: "rparen"}]}]}]});
	})
	
	// the error format has been changed
	/*it("should return parsing errors", function() {
		var res = parse.parse(tokenize.tokenize("(1 2)", tokenDefs), grammar);
		assert.equal(res.result, null);
		assert(["rparen", "comma"].indexOf(res.error.expected) != -1);
		assert.equal(res.error.got.name, "number");
		assert.equal(res.error.got.start, 3);
	});*/
	
	it("should work for using recursive grammars to define lists", function() {
		assertParsedStringHasStructure("a b", {name: "$root", children: [{name: "$list", children: [{name: "symbol"}, {name: "$list", children: [{name: 'symbol'}]}]}]});
	});
})
