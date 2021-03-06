/*
 * SEL Simple Expression Language
 *
 * P.S. Thanks Lo-Dash team for module exposing solution
 *
 * */
(function () {

    /*--------------------------------------------------------------------------*/
    /** Used as a reference to the global object */
    var root = (typeof window == 'object' && window) || this;

    /** Detect free variable `exports` */
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module` */
    var freeModule = typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports` */
    var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

    /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
    var freeGlobal = typeof global == 'object' && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
        root = freeGlobal;
    }
    /*--------------------------------------------------------------------------*/

    function Context() {
        var self = this;
        var handlers = {};

        self.registerHandler = function (name, handler) {
            handlers[name] = handler;
            return self;
        };

        self.registerValue = function (name, value) {
            var handler = function () {
                return value
            };
            handlers[name] = handler;
            return self;
        };
        self.unregisterHandler = function (name) {
            delete handlers[name];
            return self;
        };

        self.getHandlers = function () {
            return handlers;
        };

        self.getHandlerByName = function (name) {
            if (!handlers.hasOwnProperty(name)) {
                throw new Error('SEL: unknown handler');
            }
            return handlers[name];
        };

        self.inherit = function (context) {
            var parentHandlers = context.getHandlers();
            for (var name in parentHandlers) {
                if (!handlers.hasOwnProperty(name)) {
                    handlers[name] = parentHandlers[name];
                }
            }
        }
    }

    function Evaluator() {
        var self = this;
        var EXPRESSION_REGEX = /\$(\w[\d\w]*)(\((.*)?\))?/;
        var RECURSION_LIMIT = 15;

        var globalContext = new Context();

        self.getContext = function () {
            return globalContext;
        };

        self.evaluate = function (expression, context) {
            return evaluate(expression, context, 0)
        };

        function evaluate(expression, localContext, recursionLevel) {
            if (typeof expression != 'string') return expression;

            if (recursionLevel >= RECURSION_LIMIT) {
                throw new Error('SEL: Recursion limit reached');
            }

            if (!localContext) {
                localContext = globalContext;
            } else {
                localContext.inherit(globalContext)
            }

            var result = expression;
            var match = EXPRESSION_REGEX.exec(expression);

            function cutUnbalanced(exp) {
                var stack = [];
                for (var i = 0; i < exp.length; i++) {
                    if (exp.charAt(i) == '(') {
                        stack.push(i);
                    } else if (exp.charAt(i) == ')') {
                        if (typeof stack.pop() == 'undefined') {
                            return exp.substring(0,i);
                        } else if(stack.length == 0){
                            return exp.substring(0, i + 1);
                        }
                    }
                }
                return exp;
            }

            while (match) {
                var expressionValue = null;
                var balanced = cutUnbalanced(match[0]);
                if (balanced != match[0]) {
                    match = EXPRESSION_REGEX.exec(balanced);
                }
                var fullMatch = match[0];
                var name = match[1];
                var isFunc = (match[2] != undefined);
                var arg = match[3];

                var handler = localContext.getHandlerByName(name);
                var argument = null;
                if (isFunc) {
                    // Apply interpolation to the argument
                    argument = evaluate(arg, localContext, recursionLevel + 1);
                }
                try {
                    expressionValue = handler.call(self, argument, localContext)
                } catch (e) {
                    throw new Error('SEL: Evaluation error');
                }

                if (typeof result == "string" && result.length == fullMatch.length) {
                    result = expressionValue;
                    break;
                }
                else if (typeof result == "string") {
                    result = result.replace(fullMatch, expressionValue || "");
                    match = EXPRESSION_REGEX.exec(result);
                }
                else {
                    result = expressionValue;
                    break;
                }
            }

            return result;
        }
    }

    function populateContextByDefaultHandlers(context) {
        context.registerHandler('anyOf', function (argString) {
            argString = argString.toLowerCase();
            var args = argString.split(',');
            for (var i = 0; i < args.length; i++) {
                if (args[i].trim() == 'true') {
                    return true;
                }
            }
            return false;
        });
        context.registerHandler('allOf', function (argString) {
            argString = argString.toLowerCase();
            var args = argString.split(',');
            for (var i = 0; i < args.length; i++) {
                if (args[i].trim() != "true") {
                    return false;
                }
            }
            return true;
        });

        context.registerHandler('not', function (argString) {
            argString = argString.toString().toLowerCase();
            var args = argString.split(',');
            if (args.length > 1) {
                throw new Error('SEL: not handler accepts only one argument')
            }
            var arg = args[0].trim();
            return !(arg == 'true');
        });

        return context;
    }

    /*--------------------------------------------------------------------------*/
    // expose SEL
    var sel = {
        createContext: function () {
            return new Context();
        },
        createEvaluator: function () {
            return new Evaluator();
        },
        createDefaultContext: function () {
            return populateContextByDefaultHandlers(new Context());
        },
        createDefaultEvaluator: function () {
            var evaluator = new Evaluator();
            populateContextByDefaultHandlers(evaluator.getContext());
            return evaluator;
        }
    };

    // some AMD build optimizers like r.js check for condition patterns like the following:
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        // Expose SEL to the global object even when an AMD loader is present in
        // case SEL is loaded with a RequireJS shim config.
        // See http://requirejs.org/docs/api.html#config-shim
        root.sel = sel;

        // define as an anonymous module so, through path mapping, it can be
        // referenced as the "underscore" module
        define(function () {
            return sel;
        });
    }
    // check for `exports` after `define` in case a build optimizer adds an `exports` object
    else if (freeExports && freeModule) {
        // in Node.js or RingoJS
        if (moduleExports) {
            (freeModule.exports = sel).sel = sel;
        }
        // in Narwhal or Rhino -require
        else {
            freeExports.sel = sel;
        }
    }
    else {
        // in a browser or Rhino
        root.sel = sel;
    }
    /*--------------------------------------------------------------------------*/
}.call(this));