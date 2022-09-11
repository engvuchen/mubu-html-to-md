#!/usr/bin/env node

const { help, version } = require('../lib/util');
const cmds = {
  '--convert': () => {
    let { callByCmd } = require('../lib/index');
    callByCmd();
  },
  '--version': version,
  '-v': version,
};
const [, , cmd] = process.argv;
cmds[cmd] ? cmds[cmd]() : help();
