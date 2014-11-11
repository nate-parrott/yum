var assert = require("assert");
var fs = require("fs");

var ast = require("../ast.js");
var ir = require("../ir.js");

function assertResult(code, result) {
	assert.deepEqual(ir.ir(ast.ast(code).result), result, "Template:\n" + JSON.stringify(result) + "\nis not equal to result:\n" + JSON.stringify(ir.ir(ast.ast(code).result)));
}

function assertNoFailure(code) {
	assert(ir.ir(ast.ast(code).result) !== null, "Failed to generate IR for code:\n", code);
}

describe('ir', function() {
	it("works", function() {
		assertResult("1", [
			{expression: {type: 'number', value: 1}}
		]);
		assertResult("(1)", [
			{expression: {type: 'number', value: 1}}
		]);
		assertResult("a = 1.23", [
		{expression: {type: 'number', value: 1.23}, lvalue: {type: null, name: 'a'}}
		])
		assertResult("1\n2\n\n3", [
		{expression: {type: 'number', value: 1}},
		{expression: {type: 'number', value: 2}},
		{expression: {type: 'number', value: 3}},
		])
		assertResult("Number called n = a_number", [
		{expression: {type: 'reference', name: 'a_number'}, lvalue: {name: 'n', type: {name: 'Number'}}}
		])
		assertResult("x = fun 1 2", [
		{lvalue: {name: 'x', type: null}, expression: {type: 'functionCall', functionExpr: {type: 'reference', name: 'fun'}, args: [{name: "$0", value: {type: 'number', value: 1}}, {name: "$1", value: {type: 'number', value: 2}}]}}
		])
		assertResult("abc = ([1,2])",[
		{lvalue: {name: 'abc', type: null}, expression: {
			type: 'functionCall', 
			functionExpr: {type: 'reference', name: 'List'},
			args:[
				{name: "$0", value: {type: 'number', value: 1}},
				{name: "$1", value: {type: 'number', value: 2}}
				]
			}}
		])
		assertResult("fn = {Number called n -> Number in\n double n}", [
		{lvalue: {name: 'fn', type: null}, expression: {
				type: 'functionLiteral', 
				argNames: ["n"], 
				bodyStatements:
					[{expression: {type: 'functionCall', functionExpr: {type: 'reference', name: 'double'}, args: [{name: "$0", value: {type: 'reference', name: 'n'}}]}}],
				functionType: {
					functionWithInputTypes: [{name: "Number"}],
					functionWithOutputType: {name: "Number"}
				}
			}}
		])
		assertResult("fn = {n -> Number in\n double n}", [
		{lvalue: {name: 'fn', type: null}, expression: {
				type: 'functionLiteral', 
				argNames: ["n"], 
				bodyStatements:
					[{expression: {type: 'functionCall', functionExpr: {type: 'reference', name: 'double'}, args: [{name: "$0", value: {type: 'reference', name: 'n'}}]}}],
				functionType: {
					functionWithInputTypes: [null],
					functionWithOutputType: {name: "Number"}
				}
			}}
		])
		assertResult("fn = {n in\n double n}", [
		{lvalue: {name: 'fn', type: null}, expression: {
				type: 'functionLiteral', 
				argNames: ["n"], 
				bodyStatements:
					[{expression: {type: 'functionCall', functionExpr: {type: 'reference', name: 'double'}, args: [{name: "$0", value: {type: 'reference', name: 'n'}}]}}],
				functionType: {
					functionWithInputTypes: [null],
					functionWithOutputType: null
				}
			}}
		])
		assertResult("fn = {n,x in\n double n}", [
		{lvalue: {name: 'fn', type: null}, expression: {
				type: 'functionLiteral', 
				argNames: ["n", "x"], 
				bodyStatements:
					[{expression: {type: 'functionCall', functionExpr: {type: 'reference', name: 'double'}, args: [{name: "$0", value: {type: 'reference', name: 'n'}}]}}],
				functionType: {
					functionWithInputTypes: [null, null],
					functionWithOutputType: null
				}
			}}
		])
		assertResult("fn = {double n}", [
		{lvalue: {name: 'fn', type: null}, expression: {
				type: 'functionLiteral', 
				argNames: [], 
				bodyStatements:
					[{expression: {type: 'functionCall', functionExpr: {type: 'reference', name: 'double'}, args: [{name: "$0", value: {type: 'reference', name: 'n'}}]}}],
				functionType: {
					functionWithInputTypes: [],
					functionWithOutputType: null
				}
			}}
		])
		
		
		
		
	})
});
