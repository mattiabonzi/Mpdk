
import { Flags, Args } from '@oclif/core';
import { existsSync } from 'node:fs';
import BaseCommand from '../class/base-command.js';
import inquirer from 'inquirer';
import ui from '../class/ui.js';



export default class Install extends BaseCommand<typeof Install> {
  static description = 'describe the command here'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    version: Flags.string({ char: 'v', description: 'Moodle version to install, use form x.x.x or x.x or x', dafault: 'latest' }),
  }

  static args = {
    option: Args.string({ description: 'Default options in JSON format (required if non-interactive)' }),
  }

  public async run(): Promise<void> {
    if (existsSync(this.mpdk.configFile)) {
        ui.stop("Already installed!");
    }
    var nonInteractiveOptions = this.getNonInteractiveJsonOptions(this.arg.option);
    var settings = {...this.mpdk.getDefaultSetting(this.config), ...nonInteractiveOptions};
    if (!this.nonInteractive) {
        var questions = [
            {
                type: 'input',
                name: 'user',
                message: 'Your name (Jonh Smith <jonhsmith@myorg.com>)',
                default: settings.user,
            },        
            {
                type: 'input',
                name: 'baseDir',
                message: 'Mpdk home directory (where all the developing happens)?',
                default: settings.baseDir,
            },
            {
                type: 'input',
                name: 'cacheDir',
                message: 'Mpdk config directory (just for caching)?',
                default: settings.cacheDir,
            },
            {
                type: 'input',
                name: 'dataDir',
                message: 'Mpdk data directory (to store stuff)?',
                default: settings.dataDir,
            },
            {
                type: 'input',
                name: 'defaultDb',
                message: 'Default DB to use?',
                default: settings.instance.db,
            },
            {
                type: 'list',
                name: 'proxy',
                message: 'Use internal DNS?',
                default: settings.proxy,
                choices: [{ name: 'Yes', value: true }, { name: 'No', value: false }]
            },
            {
                type: 'list',
                name: 'dns',
                message: 'Use internal DNS?',
                default: settings.dns,
                choices: [{ name: 'No', value: false }, { name: 'Yes', value: true }]
            },
            {
                type: 'input',
                name: 'dns',
                message: 'Use a remote docker installation (type host, or leave blank)?',
                default: settings.remoteHost,
            },
            {
                type: 'list',
                name: 'browser',
                message: 'What browser do you use?',
                default: settings.browser,
                choices: [{ name: 'Chrome', value: 'chrome' }, { name: 'Firefox', value: 'firefox' }]
            },
            
        ];
        settings = await inquirer.prompt(questions, nonInteractiveOptions);
        if (!this.mpdk.proxy) {
            questions = [{
                type: 'input',
                name: 'minPort',
                message: 'Min port to use to allocate new instance',
                default: settings.minPort+'',
            },
            {
                type: 'input',
                name: 'maxPort',
                message: 'Max port to use to allocate new instance',
                default: settings.maxPort+'',
            }];
            settings = {...settings, ...(await inquirer.prompt(questions, nonInteractiveOptions))};
          }
    }


    try {
        ui.action.start('Installing');
        await this.mpdk.install(settings);
        var msg = [
            'Correctly installed!',
            'Config file in: %s, dev home in: %s',
            'To add $s to your path run: "idnotknow"',
            'To create your first instance run: "%s new myInstance"',
            'Run %s --help to learn more'
        ];
        let bin = 'mpdk';
        this.success(msg.join("\n"), this.mpdk.configDir, this.mpdk.baseDir, bin, bin, bin);
    } catch (e) {
        this.mpdk.rollback_install();
        ui.throw(e);
    }
    
  }



}
