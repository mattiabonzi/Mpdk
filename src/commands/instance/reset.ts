
import { Flags, Args } from '@oclif/core';
import BaseCommand from '../../class/base-command.js';
import ui from '../../class/ui.js';
import inquirer from 'inquirer';
import Instance from '../../class/instance.js';



export default class InstanceReset extends BaseCommand<typeof InstanceReset> {
  static description = 'Reset an instance (data will be destroyed!))'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    force: Flags.boolean({ char: 'f', description: 'Do not ask confirmation' })
  }


  public async run(): Promise<void> {
    this.requireInstance();
    if (!this.opt.force) {
      await inquirer.prompt({
        type: 'confirm',
        name: 'continue',
        message: `ARE YOU REALLY SURE you want to reset ${this.mpdk.instance.name}?`
      });
    }
    try {
      ui.action.start('Resetting');
      var status = {...this.mpdk.instance.status};
      await this.mpdk.instance.down();
      await this.mpdk.instance.start(status.dev, status.phpunit, status.behat);
      this.success("Instance resetted");
    } catch (e) {
      ui.throw(e);
    }

  }
}
