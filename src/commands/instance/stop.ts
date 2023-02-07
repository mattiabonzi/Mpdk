
import { Flags, Args } from '@oclif/core';
import BaseCommand from '../../class/base-command.js';
import ui from '../../class/ui.js';
import inquirer from 'inquirer';
import Instance from '../../class/instance.js';



export default class InstanceStop extends BaseCommand<typeof InstanceStop> {
  static description = 'Stop an instance (data will NOT be destroyed)'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static aliases: string[] = ['stop'];

  static flags = {
    all: Flags.boolean({ char: 'a', description: 'Stop all running instances' }),
    ...this.instanceFlag
  }


  public async run(): Promise<void> {
    if (!this.opt.all) this.requireInstance();
    try {
      ui.action.start('Stopping');
      if (this.opt.all) {
        var promises:Promise<void>[] = [];
        Object.values(this.mpdk.getConfFromAllInstance()).forEach(instConf => {
          var conf = {...this.config, instance: instConf}; 
          var insta = (new Instance(this.mpdk)).load(conf);
          promises.push(insta.stop());
        });
        await Promise.all(promises);
      } else {
        await this.mpdk.instance.stop();
      }
      this.success("Instance stopped");
    } catch (e) {
      ui.throw(e);
    }

  }
}
