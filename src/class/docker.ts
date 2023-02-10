import debug from 'debug'; 
import { dockerCommand, IOptions } from 'docker-cli-js';
import { join } from 'path';
import ui from './ui.js';


export default class DockerClient {
  public debug = debug('mpdk:docker');

    
    protected options:IOptions = {
        echo: false,
      };

      public constructor( workDir:string=process.cwd()) {
        this.options.currentWorkingDirectory = workDir;
      }

      public cmd(cmd:string) {
        this.debug(cmd);
          return dockerCommand(cmd, this.options).catch((e) => {
            throw e;
          })
      }
    
}

