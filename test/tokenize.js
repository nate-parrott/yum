var assert = require("assert");

var tokenize = require("../tokenize.js");

describe('tokenize', function() {
	var tokenDefs = [
		['number', /[0-9]+(\.[0-9]*)?/],
		['newline', /\n/],
		['whitespace', /\s+/],
		['texas', /texas/],
		['symbol', /[a-zA-Z_][a-zA-Z0-9_]*/],
	]
	it('should work empty', function() {
		var tokens = tokenize.tokenize("", tokenDefs);
		assert.deepEqual(tokens, []);
	})
	it('should work with a single token', function() {
		var tokens = tokenize.tokenize("123.9", tokenDefs);
		assert.equal(tokens.length, 1);
		assert.equal(tokens[0].name, 'number');
	})
	it('should work with many tokens', function() {
		var tokens = tokenize.tokenize("123 plus2 123 should be 28", tokenDefs);
		var names = tokens.map(function(t){return t.name}).join(" ");
		assert.equal(names, "number whitespace symbol whitespace number whitespace symbol whitespace symbol whitespace number");
	})
	it('should return undefined tokens for each undefined character', function() {
		var tokens = tokenize.tokenize("abc$$123", tokenDefs);
		var names = tokens.map(function(t){return t.name ? t.name : "undefined"}).join(" ");
		assert.equal(names, "symbol undefined undefined number");
	})
	it('should return proper indices', function() {
		var tokens = tokenize.tokenize(" 123 ", tokenDefs);
		assert.equal(tokens.length, 3);
		assert.equal(tokens[1].start, 1);
		assert.equal(tokens[1].end, 4);
	})
	it('should respect priorities', function() {
		var tokens = tokenize.tokenize("texas is number 1", tokenDefs);
		var names = tokens.map(function(t){return t.name}).join(" ");
		assert.equal(names, "texas whitespace symbol whitespace symbol whitespace number");
	})
	it('works with newlines', function() {
		var tokens = tokenize.tokenize("texas\ntexas\n1 2", tokenDefs);
		var names = tokens.map(function(t){return t.name}).join(" ");
		assert.equal(names, "texas newline texas newline number whitespace number");
	})
})
