import { join, resolve } from "node:path";
import * as semver from "semver";
import { mkdirSync, existsSync,  rmSync,  rmdirSync } from 'node:fs';
import Mpdk from "./mpdk.js";
import ui from "./ui.js";
import MoodleDockerClient from "./docker-compose.js";
import * as Mustache from "mustache";
import Proxy from "./proxy.js";
import HasSetting from "./base-setting.js";
import debug from 'debug';
import MoodleUtils from "./moodle-utils.js";


export interface InstanceStatus { phpunit: boolean; behat: boolean; dev: boolean; running: boolean; }
export interface InstancePort { web: number; db: number; webdb: number; xdebug: number; }

export default class Instance extends HasSetting {
  public debug = debug('mpdk:instance');

  private _mpdk: Mpdk;
  private _docker: MoodleDockerClient | undefined;

  private _db: string = 'pgsql';
  private _dbUser: string = 'moodle';
  private _dbPassword: string = 'moodle';
  private _webUser: string = 'admin';
  private _webPassword: string = 'admin';
  private _externalServices: boolean = false;
  private _path: string = '';
  private _name: string = '';
  private _hostname: string = '';
  private _php: string = '';
  private _version: string = '';
  private _dbVersion: string = '';
  private _versionLink: string = '';
  private _log: string = '';
  private _plugins: string[] = [];
  private _port: InstancePort = { web: 0, db: 0, webdb: 0, xdebug: 0 };
  private _status: InstanceStatus = { phpunit: false, behat: false, dev: false, running: false };

  

  public constructor(mpdk: Mpdk) {
    super();
    this._mpdk = mpdk;
  }

  public load(setting: any): Instance {
    this.fromJSON(setting);
    if (this.path) {
      this.docker = new MoodleDockerClient(this.mpdk);
    }
    return this;
  }

  public toJSON() {
    var obj: any = super.toJSON();
    delete obj.docker;
    delete obj.mpdk;
    return obj;
  }




  public async new(mpdk: Mpdk, name: string, version: string = 'latest', options?: any) {
    if (this.path) {
      ui.stop('An instance is already defined, make sure you are NOT inside an instance directory');
    }
    this.path = join(this.mpdk.instancesDir as string, name);
    if (existsSync(this.path)) {
      ui.stop('An instance with the same name already exist');
    }
  
  
    //merge options
    this.load({
      ...options,
      path: this.path,
      configFile: join(this.path, 'mpdkinstance.json'),
      name: name,
      hostname: name + this.mpdk.defaultHost,
      log: join(this.path, 'log')
    });

    //get Moodle real version and number
    var moodleInfo = (new MoodleUtils(this.mpdk)).getVersionInfo(version);
    this.version = moodleInfo.version;
    this.versionLink = moodleInfo.zipball_url;
    this.php = moodleInfo.php;
    //get some free ports, then lock them
    var basePort = await mpdk.getFreePort(3);
    this.port = {
      web: basePort,
      db: basePort + 1,
      webdb: basePort + 2,
      xdebug: basePort + 3
    }
    //Create dir
    mkdirSync(this.path);
    if (!existsSync(this.path)) {
      ui.error('Something went wrong creating the instance directory! ' + this.path);
    }
    mkdirSync(join(this.path, 'log'));
    this.saveSetting();
    return this.mpdk.instance;
  }

  public rollback_new(name: string) {
    rmSync(join(this.mpdk.instancesDir, name), { recursive: true, force: true });
  }

  public async start(dev: boolean = true, phpunit: boolean = false, behat: boolean = false) {
    this.debug('Starting instance');
    this.status.running = true;
    await this.docker?.cmd('up --detach');
    this.debug('Instance up and running');
    await this.init(dev, phpunit, behat);
    if (this.mpdk.proxy) {
      (new Proxy(this.mpdk)).createInstanceVH(this.mpdk.instance);
    }
  }

  public async init(dev: boolean, phpunit: boolean, behat: boolean) {
    this.debug('Instance init');
    var promises: Promise<void>[] = [];
    if (dev && !this.status.dev) {
      this.debug('Init dev isntance');
      promises.push(this.initDev());

    }
    if (phpunit && !this.status.phpunit) {
      this.debug('Init phpunit isntance');
      promises.push(this.initPhpunit());
      
    }
    if (behat && !this.status.behat) {
      this.debug('Init behat isntance');
      promises.push(this.initBehat());
      
    }
    this.debug('Waiting for init instance');
    var output = await Promise.all(promises);
    this.debug('Restarting webserver');
    await this.docker?.cmd('restart webserver');
    this.debug('Finished init instance, saving setting');
    this.saveSetting();
    return output;
  }

