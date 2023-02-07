import { Flags, Args } from '@oclif/core';
import { FlagInput } from '@oclif/core/lib/interfaces/parser.js';
import { expect } from 'chai';
import BaseCommand from '../class/base-command.js';
import Instance from '../class/instance.js';
import MoodleUtils from '../class/moodle-utils.js';
import ui from '../class/ui.js';




export default class UpdateCache extends BaseCommand<typeof UpdateCache> {
  static description = 'Force update moodle and plugins cached version list'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static aliases: string[] = ['update-cache'];
  


  public async run(): Promise<void> {
    try {
      ui.action.start('Updating cache');
      var utils = new MoodleUtils(this.mpdk);
      await utils.updateCache(true)
      this.success('Everything up to date');
    } catch (e) {
      ui.throw(e);
    }

  }
}
