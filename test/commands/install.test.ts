import { readFileSync } from 'fs';
import { join as file, join as dir}  from 'path';
import os from 'os';
import { expect, test, config, enter, MINUTE, ENTER } from '../helpers/utils.js';





describe('Install mpdk', () => {
    test
      .stdout()
      .stderr()
      .loadConfig(config)
      .interactiveCommand(['install' ], { 
        'your full name': ['Jonh Smith', ENTER],
        'your email': ['jonhsmith@example.com', ENTER],
        'your github username': ['mpdktest', ENTER],
        'github classic token': ['my_super_secret_token', ENTER],
        'organization on github': ['myfancyorg', ENTER],
        '*': [ENTER]
      })
      .it('Should download and install the dependencies, create config file and dirs', ctx => {
        //Output
        expect(ctx.stdout).to.contain('SUCCESS');
        //File
        var configFile = dir(config.configDir, 'config.json');
        var moodleDocker = dir(config.dataDir, 'moodle-docker');
        var mpdkAsset = dir(config.dataDir, 'mpdk-assets');
        var baseDir = dir(config.home, 'Moodle-plugin');
        var cacheDir = config.cacheDir;
        
        expect(configFile).to.be.a.file().that.is.json;
        expect(file(moodleDocker, 'config.docker-template.php')).to.be.a.file();
        expect(file(mpdkAsset, 'base.yml')).to.be.a.file();
        expect(file(cacheDir, 'pluginlist.json')).to.be.a.file().that.is.json;
        expect(file(cacheDir, 'plugintypes.json')).to.be.a.file().that.is.json;
        expect(file(cacheDir, 'moodlelist.json')).to.be.a.file().that.is.json;
        expect(dir(config.configDir, 'dns')).to.be.a.directory();
        expect(dir(config.configDir, 'proxy')).to.be.a.directory();

        //Config
        var setting = JSON.parse(readFileSync(configFile).toString());
        expect(setting).to.be.like({
          "configFile": configFile,
          "home": config.home,
          "baseDir": baseDir,
          "configDir": config.configDir,
          "dataDir": config.dataDir,
          "cacheDir": cacheDir,
          "instancesDir": dir(baseDir, 'instances'),
          "pluginsDir": dir(baseDir, 'plugin'),
          "moodleDir": dir(baseDir, 'moodle'),
          "moodleDockerDir": moodleDocker,
          "assetDir": mpdkAsset,
          "minPort": 10000,
          "maxPort": 15000,
          "dns": true,
          "proxy": true,
          "browser": "chrome",
          "defaultHost": ".moodle.dev",
          "user": {
            "name": "Jonh Smith",
            "email": "jonhsmith@example.com"
         },
         "github": {
            "token": "my_super_secret_token",
            "username": "mpdktest",
            "org": 'myfancyorg'
         },
         "defaultInstance": '',
         "defaultBadge": ['version', 'moodle-version', 'php-version', 'build', 'test', 'semantic-version', 'license', 'downloads', 'github-workflow'],
         "copyright": "Jonh Smith <jonhsmith@example.com>",
        });
      })



    });