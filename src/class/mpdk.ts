import { ux } from '@oclif/core';
import { existsSync, mkdirSync,  rmSync, readdirSync, renameSync, copyFileSync } from 'node:fs';
import { join  } from 'path';
import DockerClient from './docker.js';
import ui from './ui.js';
import * as Git from "nodegit";
import * as which from 'which';
import * as port from 'tcp-port-used';
import * as semver from 'semver'

import axios from 'axios';
import * as os from 'node:os';
import Instance from './instance.js';
import HasSetting from './base-setting.js';
import debug from 'debug';
import FileUtils from './file-utils.js';
import MoodleUtils from './moodle-utils.js';
import MoodlePlugin from './plugin.js';

interface InitialConfig {
    home:string;
    configDir:string;
    dataDir:string;
    platform:string;
    cacheDir:string;
}

interface UserInfo {
  username:string;
  name:string;
  email:string;
  moodle_token:string;
}

export interface GitHubInfo {
  token:string;
  username:string;
  org:string;
}

export default class Mpdk extends HasSetting {
    public debug = debug('mpdk:core');
    static self: Mpdk;
    private _instance:Instance;
    private _plugin:MoodlePlugin;

    private _home:string="";
    private _bin:string="";
    private _configDir:string="";
    private _dataDir:string="";
    private _platform:string="";
    private _instancesDir:string="";
    private _pluginsDir:string="";
    private _moodleDir:string="";
    private _moodleDockerDir:string="";
    private _user:UserInfo={username:'',name:'',email:'', moodle_token:''};
    private _github:GitHubInfo={token:'',username:'',org:''};
    private _baseDir:string="";
    private _minPort:number=10000;
    private _maxPort:number=10100;
    private _dns:boolean=true;
    private _proxy:boolean=true;
    private _remoteHost:string='';
    private _browser:string="chrome";
    private _defaultHost:string=".moodle.dev";
    private _dev:boolean=true;
    private _cacheDir:string="";
    private _logDocker:boolean=false;
    private  _defaultInstance:any={}
    private _defaultBadge:string[]=[];
    private _copyright:string="";


    


    static get(configFile:string): Mpdk {
        if (!Mpdk.self) {
            Mpdk.self = new Mpdk();
            if (existsSync(configFile)) {
                var setting = JSON.parse(FileUtils.readFile(configFile));
                Mpdk.self.load(setting);
            }
        }
        return Mpdk.self;
    }

    private constructor() {
        super();
        this._instance = new Instance(this);
        this._plugin = new MoodlePlugin(this);
    }

    private load(setting:any):Mpdk {
        this.fromJSON(setting);
        return this;
    }



    public getDefaultSetting(config:InitialConfig) {
       return {
        home : config.home,
        configDir : config.configDir,
        dataDir : config.dataDir,
        cacheDir : config.cacheDir,
        platform : config.platform,
        configFile : join(config.configDir, 'config.json'),
        user : `${os.userInfo().username} @${os.userInfo().username}`,
        baseDir : join(config.home, 'Moodle-plugin'),
        instancesDir : join(this.baseDir, 'instances'),
        pluginsDir : join(this.baseDir, 'plugin'),
        moodleDir : join(this.baseDir, 'moodle'),
        moodleDockerDir : join(this.dataDir, 'moodle-docker')
       }
    }


    public toJSON(){
      var obj:any = super.toJSON();
      delete obj.instance;
      delete obj.self;
      delete obj.plugin;
      return obj;
    }




