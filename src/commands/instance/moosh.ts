
import { Flags, Args } from '@oclif/core';
import { expect } from 'chai';
import BaseCommand from '../../class/base-command.js';
import Instance from '../../class/instance.js';
import ui from '../../class/ui.js';




export default class InstanceExec extends BaseCommand<typeof InstanceExec> {
  static description = "Execute Moosh inside the instance container (see https://moosh-online.com/)"


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  //static aliases: string[] = [''];




  static args = {
    command: Args.string({ description: 'Moosh command to run, will be quoted with "\'" (single quote)', required: true }),
  }


  public async run(): Promise<void> {
    try {
        ui.output((await this.mpdk.instance.docker?.exec('moosh '+this.arg.command)));
    } catch (e) {
      ui.throw(e);
    }

  }
}
