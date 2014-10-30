
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
		var childParsings = [];
		var childErrors = [];
		
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
						childErrors.push(child.error);
						break;
					}
				}
				if (children.length == childSymbols.length) {
					childParsings.push({result: {name: resultSymbol, children: children}, remaining: remainingTokens});
				}
			}
		}
		if (childParsings.length) {
			var longest = childParsings[0];
			childParsings.forEach(function(p) {
				if (p.remaining.length < longest.remaining.length) {
					longest = p;
				}
			})
			return longest;
		} else {
			var error;
			if (childErrors.length) {
				error = {triedParsingAs: resultSymbol, children: childErrors};
			} else {
				error = {expected: resultSymbol, got: tokens[0], inPattern: resultSymbol, children: []};
			}
			return {result: null, error: error};
		}
	}
	
	var result = ll(tokens, "$root");
	if (result.remaining && result.remaining.length) {
		return {result: null, error: {expected: "end", got: result.remaining[0]}};
	} else {
		return result;
	}
}

exports.printError = function(error) {
	var getErrorLinesRecursively = function(e, depth) {
		var line = "";
		for (var i=0; i<depth; i++) line += "  ";
		line += depth.toString();
		line += JSON.stringify({expected: e.expected, got: e.got, triedParsingAs: e.triedParsingAs, inPattern: e.inPattern});
		var lines = [line];
		if (e.children) {
			e.children.forEach(function(child) {
				lines = lines.concat(getErrorLinesRecursively(child, depth+1));
			});
		}
		return lines;
	}
	if (error) {
		return getErrorLinesRecursively(error, 0).join("\n");
	} else {
		return "(no error)";
	}
}
