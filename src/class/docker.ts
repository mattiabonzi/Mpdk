import debug from 'debug'; 
import { dockerCommand, IOptions } from 'docker-cli-js';
import { join } from 'path';
import ui from './ui.js';


export default class DockerClient {
  public debug = debug('mpdk:docker');

    
    protected options:IOptions = {
        echo: false,
      };

      public constructor(machineName:string='', workDir:string=process.cwd()) {
        this.options.machineName = machineName;
        this.options.currentWorkingDirectory = workDir;
      }

      public cmd(cmd:string) {
        this.debug(cmd);
          return dockerCommand(cmd, this.options).catch((e) => {
            throw e;
          })
      }
    
}



/*
import { ChildProcess, exec, execSync, spawn } from 'child_process';
import { dockerCommand, IOptions } from 'docker-cli-js';
import { join } from 'path';
import * as util from  'node:util'
import ui from './ui.js';
import { stderr } from 'process';


export interface DockerOptions {
  machineName?: string,
  workDir?: string,
  log?: string,
  buffer?: boolean,
  stderrOnStdout?:boolean
}

export default class DockerClient {

    private machineName:string = '';
    private log:string = '';
    private buffer:boolean = true;
    private stderrOnStdout:boolean = false;
    private workDir:string = process.cwd();
    protected options:IOptions = {
        echo: false,
      };

      public constructor(options:DockerOptions = {machineName : '', workDir: process.cwd(), buffer: true, log:'', stderrOnStdout: false}) {
        if (options.machineName) this.machineName = options.machineName;
        if (options.workDir) this.workDir = options.workDir;
        if (options.log) this.log = options.log;
        if (options.buffer) this.buffer = options.buffer;
        if (options.stderrOnStdout) this.stderrOnStdout = options.stderrOnStdout;
      }

      public cmd1(...args:string[]):Promise<string> {
        ui.debug('[DOCKER] docker'+args.join(' '));
        return new Promise<string>((resolve) => {
          var stderr = '';
          var stdout = '';
          var proc = spawn("docker", args, {cwd: this.workDir, windowsHide: true});
          proc.stdout.on('data', (data) => {
            if (this.buffer) stdout += data;
            if (this.log) this.writeLog(data);
          });
          proc.stderr.on('data', (data) => {
            if (this.buffer) {
              if (this.stderrOnStdout) stdout += data;
              else stderr += data;
            }
            if (this.log) this.writeLog(data);
          });
          proc.on('close', (code) => {
            if (code) {
              ui.error(stderr);
            }
            resolve(stdout);
          });
        });
      }

      public writeLog(data:string) {
          if 
      }

      public cmd(cmd:string):Promise<string> {
        return new Promise<string>((resolve) => {''});
      }
    
}
*/