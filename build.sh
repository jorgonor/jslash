#!/bin/sh

jsdoc -d=doc src/jslash.js src/jslash.shapes.js 
jsc --js src/jslash.js --js src/jslash.shapes.js > min/jslash.min.js
