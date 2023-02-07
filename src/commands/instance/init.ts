
import { Flags, Args } from '@oclif/core';
import { expect } from 'chai';
import BaseCommand from '../../class/base-command.js';
import Instance from '../../class/instance.js';
import ui from '../../class/ui.js';




export default class InstanceInit extends BaseCommand<typeof InstanceInit> {
  static description = "Init an instance as specified (as no effect if already initialized per type)"


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]


  static flags = {
    dev: Flags.boolean({ char: 'd', description: 'Start in dev mode (can be combined with --behat and --phpunit)', default: true }),
    phpunit: Flags.boolean({ char: 'u', description: 'Start in PhpUnit test mode (can be combined with --dev and --behat)', default: false }),
    behat: Flags.boolean({ char: 'b', description: 'Start in Behat test mode (can be combined with --dev --phpunit)', default: false }),
    ...this.instanceFlag
  }




  public async run(): Promise<void> {
    try {
      ui.action.start('Initializing instance');
        await this.mpdk.instance.init(this.opt.dev, this.opt.phpunit, this.opt.behat);
      this.success("Instance initialized");
    } catch (e) {
      ui.throw(e);
    }

  }
}
