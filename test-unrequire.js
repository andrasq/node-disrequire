/**
 * test-mockRequire from qmock v0.13.1
 *
 * Copyright (C) 2018 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var fs = require('fs');
var unrequire = require('./');
var mockRequire = { unrequire: unrequire };

module.exports = {
    before: function(done) {
        // create the mock module the tests look for
        try { fs.mkdirSync('node_modules') } catch (e) {}
        fs.mkdirSync('node_modules/mockmod');
        fs.writeFileSync('node_modules/mockmod/package.json', '{\n  "name": "mockmod"\n}\n');
        fs.writeFileSync('node_modules/mockmod/index.js', 'module.exports = "mock module";');
        done();
    },

    after: function(done) {
        fs.unlinkSync('node_modules/mockmod/index.js');
        fs.unlinkSync('node_modules/mockmod/package.json');
        fs.rmdirSync('node_modules/mockmod');
        fs.rmdirSync('node_modules');
        done();
    },

    'should export expected functions': function(t) {
        t.equal(typeof unrequire, 'function');
        t.equal(typeof unrequire.resolveOrSelf, 'function');
        t.equal(typeof unrequire.findCallingFile, 'function');
        t.done();
    },

    'should remove all instances of the module': function(t) {
        var url = require('./package');
        var mod = findCachedModule('./package');
        mockRequire.unrequire('./package');
        var mod2 = findCachedModule('./package');
        t.equal(mod.exports, url);
        t.equal(mod2, undefined);
        t.done();
    },

    'should remove module when called as a function': function(t) {
        var unrequire2 = mockRequire.unrequire;
        require('./package');
        t.notEqual(findCachedModule('./package'), null);
        unrequire2('./package');
        t.equal(findCachedModule('./package'), null);
        t.done();
    },

    'should remove module when attached to another object': function(t) {
        var unrequire3 = { unrequire: mockRequire.unrequire };
        require('./package');
        t.notEqual(findCachedModule('./package'), null);
        unrequire3.unrequire('./package');
        t.equal(findCachedModule('./package'), null);
        t.done();
    },

    'should remove module by absolute filepath': function(t) {
        require('./package');
        t.ok(findCachedModule('./package'));
        mockRequire.unrequire(require.resolve('./package'));
        t.ok(!findCachedModule('./package'));

        require('./node_modules/mockmod');
        t.ok(findCachedModule('./node_modules/mockmod'));
        mockRequire.unrequire('./node_modules/mockmod');
        t.ok(!findCachedModule('./node_modules/mockmod'));

        t.done();
    },

    'should remove modules by name': function(t) {
        require('mockmod');
        t.ok(findCachedModule('mockmod'));
        unrequire('mockmod');
        t.ok(!findCachedModule('mockmod'));
        t.done();
    },

    'should tolerate modules that are not loaded': function(t) {
        unrequire('nonesuch');
        t.done();
    },

    'should error out unloading files that are not found': function(t) {
        t.throws(function(){ unrequire('/none/such') }, /Cannot find module/);
        t.done();
    },

    'should unload module by $cwd-relative path if cannot parse stack': function(t) {
        t.stubOnce(Error, 'captureStackTrace', function(obj, func){ obj.stack = "Error: mock error\n  some line 1\n  other line 2\n"; });
        t.throws(function(){ unrequire('./none/such/2') }, new RegExp('Cannot find module \'' + process.cwd()) + '/./none/such/2\'');
        t.done();
    },

    'findCallingFile': {
        'should find file of anonymous function': function(t) {
            var stack = [ 'Error', '  at Object.<anonymous> (module.js:100:20)', '  at /path/name:101:21', '  at /otherpath:1:2' ];
            var caller = unrequire.findCallingFile(stack);
            t.equal(caller, '/path/name');
            t.done();
        },

        'should find file of named function': function(t) {
            var stack = [ 'Error', '  at Object.<anonymous> (module.js:100:20)', '  at funcName (/path/name:101:21)', '  at /otherpath:1:2' ];
            var caller = unrequire.findCallingFile(stack);
            t.equal(caller, '/path/name');
            t.done();
        },

        'should find file of hashed function whose name contains punctuation': function(t) {
            var stack = [ 'Error', '  at Object.<anonymous> (module.js:100:20)', '  at Object.(func(/ * (/tion (/path/name:101:21)', '  at /otherpath:1:2' ];
            var caller = unrequire.findCallingFile(stack);
            t.equal(caller, '/path/name');
            t.done();
        },

        'should find file containing spaces': function(t) {
            var stack = [ 'Error', '  at Object.<anonymous> (module.js:100:20)', '  at /path /name:101:21', '  at /otherpath:1:2' ];
            var caller = unrequire.findCallingFile(stack);
            t.equal(caller, '/path /name');
            t.done();
        },
    },

    'disrequire.quick': {
        beforeEach: function(done) {
            // mock up a package file load
            var mod = this.mod = {
                id: 'x-test',
                exports: {},
                parent: null,
                filename: '/some/file/path/x-test.js',
                loaded: true,
                children: [],
                paths: [],
            };
            require.cache['x-test'] = mod;
            done();
        },

        'should unload file from module that loaded it': function(t) {
            var mod = this.mod;
            // pretend that it was loaded by the module that loaded us (our parent module)
            mod.parent = module.parent;
            module.parent.children.push(mod);
            unrequire.quick('x-test');
            t.ok(!require.cache['x-test']);
            t.ok(module.parent.children.indexOf(mod) < 0);
            t.done();
        },

        'should unload module with no parent': function(t) {
            var mod = this.mod;
            delete mod.parent;
            unrequire.quick('x-test');
            t.ok(!require.cache['x-test']);
            t.done();
        },
    },
};

function findCachedModule( name, children ) {
    var path = (name[0] === '/') ? name : require.resolve(name);

    if (!children) {
        var root = module;
        while (root.parent) root = root.parent;
        children = root.children;
    }

    // avoid cycles
    if (children._qmock_visited) return;

    var mod;
    children._qmock_visited = true;
    for (var i=0; i<children.length; i++) {
        if (children[i].filename === path) mod = children[i];
        else mod = findCachedModule(name, children[i].children);
        if (mod) break;
    }
    delete children._qmock_visited;
    return mod;
}
