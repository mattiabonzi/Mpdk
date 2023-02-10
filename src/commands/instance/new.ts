
import { Flags, Args } from '@oclif/core';
import inquirer from 'inquirer';
import { join } from 'path';
import BaseCommand from '../../class/base-command.js';
import ui from '../../class/ui.js';




export default class InstanceNew extends BaseCommand<typeof InstanceNew> {
  static description = 'Create a new instance'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static aliases: string[] = ['new']
  static flags = {
    version: Flags.string({ char: 'v', description: 'Moodle version to install, use form x.x.x or x.x or x', dafault: 'latest' }),
  }

  static args = {
    name: Args.string({ description: 'Name of the new instance', required: true }),
    option: Args.string({ description: 'Default options in JSON format (required if non-interactive)' , required: false}),
  }

  public async run(): Promise<void> {
    
    
    
     var options = this.getNonInteractiveJsonOptions(this.arg.option);

      var questions = [{
        type: 'list',
        name: 'externalServices',
        message: 'Enable external service (redis, mongo, memcached, ldap, solr)?',
        default: options.externalServices,
        choices: [{ name: 'No', value: false }, { name: 'Yes', value: true }]
      }];
      
      
      
      var options = { ...options, ...await inquirer.prompt(questions, options) }
      
    try {
      ui.action.start('Creating new instance');
      await this.mpdk.instance.new(this.mpdk, this.arg.name, this.opt.version, options);
      this.success("Your instance is ready inside: %s, run 'mpdk -i %s start' to start it",
        this.mpdk.instance.path,
        this.mpdk.instance.name);
    } catch (e) {
      this.mpdk.instance.rollback_new(this.arg.name);
      ui.throw(e);
    }

  }
}
