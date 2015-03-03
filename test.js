var sel = require('./src/sel');

var evaluator = sel.getDefaultEvaluator();
var context = sel.getContext();

context.registerValue('firstVar', 'hello');
context.registerValue('secondVar', 'word');
context.registerHandler('toUpper', function (arg) {
    if (typeof arg != 'string') {
        throw new Error('syntax error');
    }
    return arg.toUpperCase();
});


console.log(evaluator.evaluate('$firstVar $toUpper($secondVar)', context));

console.log(evaluator.evaluate('$anyOf($not($not(true)), false)', context));
console.log(evaluator.evaluate('$anyOf(false, $toUpper(false))', context));
console.log(evaluator.evaluate('$anyOf(false, false, TRUE)', context));
console.log(evaluator.evaluate('$anyOf(true, true, )', context));

console.log(evaluator.evaluate('$allOf(true, false)', context));
console.log(evaluator.evaluate('$allOf(false, $toUpper(false))', context));
console.log(evaluator.evaluate('$allOf(false, false, TRUE)', context));
console.log(evaluator.evaluate('$allOf($not(true), $not(true))', context));
console.log(evaluator.evaluate('$anyOf(toUpper($not($not(false))), $not(false))', context));