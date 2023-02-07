
import { Flags, Args } from '@oclif/core';
import BaseCommand from '../../class/base-command.js';
import ui from '../../class/ui.js';
import inquirer from 'inquirer';
import Instance from '../../class/instance.js';



export default class InstanceRemove extends BaseCommand<typeof InstanceRemove> {
  static description = 'Stop an instance (data will be destroyed!)'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    force: Flags.boolean({ char: 'f', description: 'Do not ask confirmation' }),
    all: Flags.boolean({ char: 'a', description: 'Stop all running instances' }),
    ...this.instanceFlag
  }


  public async run(): Promise<void> {
    if (!this.opt.all) this.requireInstance();
    if (!this.opt.force) {
      await inquirer.prompt({
        type: 'confirm',
        name: 'continue',
        message: `ARE YOU REALLY SURE you want to remove ${this.opt.all?'all instance?':this.mpdk.instance.name}?`
      });
    }
    try {
      ui.action.start('Removing: %s', this.opt.all ? 'all instance' : this.mpdk.instance.name);
      if (this.opt.all) {
        var promises:Promise<void>[] = [];
        Object.values(this.mpdk.getConfFromAllInstance()).forEach(instConf => {
          var conf = {...this.config, instance: instConf}; 
          var insta = (new Instance(this.mpdk)).load(conf);
          promises.push(insta.remove());
        });
        await Promise.all(promises);
      } else {
        await this.mpdk.instance.remove();
      }
      
      ui.success("Instance has been removed");
    } catch (e) {
      ui.throw(e);
    }

  }
}
