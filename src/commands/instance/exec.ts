
import { Flags, Args } from '@oclif/core';
import { expect } from 'chai';
import BaseCommand from '../../class/base-command.js';
import Instance from '../../class/instance.js';
import ui from '../../class/ui.js';




export default class InstanceExec extends BaseCommand<typeof InstanceExec> {
  static description = "Execute a command inside the instance container, CWD is defualt to /var/www/html"


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    cwd: Flags.string({ char: 'd', description: 'Set CWD (Current Working Directory)' })
  }


  static args = {
    command: Args.string({ description: 'Command to run, will be quoted with "\'" (single quote)', required: true }),
  }


  public async run(): Promise<void> {
    try {
        var cwd = '';
        if (this.opt.cwd) {
          cwd = 'cd '+this.opt.cwd+' && ';
        }
        ui.output((await this.mpdk.instance.docker?.exec(cwd+this.arg.command)));
    } catch (e) {
      ui.throw(e);
    }

  }
}
