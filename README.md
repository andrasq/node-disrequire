disrequire
==========
[![Build Status](https://app.travis-ci.com/andrasq/node-disrequire.svg?branch=master)](https://app.travis-ci.com/github/andrasq/node-disrequire?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/andrasq/node-disrequire/badge.svg?branch=master)](https://coveralls.io/github/andrasq/node-disrequire?branch=master)


Same as `qmock.unrequire`, but available standalone.

This package exports a function to undo the side-effects of a `require()`.
All cached copies of an external nodejs module loaded with `require` will be discarded.
Built-in modules such as `http` do not have separate cached copies, and are not unloaded.

    const disrequire = require('disrequire');
    disrequire('config');


Api
---

### disrequire( packageName )

Unload the named package from all `require` caches.  The package is removed from
`require.cache` and from every `module.children[]` in which it occurs.  Built-in modules
like `http` are not unloaded.

    const disrequire = require('disrequire');
    disrequire('config');

### disrequire.quick( packageName )

Shallow unload a single copy of the named package from the `require` caches.  The package is
removed from `require.cache` and from the module that loaded it, ie
`require.cache[require.resove(packageName)].parent.children[]`.

If it is known that only one module loaded the package, it is much faster to not have to
walk the module tree searching for other locations.

    const disrequire = require('disrequire');   // now you see it
    disrequire.quick('disrequire');             // now you dont


Changelog
---------

- 1.1.4 - fix broken stack trace capture under node v0.1x
- 1.1.3 - fix to work under node-v0.6 which broke with 1.1.2
- 1.1.2 - fix for use with source maps
- 1.1.1 - fix global leak of name `stack`
- 1.1.0 - new `disrequire.quick()` shallow unload
- 1.0.5 - speed up disrequire() with many cross-linked modules
- 1.0.4 - fix resolveOrSelf for anonymous functions
- 1.0.3 - make tests create the test module, remove node_modules from repo
- 1.0.2 - fix typo in exported `resolveOrSelv`
- 1.0.1 - split out of `qmock`


Related Work
------------

- [`qmock`](https://npmjs.com/package/qmock) - various useful mocks and stubs,
  including mocks for node system functions
