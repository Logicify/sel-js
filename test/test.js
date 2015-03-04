var expect = require('chai').expect;
var sel = require('../src/sel');

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

describe('Logical operations', function () {
    var evaluator;
    beforeEach(function () {
        evaluator = sel.createDefaultEvaluator();
    });

    describe('Disjunction', function() {
        it('should return TRUE if one of the arguments is TRUE', function () {
            var res = evaluator.evaluate('$anyOf(true, false, false)');
            expect(res).to.be.true;
        });

        it('should return TRUE if all arguments are TRUE', function () {
            var res = evaluator.evaluate('$anyOf(true, true, true)');
            expect(res).to.be.true;
        });

        it('should return FALSE if all arguments are FALSE', function () {
            var res = evaluator.evaluate('$anyOf(false, false, false)');
            expect(res).to.be.false;
        });
    });

    describe('Nested expressions', function() {
        it('should work with nested $not expression', function () {
            var res = evaluator.evaluate('$anyOf(false, $not(true), false)');
            expect(res).to.be.false;
        });

        it('should work with 3 level nesting', function () {
            evaluator.getContext().registerValue('myVar', true);
            var res = evaluator.evaluate('$anyOf($not($myVar), $myVar)');
            expect(res).to.be.true;
        });

        it('should work when couple of arguments are expressions', function () {
            var res = evaluator.evaluate('$allOf($not(true), $not(true))');
            expect(res).to.be.false;
        });

        it('should work on complex expressions with multi-level nesting and multiple arguments', function () {
            evaluator.getContext().registerHandler('upper', function (arg) {
                if (typeof arg != 'string') {
                    throw new Error('syntax error');
                }
                return arg.toUpperCase();
            });
            var res = evaluator.evaluate('$anyOf(upper($not($not(false))), $not(false))');
            expect(res).to.be.true;
        });
    });
});