/**
 * test-mockRequire from qmock v0.24.0
 *
 * Copyright (C) 2018 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var unrequire = require('./');
var mockRequire = { unrequire: unrequire };

module.exports = {
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
};

function findCachedModule( name, children ) {
    var root, path = require.resolve(name);

    if (!children) {
        root = module;
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
