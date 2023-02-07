
import { Flags, Args } from '@oclif/core';
import { expect } from 'chai';
import BaseCommand from '../../class/base-command.js';
import Utils from '../../class/general-utils.js';
import Instance from '../../class/instance.js';
import ui from '../../class/ui.js';




export default class PluginInstall extends BaseCommand<typeof PluginInstall> {
  static description = "Uninstall a plugin on an instance"


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]  

  static flags = {
    'all': Flags.boolean({ char: 'a', description: 'Uninstall the plugin on all running instances', default: false }),
  }

  static args = {
    instances: Args.string({ description: "Comma or space separate list of isntance", required: true }),
  }


  public async run(): Promise<void> {
    try {
      ui.action.start('Uninstalling');
      var instances = Utils.spaceOrCommaList(this.arg.instances);
      if (this.opt.all) {
        instances = this.mpdk.getInstanceOptions().map(i => i.value);     
    }
   
    
      await this.mpdk.plugin.uninstallFromMany(...instances);
      this.success("Plugin uninstalled");
    } catch (e) {
      ui.throw(e);
    }

  }
}