    /**
     * Install the enviroment
     * @date 1/27/2023 - 3:22:31 PM
     *
     * @public
     * @async
     * @rollback_function Mpdk:rollback_install
     * @param {*} options Options provided by the user or default one
     */
    public async install(options: any) {
        var configFile = join(this.configDir, 'config.json');
        const docker = new DockerClient(this.remoteHost);

        //Sanity check
        if (existsSync(configFile)) {
            ui.stop("Already installed!");
        }
        if (!which.sync('git', { nothrow: true })) {
            ui.stop('Git must be install to continue!')
        }
        var data = await docker.cmd('compose version');
        if (!data || !data.includes('Docker Compose')) {
            ui.stop("Docker must be installed to continue!");
        }

      
        //FIXME: this.instance.db = options.defaultDb;
        //delete options.defaultDb;
        this.load(options);
        

        //Dns
        if (this.dns) {
            this.proxy = true;
        }

        //Create dirs
        try {
            mkdirSync(this.instancesDir, { recursive: true });
            mkdirSync(this.pluginsDir);
            mkdirSync(this.moodleDir);
            mkdirSync(this.moodleDockerDir, { recursive: true });
            mkdirSync(join(this.configDir, 'proxy'), { recursive: true });
        } catch (e) {
            ui.error('Something went wrong creating a directory, check the provided path and permissions', e as Error)
        }

        //Export config
        try {
            this.saveSetting();
        } catch (e) {
            ui.error('Something went wrong creating the config file, check the provided path and permissions', e as Error)
        }

        //Clone moodle-docker repo
        try {
            await Promise.all(
                [
                    Git.Clone.clone("https://github.com/moodlehq/moodle-docker.git", this.moodleDockerDir),
                    Git.Clone.clone("https://github.com/mattiabonzi/mpdk-docker.git", this.moodleDockerDir)
                ]
            );
        } catch (e) {
            ui.error('Something went wrong cloning moodle-docker or mpdk-docker, check provided path, permissions and netwrok', e as Error)
        }


        //Finish
        return true;
    }



    /**
     * Rollback function for Install command
     * @date 1/27/2023 - 3:22:48 PM
     * @rollback Mpdk:install
     * @public
     */
    public rollback_install() {
        ui.log('Rollbacking...');
        rmSync(this.baseDir, { recursive: true, force: true });
        rmSync(this.configDir, { recursive: true, force: true });
        rmSync(this.dataDir, { recursive: true, force: true });
    }


  


    /**
     * Return a free port, that has $num free port following (Ex. num=2 then 1000, if 1000 and 1001 and 1002 are free)
     * @date 1/26/2023 - 4:56:11 PM
     *
     * @public
     * @returns {number} port number
     */
    public async getFreePort(num=2, minPort=this.minPort) {
        var freePort: number = 0;
        var usedPort: number[] = [];
        for (let port of Object.values<number>(this.getConfFromAllInstance('port') as { [s: string]: number; })) {
            if (port) usedPort.push(...Object.values(port));
        }
        if (usedPort) {
          minPort = Math.max((Math.floor(Math.max(...usedPort) / 10) * 10) + 10, minPort);
        }
        for (var basePort = minPort; basePort <= this.maxPort; basePort++) {
          var free = true;
          for (let i=basePort;i<=num+minPort;i++) {
            if (usedPort.includes(i) || await port.check(basePort)) {
              free = false; 
            }
          }
          if (free) {
            freePort = basePort;
            break;
          }
          //only check for %10 port
          basePort = basePort + 9;
        }
        if (!freePort) {
            ui.error(`No free port found betwen ${minPort} and ${this.maxPort}, close something or check the config`);
        }
        return freePort;
    }


    public getConfFromAllInstance(key:string|null=null): object {
        var output: any = {};
        for (var inst of readdirSync(this.instancesDir)) {
            if (inst.startsWith('.')) continue;
            var instanceConf: any = JSON.parse(FileUtils.readFile(join(this.instancesDir, inst, 'mpdkinstance.json')));
            output[instanceConf.name] = key?instanceConf[key]:instanceConf;
        }
        return output;
    }


    public  getInstance(instance: string|any) {
      instance = (typeof instance ==  'string') ? FileUtils.readFile(join(this.instancesDir, instance, 'mpdkinstance.json')) : instance;
      return (new Instance(this)).load(instance);
    }

    
  
    public getAllInstances(...instances: string[]) {
      return Object.values(this.getConfFromAllInstance()).filter(i => instances.includes(i.name)).map(instConf => {
        return this.getInstance(instConf);
      });
    }

    

