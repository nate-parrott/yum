
exports.tokenize = function(string, tokenDefs) {
	// `tokenDefs` is a name: regex dictionary
	
	var fullRegexMatch = function(regex, string) {
		var match = regex.exec(string);
		return match && match[0] == string;
	}
	
	var tokenThatMatches = function(text) {
		for (var i=0; i<tokenDefs.length; i++) {
			var regex = tokenDefs[i][1];
			if (fullRegexMatch(regex, text)) {
				return tokenDefs[i][0];
			}
		}
		return undefined;
	}
	
	var tokens = [];
	var currentToken = null;
	for (var i=0; i<string.length; i++) {
		if (currentToken && tokenThatMatches(string.substring(currentToken.start, currentToken.end+1))) {
			currentToken.end = i+1;
		} else {
			currentToken = {start: i, end: i+1};
			tokens.push(currentToken);
		}
	}
	// add token names and values to tokens:
	tokens.forEach(function(t) {
		t.text = string.substring(t.start, t.end);
		t.name = tokenThatMatches(t.text);
	});
	return tokens;
}
