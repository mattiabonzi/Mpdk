
import { Flags, Args } from '@oclif/core';
import { expect } from 'chai';
import BaseCommand from '../../class/base-command.js';
import MoodleDockerClient from '../../class/docker-compose.js';
import Instance from '../../class/instance.js';
import ui from '../../class/ui.js';
import { JSONPath } from 'jsonpath-plus';
import DockerClient from '../../class/docker.js';



export default class InstanceList extends BaseCommand<typeof InstanceList> {
  static description = 'Show a list of instances and their status'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static aliases: string[] = ['ls', 'ps'];

  static flags = {
    ...ui.table.flags({except: ['columns', 'extended']})
  }



  public async run(): Promise<void> {
    try {
      var list = this.mpdk.getInstanceList();
      var docker = new DockerClient();
      var info = JSON.parse((await docker.cmd('compose ls --format json')).raw);
      
        ui.table(list, {
          name: {header: 'Name     '},
          path: {},
          version: {header: 'Moodle Version'},
          php: {header: 'Php Version'},
          docker_status: {header: 'Docker status', get: (row) => {return JSONPath<string>({path: `$..[?(@.Name=="${row.name}")].Status`, json: info})[0] ?? 'Not running'}},
          status: {header: 'Saved status', get: (row) => {return row.status.running ? 'Running' : 'Not running'}},
          init: {header: 'Initialiazed as', get: (row) => {
            var init = [];
            if (row.status.dev) init.push('Dev');
            if (row.status.phpUnit) init.push('PhpUnit');
            if (row.status.behat) init.push('Behat');
            return init.join(', ');
          }},
          plugins: {get: (row) => {return row.plugins.join(', ');}},
        }, this.opt);
    } catch (e) {
      ui.throw(e);
    }

  }
}
