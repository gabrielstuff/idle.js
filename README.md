# idle-js

Get bus

[![Travis build status](http://img.shields.io/travis/gabrielstuff/idle-js.svg?style=flat)](https://travis-ci.org/gabrielstuff/idle-js)
[![Code Climate](https://codeclimate.com/github/gabrielstuff/idle-js/badges/gpa.svg)](https://codeclimate.com/github/gabrielstuff/idle-js)
[![Test Coverage](https://codeclimate.com/github/gabrielstuff/idle-js/badges/coverage.svg)](https://codeclimate.com/github/gabrielstuff/idle-js)
[![Dependency Status](https://david-dm.org/gabrielstuff/idle-js.svg)](https://david-dm.org/gabrielstuff/idle-js)
[![devDependency Status](https://david-dm.org/gabrielstuff/idle-js/dev-status.svg)](https://david-dm.org/gabrielstuff/idle-js#info=devDependencies)

# Test


```
console.log('hello')
new idleJs({
  onIdle: function (){
    console.log('idle !');
  }
}).start();
```