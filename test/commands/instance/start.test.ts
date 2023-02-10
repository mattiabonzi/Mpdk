import { dockerCommand } from "docker-cli-js";
import { readFileSync } from "fs";
import { join as file, join as dir } from "path";
import { expect, test, setting, config, enter, down, up, RGX_SEMVER, RGX_SIMPLEVER } from '../../helpers/utils.js';

//Import the the test that need to be run before this test
import './new.test.js';
/*

describe('Start an instance', () => {
    test
        .stdout()
        .stderr()
        .loadConfig(config)
        .interactiveCommand(['instance:start', '-i', 'mpdk-test-no-ext'])
        .it('Should start and init an instance IN dev mode WITHOUT external services, WITHOUT using -d', async (ctx, done) => {
            var instanceDir = dir(setting.instancesDir, 'mpdk-test-no-ext');
            var name = 'mpdk-test-no-ext';

            var psOutput = (await dockerCommand('ps --filter name=mpdk-test-no-ext*')).raw
            expect(psOutput).to.contain('mpdk-test-no-ext-webserver-1')
                .and.to.contain(name + '-db-1')
                .and.to.contain(name + '-selenium-1')
                .and.to.contain(name + '-exttests-1')
                .and.to.contain(name + '-mailhog-1')
                .and.not.to.contain('Exited');

            expect(file(instanceDir, '.env')).to.be.a.file();
            expect(dir(instanceDir, 'log')).to.be.a.directory().and.not.empty;

            var dotEnv = readFileSync(file(instanceDir, '.env'), 'utf8').toString();
            var jsonConfig = JSON.parse(readFileSync(file(instanceDir, 'mpdkinstance.json'), 'utf8').toString());

            expect(dotEnv).to.contain(`MPDK_DATADIR=${config.dataDir}`)
                .and.to.contain(`ASSETDIR=${dir(config.dataDir, 'moodle-docker', 'assets')}`)
                .and.to.match(new RegExp('MOODLE_DOCKER_PHP_VERSION=' + RGX_SIMPLEVER))
                .and.to.match(new RegExp('MOODLE_DOCKER_VERSION=' + RGX_SEMVER))
                .and.to.match(new RegExp('MOODLE_DOCKER_LINK=https:\/\/api\.github\.com\/repos\/moodle\/moodle\/zipball\/refs\/tags\/v' + RGX_SEMVER))
                .and.to.contain(`MOODLE_DOCKER_BROWSER_TAG=3`)
                .and.to.contain(`MOODLE_DOCKER_DBPASS=moodle`)
                .and.to.contain(`MOODLE_DOCKER_WEB_HOST=${name}\.moodle\.dev`)
                .and.to.contain(`MPDK_BASEDIR=${dir(config.home, 'Moodle-plugin')}`)
                .and.to.contain(`COMPOSE_PROJECT_NAME=${name}`);

            expect(jsonConfig).to.be.like({
                'status': {
                    'running': true,
                    'dev': true,
                    'phpunit': false,
                    'behat': false,
                }
            })
            done();
        });

});

*/