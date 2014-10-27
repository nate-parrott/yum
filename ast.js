var grammar = require('./grammar');
var tokenize = require('./tokenize');
var parse = require('./parse');

exports.ast = function(string) {
	var tokens = tokenize.tokenize(string, grammar.tokenDefs);
	var parsed = parse.parse(tokens, grammar.grammar);
	return parsed;
}
