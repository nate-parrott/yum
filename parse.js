
exports.parse = function(tokens, grammar) {
	// grammars are given as arrays of rules
	// each rule is in the form ['$result', ['$child', '$another_child', 'token']]
	
	// strip whitespace:
	tokens = tokens.filter(function(token) {
		return token.name != 'whitespace';
	});
	
	var rules = {};
	grammar.forEach(function(rule) {
		var ruleResult = rule[0];
		var ruleItems = rule[1];
		if (rules[ruleResult]) {
			rules[ruleResult].push(ruleItems);
		} else {
			rules[ruleResult] = [ruleItems];
		}
	})
	
	var ll = function(tokens, resultSymbol) {	
		var childError = null;
		
		if (tokens[0].name == resultSymbol) {
			return {result: tokens[0], remaining: tokens.slice(1)};
		} else if (rules[resultSymbol]) {
			var possibleRules = rules[resultSymbol];
			for (var i=0; i<possibleRules.length; i++) {
				var childSymbols = possibleRules[i];
				var children = [];
				var remainingTokens = tokens;
				for (var j=0; j<childSymbols.length && remainingTokens.length > 0; j++) {
					var child = ll(remainingTokens, childSymbols[j]);
					if (child.result) {
						children.push(child.result);
						remainingTokens = child.remaining;
					} else {
						if (!childError || child.error.depth > childError.depth) {
							childError = child.error;
						}
						break;
					}
				}
				if (children.length == childSymbols.length) {
					return {result: {name: resultSymbol, children: children}, remaining: remainingTokens};
				}
			}
		}
		var error = childError ? childError : {expected: resultSymbol, got: tokens[0], depth: 0};
		error.depth++; // TODO: don't mutate the original error. it shouldn't matter for now but it's shitty
		return {result: null, error: error};
	}
	
	var result = ll(tokens, "$root");
	if (result.remaining && result.remaining.length) {
		return {result: null, error: {expected: "end", got: result.remaining[0]}};
	} else {
		return result;
	}
}
