#!/usr/bin/env node

const { help, version } = require('../lib/util');
const cmds = {
  '--convert': () => {
    require('../lib/index');
  },
  '--version': version,
  '-v': version,
};
const [, , cmd] = process.argv;
cmds[cmd] ? cmds[cmd]() : help();
