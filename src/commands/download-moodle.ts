
import { Flags, Args } from '@oclif/core';
import { execSync } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import BaseCommand from '../class/base-command.js';
import FileUtils from '../class/file-utils.js';
import MoodleUtils from '../class/moodle-utils.js';
import ui from '../class/ui.js';




export default class DownloadMoodle extends BaseCommand<typeof DownloadMoodle> {
  static description = "Download Moodle specified or latest version";


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static aliases: string[] = ['download-moodle'];

  static flags = {
    version: Flags.string({ char: 'v', description: 'Version to download' }),
    url: Flags.boolean({ char: 'u', description: 'Return url instead of download' }),
    'no-cache': Flags.boolean({  description: 'Do not use cache' }),
  }

  static args = {
    path: Args.string({ description: 'path where to download moodle (a directory moodle-{version} will be cerated inside)' }),
  }


  public async run(): Promise<void> {
    var utils = new MoodleUtils(this.mpdk);
    try {
        var info = await utils.getVersionInfo(this.opt.version);
        if (this.opt.url) {
            ui.output(info.zipball_url);
        } else {
            if (!this.arg.path) ui.stop('You must specify a path to download Moodle');
            ui.action.start('Downloading Moodle version: '+info.version);
            utils.downloadMoodle(info.zipball_url, this.arg.path);
            this.success('Downloaded Moodle version: '+info.version+' to: '+this.arg.path+'/moodle.zip');
        }
        
    } catch (e) {
      ui.throw(e);
    }

  }
}
