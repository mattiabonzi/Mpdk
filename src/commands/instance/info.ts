
import { Flags, Args } from '@oclif/core';
import { expect } from 'chai';
import BaseCommand from '../../class/base-command.js';
import Instance from '../../class/instance.js';
import ui from '../../class/ui.js';




export default class InstanceInfo extends BaseCommand<typeof InstanceInfo> {
  static description = "Print info about an instance"


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  




  public async run(): Promise<void> {
    try {
        var instanceInfo = this.mpdk.instance.toJSON();
        ui.heading("INFO");
        ui.table([instanceInfo], {
            name: {},
            path: {},
            version: {header: 'Moodle Version'},
            php: {header: 'Php Version'},
          }, this.opt);
        ui.heading("DOCKER INFO");
        var dockerInfo = await this.mpdk.instance.ps()
        ui.table(dockerInfo,  {
            Name: {},
            Command:{},
            Service:{},
            State:{},
            ExitCode:{}
        })
        ui.heading("PLUGIN");
        ui.table(instanceInfo.plugins, {
            name: {get: (row) => {return row}},
        })
    } catch (e) {
      ui.throw(e);
    }

  }
}
