import { readFileSync } from "fs";
import { join as file, join as dir } from "path";
import { expect, test, setting, config, enter, down, up } from '../../helpers/utils.js';

//Import the the test that need to be run before this test
//import '../install.test.js';

function expectDefaultInsanceStuff(ctx: any, name: string) {
  var instanceDir: string = dir(setting.instancesDir, name);
  var configFile = file(instanceDir, 'mpdkinstance.json');

  var instance = JSON.parse(readFileSync(configFile, 'utf8').toString());
  expect(ctx.stdout).to.contain('Your instance is ready inside');
  expect(ctx.stdout).to.contain(`run \'mpdk -i ${name} start\' to start it`);
  expect(instanceDir).to.be.a.directory().and.not.empty;
  expect(configFile).to.be.a.file().with.json;
  expect(instance).to.have.property('name', name);
  ctx.instance = instance;
}

describe('Create new instance', () => {
  test
    .stdout()
    .stderr()
    .loadConfig(config)
    .interactiveCommand(['instance:new', 'mpdk-test-no-ext'],
      {
        'enable external service': [enter()]
      })
    .it('Should create an instance WITHOUT external services', ctx => {
      expectDefaultInsanceStuff(ctx, 'mpdk-test-no-ext');
      expect(ctx.instance).to.be.like({
        'externalServices': false
      })
    })


  test
    .stdout()
    .stderr()
    .loadConfig(config)
    .interactiveCommand(['instance:new', 'mpdk-test-ext'],
      {
        'enable external service': [down(), enter()]
      })
    .it('Should create an instance WITH external services', ctx => {
      expectDefaultInsanceStuff(ctx, 'mpdk-test-ext');
      expect(ctx.instance).to.be.like({
        'externalServices': true
      })
    })

  test
    .stdout()
    .stderr()
    .loadConfig(config)
    .interactiveCommand(['instance:new', 'mpdk-test-v3.9', '-v', '3.9'],
      {
        'enable external service': [enter()]
      })
    .it('Should create an instance of Moodle lastest-3.9 (3.9.19)', ctx => {
      expectDefaultInsanceStuff(ctx, 'mpdk-test-v3.9');
      expect(ctx.instance).to.be.like({
        'version': '3.9.19',
        'php': '7.4'
      })
    })

  test
    .stdout()
    .stderr()
    .loadConfig(config)
    .interactiveCommand(['instance:new', 'mpdk-test-v3.9.11', '-v', '3.9.11'],
      {
        'enable external service': [enter()]
      })
    .it('Should create an instance of Moodle 3.9.11', ctx => {
      expectDefaultInsanceStuff(ctx, 'mpdk-test-v3.9.11');
      expect(ctx.instance).to.be.like({
        'version': '3.9.11',
        'php': '7.4'
      })
    })


  test
    .stdout()
    .stderr()
    .loadConfig(config)
    .interactiveCommand(['instance:new', 'mpdk-test-v4.1.0-rc3', '-v', '4.1.0-rc3'],
      {
        'enable external service': [enter()]
      })
    .it('Should create an instance of Moodle RC 4.1.0-rc3', ctx => {
      expectDefaultInsanceStuff(ctx, 'mpdk-test-v4.1.0-rc3');
      expect(ctx.instance).to.be.like({
        'version': '4.1.0-rc3',
        'php': '8'
      })
    })


  test
    .stdout()
    .stderr()
    .stderr()
    .loadConfig(config)
    .interactiveCommand(['instance:new', 'mpdk-test-v2.7', '-v', '2.7'],
      {
        'enable external service': [enter()]
      })
    .it('Should NOT create an instance, because 3.0.0 is the Min version', ctx => {
      expect(ctx.stderr).to.contain('ERROR')
        .and.to.contain('Version not found');

    })


})
