
import { Flags, Args } from '@oclif/core';
import { existsSync } from 'node:fs';
import BaseCommand from '../class/base-command.js';
import inquirer from 'inquirer';
import ui from '../class/ui.js';



export default class Install extends BaseCommand<typeof Install> {
    static description = 'describe the command here'
    protected cname = 'install';

    static examples = [
        '<%= config.bin %> <%= command.id %>',
    ]

    static flags = {
        version: Flags.string({ char: 'v', description: 'Moodle version to install, use form x.x.x or x.x or x', dafault: 'latest' }),
    }

    static args = {
        option: Args.string({ description: 'Default options in JSON format (required if non-interactive)' }),
        user: Args.string({ description: 'Your full name (Eg. Jonh Smith)'}),
    }

    public async run(): Promise<void> {
        if (existsSync(this.mpdk.configFile)) {
            //ui.stop("Already installed!");
        }
        var nonInteractiveOptions = this.getNonInteractiveJsonOptions(this.arg.option);
        var settings = { ...this.mpdk.getDefaultSetting(this.config), ...nonInteractiveOptions };

        var questions = [
            {
                type: 'input',
                name: 'fullname',
                message: 'Your full name (Eg. Jonh Smith)',
                default: settings.user.name,
                prefix: '#',
                suffix: ':'
            },
            {
                type: 'input',
                name: 'email',
                message: 'Your email address',
                default: settings.user.email,
                prefix: '#',
                suffix: ':'
            },
            {
                type: 'input',
                name: 'githubUsername',
                message: 'Your github username',
                default: settings.github.username,
                prefix: '#',
                suffix: ':'
            },
            {
                type: 'input',
                name: 'githubToken',
                message: 'A github classic token, with repo permission (to create one https://github.com/settings/tokens/new)',
                default: '',
                prefix: '#',
                suffix: ':'
            },
            {
                type: 'input',
                name: 'githubOrg',
                message: 'Do you have an organization on Github? (or leave blank)',
                default: '',
                prefix: '#',
                suffix: ':'
            },
            {
                type: 'input',
                name: 'defaultDb',
                message: 'Default DB to use?',
                default: settings.defaultDb,
                prefix: '#',
                suffix: ':'
            },
            {
                type: 'list',
                name: 'proxy',
                message: 'Use internal proxy?',
                default: settings.proxy,
                choices: [{ name: 'Yes', value: true }, { name: 'No', value: false }],
                prefix: '#',
                suffix: ':'
            },
            {
                type: 'list',
                name: 'dns',
                message: 'Use internal DNS?',
                default: settings.dns,
                choices: [{ name: 'No', value: false }, { name: 'Yes', value: true }],
                prefix: '#',
                suffix: ':'
            },
            {
                type: 'list',
                name: 'browser',
                message: 'What browser do you use?',
                default: settings.browser,
                choices: [{ name: 'Chrome', value: 'chrome' }, { name: 'Firefox', value: 'firefox' }],
                prefix: '#',
                suffix: ':'
            }


        ];

        settings = { ...settings, ...(await inquirer.prompt(questions, nonInteractiveOptions)) };
        if (!this.mpdk.proxy) {
            questions = [{
                type: 'input',
                name: 'minPort',
                message: 'Min port to use to allocate new instance',
                default: settings.minPort + '',
                prefix: '#',
                suffix: ':'
            },
            {
                type: 'input',
                name: 'maxPort',
                message: 'Max port to use to allocate new instance',
                default: settings.maxPort + '',
                prefix: '#',
                suffix: ':'
            }];
            settings = { ...settings, ...(await inquirer.prompt(questions, nonInteractiveOptions)) };
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
            //this.mpdk.rollback_install();
            ui.throw(e);
        }

    }



}