    public getInstanceList() {
        var instances = Object.values(this.getConfFromAllInstance());
        return instances.map((i) => {
            return {
                name: i.name,
                path: i.path,
                version: i.version,
                php: i.php,
                plugins: i.plugins,
                status: i.status
            }
        });
    }


    public getInstanceOptions(): { name: string, value: string }[] {
      var instances = [];
      for (var i in this.getConfFromAllInstance()) {
        instances.push({ name: i, value: i });
      }
      return instances;
    }






    //Getters and setters


    get instance() {
      return this._instance
    }
    
    set instance(val: Instance) {
      this._instance = val
    }
    
    get home() {
      return this._home
    }
    
    set home(val: string) {
      this._home = val
    }
    
    get bin() {
      return this._bin
    }
    
    set bin(val: string) {
      this._bin = val
    }
    
    get configDir() {
      return this._configDir
    }
    
    set configDir(val: string) {
      this._configDir = val
    }
    
    get dataDir() {
      return this._dataDir
    }
    
    set dataDir(val: string) {
      this._dataDir = val
    }
    
    get platform() {
      return this._platform
    }
    
    set platform(val: string) {
      this._platform = val
    }
    
    get instancesDir() {
      return this._instancesDir
    }
    
    set instancesDir(val: string) {
      this._instancesDir = val
    }
    
    get pluginsDir() {
      return this._pluginsDir
    }
    
    set pluginsDir(val: string) {
      this._pluginsDir = val
    }
    
    get moodleDir() {
      return this._moodleDir
    }
    
    set moodleDir(val: string) {
      this._moodleDir = val
    }
    
    get moodleDockerDir() {
      return this._moodleDockerDir
    }
    
    set moodleDockerDir(val: string) {
      this._moodleDockerDir = val
    }
    
    get user() {
      return this._user
    }
    
    set user(val: UserInfo) {
      this._user = val
    }
    
    get baseDir() {
      return this._baseDir
    }
    
    set baseDir(val: string) {
      this._baseDir = val
    }
    
    get minPort() {
      return this._minPort
    }
    
    set minPort(val: number) {
      this._minPort = val
    }
    
    get maxPort() {
      return this._maxPort
    }
    
    set maxPort(val: number) {
      this._maxPort = val
    }
    
    get dns() {
      return this._dns
    }
    
    set dns(val: boolean) {
      this._dns = val
    }
    
    get proxy() {
      return this._proxy
    }
    
    set proxy(val: boolean) {
      this._proxy = val
    }
    
    get remoteHost() {
      return this._remoteHost
    }
    
    set remoteHost(val: string) {
      this._remoteHost = val
    }
    
    get browser() {
      return this._browser
    }
    
    set browser(val: string) {
      this._browser = val
    }
    
    get defaultHost() {
      return this._defaultHost
    }
    
    set defaultHost(val: string) {
      this._defaultHost = val
    }
    
    get dev() {
      return this._dev
    }
    
    set dev(val: boolean) {
      this._dev = val
    }
    
    get cacheDir() {
      return this._cacheDir
    }
    
    set cacheDir(val: string) {
      this._cacheDir = val
    }
    
    get logDocker() {
      return this._logDocker
    }
    
    set logDocker(val: boolean) {
      this._logDocker = val
    }

    get defaultInstance() {
      return this._defaultInstance
    }
    
    set defaultInstance(val: any[]) {
      this._defaultInstance = val
    }

    get plugin() {
      return this._plugin
    }
    
    set plugin(val: MoodlePlugin) {
      this._plugin = val
    }

    get github() {
      return this._github
    }
    
    set github(val: GitHubInfo) {
      this._github = val
    }

    get defaultBadge() {
      return this._defaultBadge
    }
    
    set defaultBadge(val: string[]) {
      this._defaultBadge = val
    }

    get copyright() {
      return this._copyright
    }
    
    set copyright(val: string) {
      this._copyright = val
    }

  
    

    
}