
import { Flags, Args } from '@oclif/core';
import { expect } from 'chai';
import BaseCommand from '../../class/base-command.js';
import Utils from '../../class/general-utils.js';
import Instance from '../../class/instance.js';
import ui from '../../class/ui.js';




export default class PluginInstall extends BaseCommand<typeof PluginInstall> {
  static description = "install a plugin on an instance"


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]  

  static flags = {
    'all': Flags.boolean({ char: 'a', description: 'Install the plugin on all running instances', default: false }),
  }

  static args = {
    instances: Args.string({ description: "Comma or space separate list of isntance", required: true }),
  }


  public async run(): Promise<void> {
    try {
      ui.action.start('Installing to: %s', this.opt.all ? 'all instance' : this.arg.instances);
      var instances = Utils.spaceOrCommaList(this.arg.instances);
      if (this.opt.all) {
        instances = this.mpdk.getInstanceOptions().map(i => i.value);     
    }
      await this.mpdk.plugin.installToMany(...instances);
      this.success("Plugin installed");
    } catch (e) {
      ui.throw(e);
    }

  }
}
