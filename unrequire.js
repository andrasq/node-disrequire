/**
 * unrequire() from qmock v0.24.0
 *
 * 2018-04-05 - AR.
 */

module.exports = unrequire;
module.exports.resolveOrSelv = resolveOrSelf;

var Path = require('path');

function resolveOrSelf( name, calledFunc ) {
    var moduleName = name;

    // resolve relative paths against the source directory of the calling function
    if (/^[.][/]|^[.][.][/]/.test(moduleName)) {
        var stack = getCallerStack(calledFunc);
        do {
            // search for the first caller with an absolute filepath
            var caller = stack.shift();
            var match = /^[^/]* [(](\/[^()]*):\d+:\d+[)]$/m.exec(caller);
            // note: require parentheses around the filepath, for "  at /some /arbitrary /nodeunit test function name (/unit/test/path.js:12:34)"
            // note: we disallow parentheses inside the filepath, but that could break the mock in some cases
        } while (!match && stack.length > 0);
        var callerDir = !match ? process.cwd() : Path.dirname(match[1]);
        moduleName = callerDir + '/' + moduleName;
    }

// FIXME: if this module is pulled in from a remote directory (ie, ../../../node_modules)
// nodejs will not locate ./node_modules/<module>.  Should maybe search explicitly.

    // make failure to resolve files fatal, else test errors are too hard to find
    // This also sort of how require() behaves.
    if (moduleName[0] === '/') return require.resolve(moduleName);

    // tolerate failure to resolve modules, those error out when loaded
    try { return require.resolve(moduleName) }
    catch (e) { return moduleName }
}

// helper function to unload a module as if it never had been require-d
function unrequire( moduleName ) {
    var path = resolveOrSelf(moduleName, unrequire);
            
    var ix, mod = require.cache[path];
    delete require.cache[path];

    while (module.parent) module = module.parent;
    unlinkAll(module.children, mod);

    function unlinkAll( children, mod ) {
        // node-v6 does not have cycles, node-v8 does
        if (children._qmock_visited) return;
        while ((ix = children.indexOf(mod)) >= 0) {
            children.splice(ix, 1);
        }
        children._qmock_visited = true;
        for (var i=0; i<children.length; i++) {
            unlinkAll(children[i].children, mod);
        }
        delete children._qmock_visited;
    }
}

function getCallerStack( calledFunc ) {
    var trace = {};
    Error.captureStackTrace(trace, calledFunc);
    stack = trace.stack.split('\n');
    stack.shift();
    return stack;
}
