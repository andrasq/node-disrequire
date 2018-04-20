disrequire
==========
[![Build Status](https://api.travis-ci.org/andrasq/node-disrequire.svg?branch=master)](https://travis-ci.org/andrasq/node-disrequire?branch=master)
[![Coverage Status](https://codecov.io/github/andrasq/node-disrequire/coverage.svg?branch=master)](https://codecov.io/github/andrasq/node-disrequire?branch=master)


Same as `qmock.unrequire`, but available standalone.

This package exports a function to undo the side-effects of a `require()`.
All cached copies of an external nodejs module loaded with `require` will be discarded.
Built-in modules such as `http` do not have separate cached copies, and are not unloaded.

This function is called `unrequire()` in `qmock`, but the "unrequire" package name
is not available.

    const unrequire = require('disrequire');
    unrequire('config');


Related Work
------------

- [`qmock`](https://npmjs.com/package/qmock) - various useful mocks and stubs,
  including for node system functions
