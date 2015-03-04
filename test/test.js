var expect = require('chai').expect;
var sel = require('../dist/sel');

describe('Basic capabilities', function () {
    var evaluator;
    beforeEach(function () {
        evaluator = sel.createDefaultEvaluator();
    });

    it('should return original string if there are no any expressions', function () {
        var res = evaluator.evaluate('some test string');
        expect(res).to.be.equal('some test string');
    });
});

describe('Functions with arguments', function () {
    var evaluator;
    beforeEach(function () {
        evaluator = sel.createDefaultEvaluator();
        evaluator.getContext().registerHandler('upper', function (arg) {
            if (typeof arg != 'string') {
                throw new Error('syntax error');
            }
            return arg.toUpperCase();
        });
    });

    it('should evaluate function with an argument', function () {
        var res = evaluator.evaluate('Result: $upper(test).');
        expect(res).to.be.equal('Result: TEST.');
    });

    it('should evaluate function when an argument is a variable', function () {
        evaluator.getContext().registerValue('myVar', 'SomeVal');
        var res = evaluator.evaluate('Result: $upper($myVar).');
        expect(res).to.be.equal('Result: SOMEVAL.');
    });

    it('should evaluate function when an argument contains variable', function () {
        evaluator.getContext().registerValue('myVar', 'SomeVal');
        var res = evaluator.evaluate('Result: $upper(This is $myVar).');
        expect(res).to.be.equal('Result: THIS IS SOMEVAL.');
    });
});