  public async initPhpunit() {
    //For some reason sometimes fail to run composer in phpunit script, so run it before
    await this.docker?.exec('composer install')
    await this.docker?.exec('php admin/tool/phpunit/cli/init.php --disable-composer')
    this.status.phpunit = true;
  }

  public async initBehat() {
    //For some reason sometimes fail to run composer in behat script, so run it before
    await this.docker?.exec('composer install')
    await this.docker?.exec('php admin/tool/behat/cli/init.php --disable-composer')
    this.status.behat = true;
  }

  public async initDev() {
    var xdebughost = 'localhost';
    if (this.mpdk.platform == 'win32') {
      xdebughost = 'host.docker.internal'
    }
    await Promise.all([
      this.docker?.exec(`printf "xdebug.mode = debug\\nxdebug.client_host = ${xdebughost}\\n" > /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini`),
      this.docker?.exec('mv /opt/mpdk/assets/codechecker /var/www/html/local/codechecker'),
      this.docker?.exec('mv /opt/mpdk/assets/moodlecheck  /var/www/html/local/moodlecheck'),
      this.docker?.exec('mv /opt/mpdk/assets/pluginskel  /var/www/html/admin/tool/pluginskel'),
    ]);
    await Promise.all([
      this.docker?.exec(`php admin/cli/install_database.php --agree-license --fullname="${this.name}" --shortname="${this.name}" --summary="${this.name}" --adminpass="admin" --adminemail="admin@example.com"`),
      this.docker?.exec('docker-php-ext-enable xdebug')
    ]);

    this.status.dev = true;
  }

  public async stop() {
    this.status.running = false;
    if (this.mpdk.proxy) {
      await (new Proxy(this.mpdk)).removeInstanceVH(this.mpdk.instance, false);
    }
    await this.docker?.cmd('stop');
  }

  public async down() {
    this.status = { dev: false, phpunit: false, behat: false, running: false };
    if (this.mpdk.proxy) {
      await (new Proxy(this.mpdk)).removeInstanceVH(this.mpdk.instance, false);
    }
    await this.docker?.cmd('down');
  }

  public async remove() {
    await this.down();
    rmSync(this.path, { recursive: true });
    if (this.mpdk.proxy) {
      (new Proxy(this.mpdk)).removeInstanceVH(this.mpdk.instance, false);
    }
  }

  public async ps() {
    var output = await this.docker?.cmd(`ps --format json`, false);    
    return JSON.parse(output.raw.trim());
  }











  //Getter and setter

  get docker() {
    return this._docker
  }

  set docker(val: MoodleDockerClient | undefined) {
    this._docker = val
  }

  get db() {
    return this._db
  }

  set db(val: string) {
    this._db = val
  }

  get dbUser() {
    return this._dbUser
  }

  set dbUser(val: string) {
    this._dbUser = val
  }

  get dbPassword() {
    return this._dbPassword
  }

  set dbPassword(val: string) {
    this._dbPassword = val
  }

  get webUser() {
    return this._webUser
  }

  set webUser(val: string) {
    this._webUser = val
  }

  get webPassword() {
    return this._webPassword
  }

  set webPassword(val: string) {
    this._webPassword = val
  }

  get externalServices() {
    return this._externalServices
  }

  set externalServices(val: boolean) {
    this._externalServices = val
  }

  get path() {
    return this._path
  }

  set path(val: string) {
    this._path = val
  }

  get name() {
    return this._name
  }

  set name(val: string) {
    this._name = val
  }

  get hostname() {
    return this._hostname
  }

  set hostname(val: string) {
    this._hostname = val
  }

  get php() {
    return this._php
  }

  set php(val: string) {
    this._php = val
  }

  get version() {
    return this._version
  }

  set version(val: string) {
    this._version = val
  }

  get versionLink() {
    return this._versionLink
  }

  set versionLink(val: string) {
    this._versionLink = val
  }

  get log() {
    return this._log
  }

  set log(val: string) {
    this._log = val
  }

  get plugins() {
    return this._plugins
  }

  set plugins(val: string[]) {
    this._plugins = val
  }

  get status() {
    return this._status
  }

  set status(val: InstanceStatus) {
    this._status = val
  }

  get mpdk() {
    return this._mpdk
  }

  set mpdk(val: Mpdk) {
    this._mpdk = val
  }

  get dbVersion() {
    return this._dbVersion
  }

  set dbVersion(val: string) {
    this._dbVersion = val
  }

  get port() {
    return this._port
  }

  set port(val: InstancePort) {
    this._port = val
  }




}


