
import { Flags, Args } from '@oclif/core';
import { expect } from 'chai';
import inquirer from 'inquirer';
import { join } from 'path';
import BaseCommand from '../../class/base-command.js';
import Instance from '../../class/instance.js';
import MoodleUtils from '../../class/moodle-utils.js';
import MoodlePlugin from '../../class/plugin.js';
import ui from '../../class/ui.js';
import PluginNew from './new.js';
// @ts-ignore
import searchlist from 'inquirer-search-list';



export default class PluginAdd extends BaseCommand<typeof PluginAdd> {
  static description = 'Add an exist plugin to mpdk'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  

  static args = {
    name: Args.string({ description: 'Name of the plugin to add (component name {type}_{shortname})', required: true }),
    options: Args.string({ description: 'Non interactive json options' }),
  }


  public async run(): Promise<void> {
    ui.log("Parsing plugin, question will be asked to fill missing infrmation");
    try {
      var path = join(this.mpdk.pluginsDir, this.arg.name);
      var options = {...MoodlePlugin.parseExistingPlugin(path), ...this.getNonInteractiveJsonOptions(this.arg.options)};
      var utils = new MoodleUtils(this.mpdk);
      inquirer.registerPrompt('search-list', searchlist);
      var questions: any[] = [...PluginNew.getCommonQuestions(utils),
        { name: 'defaultInstance', message: 'Select a defualt instance for this plugin', type: 'search-list', required: true, choices: this.mpdk.getInstanceOptions() },
      ]
      options = { ...options, ...await inquirer.prompt(questions, options) }
      ui.action.start('Adding plugin');
      await this.mpdk.plugin.add(this.arg.name, options);
      this.success('Plugin added');
    } catch (e) {
      ui.throw(e);
    }

  }
}
