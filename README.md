disrequire
==========

placeholder for `qmock.unrequire`

This package will export a function to undo the side-effects of a `require()`.
All copies of the module cached by nodejs will be discarded.

This function is called `unrequire` in `qmock`, but that package name is not
available.

    const unrequire = require('disrequire');
    unrequire('config');

Related Work
------------

- [`qmock`](https://npmjs.com/package/qmock) - various useful mocks and stubs,
  including for node system functions
