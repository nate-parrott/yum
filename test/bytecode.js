var ast = require("../ast.js");
var ir = require("../ir.js");
var processIr = require("../processIr.js");

var code = "double = {Number called x -> Number in multiply x 2}\nsix = double 3\nList called sixes = [six, six, multiply 2 (multiply 3 2)]"
var processed = processIr.process(ir.ir(ast.ast(code).result));
console.log(JSON.stringify(processed))
