
import { Flags, Args } from '@oclif/core';
import { expect } from 'chai';
import BaseCommand from '../../class/base-command.js';
import Instance from '../../class/instance.js';
import ui from '../../class/ui.js';
import format from 'dateformat';
import MoodleUtils from '../../class/moodle-utils.js';
import inquirer from 'inquirer';
// @ts-ignore
import searchlist from 'inquirer-search-list';


export default class PluginNew extends BaseCommand<typeof PluginNew> {
  static description = 'Create a new plugin (from scratch))'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  //static aliases: string[] = [''];

  static flags = {
    manual: Flags.boolean({ char: 'm', description: 'Write the recipe file, and stop the process (so you can edit it manually)' })
  }

  static args = {
    option: Args.string({ description: 'Default options in JSON format (required if non-interactive)' }),
  }


  public static getCommonQuestions(utils:MoodleUtils): any[] { 
    return [
    { name: 'name', message: 'Plugin display name', type: 'input', required: true },
    { name: 'shortname', message: 'Plugin shortname', type: 'input', required: true, default: (a: any) => a.name.replace(/[^A-Za-z0-9-_]/gi, '').toLowerCase() },
    { name: 'type', message: 'Select plugin type', type: 'search-list', required: true, choices: utils.getPluginTypesOptions() },
    { name: 'versionInt', message: 'Plugin version', type: 'input', default: format(new Date(), 'yyyymmdd00'), },
    { name: 'version', message: 'Plugin release', type: 'input', default: '0.1.0' },
    { name: 'minVersion', message: 'Select a minimium required moodle verion', type: 'search-list', required: true, choices: utils.getVersionOptions() },
    { name: 'maturity', message: 'Select maturiy level', type: 'list', required: true, choices: utils.getMaturityOptions() },
    { name: 'description', message: 'Short description of the project (one line)', type: 'input', required: true, default: (a: any) => `${a.name} Moodle plugin of type ${a.type}` },
    { name: 'pluginReq', message: 'Does your plugin require any other plugin to work? (space separated component name)', type: 'input', required: true, default: '' },
    { name: 'useGrunt', message: 'Initialize GRUNT for this plugin?', type: 'list', required: true, choices: [{ name: 'Yes', value: true }, { name: 'No', value: false }] },
  ]};


  public async run(): Promise<void> {

    try {

      var options = { ...this.getNonInteractiveJsonOptions(this.arg.option), editmanually: true };
      var utils = new MoodleUtils(this.mpdk);
        // @ts-ignore
        inquirer.registerPrompt('search-list', searchlist);
        var yesNo = [{ name: 'Yes', value: true }, { name: 'No', value: false }];
        var noYes = [{ name: 'No', value: false }, { name: 'Yes', value: true }];
        var features = utils.getPluginskelFeaturesOptions();

        var questions: any[] = [
          ...PluginNew.getCommonQuestions(utils),
          { name: 'features', message: 'Select features to generate', type: 'checkbox', required: true, choices: features, default: features.map(f => f.value) },
          { name: 'privacy', message: 'Does your plugin store personal user data?', type: 'list', required: true, choices: yesNo },
          { name: 'git', message: 'Initialize a GIT repository?', type: 'list', required: true, choices: yesNo },
          
        ];
        if (!this.opt.manual) {
          if (!this.mpdk.instance.path) ui.stop('An instance is required to proceed');
          if (!this.mpdk.instance.status.dev) ui.stop('The instance is not in dev mode');
          if (!this.mpdk.instance.status.running) ui.stop('The instance is not running');
          options.editmanually = false;
        }

        options = { ...options, ...await inquirer.prompt(questions, options) }
      
      this.debug('Creating plugin ' + options.type + '_' + options.shortname + ' with options: ' + JSON.stringify(options));
      ui.action.start('Creating new plugin');
      await this.mpdk.plugin.new(options);
      this.success('Plugin created in: ' + this.mpdk.plugin.path);

    } catch (e) {
      // this.mpdk.plugin.rollback_new (options.type+'_'+options.shortname);
      ui.throw(e);
    }

  }







}
