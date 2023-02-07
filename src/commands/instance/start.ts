
import { Flags, Args } from '@oclif/core';
import BaseCommand from '../../class/base-command.js';
import ui from '../../class/ui.js';
import InstanceInit from './init.js';




export default class InstanceStart extends BaseCommand<typeof InstanceStart> {
  static description = 'Start an instance'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static aliases: string[] = ['start'];

  static flags = {
    ...InstanceInit.flags,
  }


  public async run(): Promise<void> {
    this.requireInstance();
    try {
      ui.action.start('Starting');
      await this.mpdk.instance.start(this.opt.dev, this.opt.phpunit, this.opt.behat);
      this.success("Your instance is running on: %s", 'host');
    } catch (e) {
      ui.throw(e);
    }

  }
}
