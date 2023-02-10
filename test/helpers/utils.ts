import { test as oclifTest } from '@oclif/test'
import * as core from '@oclif/core'
import * as intCmd from "./interactiveCommand.js";
import chai from 'chai';
import chaiFs from 'chai-fs';
import chaiLike from 'chai-like';
import { existsSync, mkdir, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

//Chai
chai.use(chaiFs);
chai.config.truncateThreshold = 0; 

chaiLike.extend({
  match: function(object, expected) {
    return typeof object === 'string' && expected instanceof RegExp;
  },
  assert: function(object, expected) {
    return expected.test(object);
  }
});
chai.use(chaiLike);


//Config
var _config = await core.Config.load(process.cwd());
var dirname = 'test_'+_config.dirname;
_config.dataDir = _config.dataDir.replace(_config.dirname, dirname);
_config.cacheDir = _config.cacheDir.replace(_config.dirname, dirname);
_config.configDir = _config.configDir.replace(_config.dirname, dirname);
_config.errlog = _config.errlog.replace(_config.dirname, dirname);
_config.home = join(_config.home, dirname);
_config.dirname = dirname;
process.env.OCLIF_TESTING_CONFIG = JSON.stringify({  
  dataDir : _config.dataDir,
  cacheDir : _config.cacheDir,
  configDir: _config.configDir,
  errlog : _config.errlog,
  home : _config.home,
  dirname : _config.dirname
});
if (!existsSync(_config.home)) {
  mkdirSync(_config.home);
}


//Export
export const config = _config;
var configFile = join(config.configDir, 'config.json');
console.error('configFile', configFile);
export const setting = existsSync(configFile) ? JSON.parse(readFileSync(configFile, 'utf8').toString()) : {};
export const expect = chai.expect;
export const test = oclifTest.register('interactiveCommand', intCmd.interactiveCommand);
export const ENTER = intCmd.ENTER;
export const DOWN = intCmd.DOWN;
export const UP = intCmd.UP;
export const enter = intCmd.enter;
export const down = intCmd.down;
export const up = intCmd.up;

export const SECOND = 1000;
export const SECONDS = 1000;
export const MINUTE = 60 * 1000;
export const MINUTES = 60 * 1000;


/**
 * Match semver version number as defined by https://semver.org/
 *
 * @type {"([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*))?(?:\\+[0-9A-Za-z-]+)?"}
 */
export const RGX_SEMVER = '([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*))?(?:\\+[0-9A-Za-z-]+)?'

/**
 * Match a simple version number in the form of 1.2.3 or 1.2
 * @type {string}
 */
export const RGX_SIMPLEVER = '([0-9]+)\.([0-9]+)\.{0,1}([0-9]*)'

export default {
  config: config,
  setting: setting,
  expect: expect,
  test: test,
  ENTER: ENTER,
  DOWN: DOWN,
  UP: UP,
  enter: enter,
  down: down,
  up: up
}


