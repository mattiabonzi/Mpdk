import { existsSync, mkdirSync, readdirSync, rm, rmdirSync, rmSync, statSync, unlink, } from "node:fs";
import { join } from "path";
import HasSetting from "./base-setting.js";
import Mpdk from "./mpdk.js";
import ui from "./ui.js";

import Instance from "./instance.js";
import MoodleUtils from "./moodle-utils.js";

//@ts-ignore
import Git from "nodegit";
import { Octokit } from "@octokit/rest";
import format from 'dateformat';
import debug from 'debug';
import FileUtils from "./file-utils.js";
import Generator from "./generator.js";
import PhpVarParser from "phpvarparser";
import GitClient from "./git-client.js";
import GitHubClient from "./github-client.js";
import axios from "axios";
import Utils from "./general-utils.js";



export interface PluginVersion {
  version: string;
  versionInt: number;
  branch: string;
  maturity: string;
  link: string;
  moodleMinVersion: number;
  moodleMaxVersion: number;
  moodleTestedVersion: string[];
  pushed: boolean;
  released: boolean;
}

export interface NewPluginOptions {
  type: string;
  shortname: string;
  name: string;
  features: string[];
  privacy: boolean
  minVersion: number;
  versionInt: number;
  version: string;
  maturity: string;
  editmanually: boolean;
  git: boolean;
  grunt: boolean;
  readme: boolean;
  desc: string;
  pluginReq: string;
}

export interface ExistingPluginOptions {
  version?: string,
  requires?: string,
  component: string,
  maturity?: string,
  release?: string,
  dependencies?: any,
  supported?: any,
  incompatible?: any,
  name?: string,
}

export interface PluginRequirements {
  plugin: string[];
  other: string[];
}

export default class MoodlePlugin extends HasSetting {
  public debug = debug('mpdk:plugin');

  private _mpdk: Mpdk;
  private _repo: GitClient | undefined;
  private _name: string = '';
  private _shortname: string = '';
  private _component: string = '';
  private _path: string = '';
  private _relativePath: string = '';
  private _type: string = '';
  private _version: string = '';
  private _useGit: boolean = false;
  private _recipeFile: string = '';
  private _defaultInstance: string = '';
  private _typeName: string = '';
  private _useGrunt: boolean = false;
  private _description: string = '';
  private _requirements: PluginRequirements = { plugin: [], other: [] };
  private _screenshot: string = '';
  private _badge: string[] = [];
  private _owner: string = '';
  private _gitName: string = '';
  private _instances: string[] = [];
  //keep as last
  private _versions: PluginVersion[] = [];




  public constructor(mpdk: Mpdk) {
    super();
    this._mpdk = mpdk;
  }

  public async load(setting: any): Promise<MoodlePlugin> {
    this.fromJSON(setting)
    if (this.useGit) {
      this.debug('Loading git client');
      this.repo = await GitHubClient.get(this, this.mpdk);
    }

    return this;
  }

  public toJSON() {
    var obj: any = super.toJSON();
    delete obj.mpdk;
    delete obj.repo;
    return obj;
  }


  public async new(options: NewPluginOptions) {
    if (this.path) {
      ui.stop('A plugin is already defined, make sure you are NOT inside an instance directory');
    }
    if (options.shortname.match(/[^a-z0-9]/)) {
      ui.stop('The shortname can only contain lowercase letters and numbers');
    }
    var utils = new MoodleUtils(this.mpdk);
    this.component = options.type + '_' + options.shortname;
    this.path = join(this.mpdk.pluginsDir, this.component);
    if (existsSync(this.path)) ui.stop('Plugin already exists');
    mkdirSync(this.path);

    this.configFile = join(this.path, 'mpdkplugin.json');
    var info = utils.getPluginTypeInfo(options.type);

    await this.load({
      ...options,
      recipeFile: join(this.path, 'recipe.yaml'),
      useGit: options.git,
      relativePath: info.path,
      typeName: info.name,
      defaultInstance: this.mpdk.instance.name
    });


    this.newVersion({
      version: this.version,
      versionInt: options.versionInt,
      branch: '',
      maturity: options.maturity,
      moodleMinVersion: options.minVersion,
      moodleMaxVersion: 0,
      moodleTestedVersion: [],
      pushed: false,
      link: '',
      released: false
    });

    if (options.pluginReq) {
      this.requirements.plugin = Utils.spaceOrCommaList(options.pluginReq);
    }
    this.saveSetting();

    Generator.createPluginSkelRecipe(this, options);
    if (options.editmanually) {
      ui.info('Edit the recipe.yaml file manually in ' + this.recipeFile);
      return;
    }

    this.debug('Checking if instance is running and in dev mode')
    if (!this.mpdk.instance.status.dev) ui.error('The instance is not in dev mode');
    if (!this.mpdk.instance.status.running) ui.error('The instance is not running');

    this.debug('Creating plugin with pluginskel');
    var cmd = "php admin/tool/pluginskel/cli/generate.php --target-moodle=/var/www/html /opt/mpdk/myplugins/" + this.component + "/recipe.yaml";
    var result = (await this.mpdk.instance.docker?.exec(cmd, false));
    var warning = [...result.matchAll('WARNING: (.*?)\\n')].map(e => e[1]);

    this.debug('Checking if plugin is created')
    try {
      var ls = (await this.mpdk.instance.docker?.exec(`ls ${join('/var/www/html/', this.relativePath, this.shortname)}`, false));
    } catch (error) {
      ui.error('Error creating plugin');
    }
    if (!ls.includes('version.php')) ui.error('Error creating plugin');

    this.debug('Writing waring file :%s', join(this.path, 'warning.tofix.txt'));
    FileUtils.writeFile(join(this.path, 'warning.tofix.txt'), warning.join('\n'));

    this.debug('Moving plugin to shared dir');
    var cmds = [
      `mv /opt/mpdk/myplugins/${this.component} /opt/mpdk/myplugins/tmp-${this.component}`,
      `mv /var/www/html/${this.relativePath}/${this.shortname} /opt/mpdk/myplugins/${this.component}`,
      `mv /opt/mpdk/myplugins/tmp-${this.component}/* /opt/mpdk/myplugins/${this.component}/`,
      `rm -rf /opt/mpdk/myplugins/tmp-${this.component}`
    ];
    await this.mpdk.instance.docker?.exec(cmds.join(' && '), true);
    
    await this.install(this.mpdk.instance);
    this.debug('Writing README.md file');
    Generator.readme(this);

    if (this.useGrunt) {
      this.debug('Creating gruntfile and init grunt');
      Generator.packageJson(this);
    }



    if (this.useGit) {
      this.debug('Creating and init git repo and branch');
      await this.repo?.createRemote();
      await this.repo?.initRepo();
      await this.repo?.commit('Initial commit');
      await this.repo?.push();
      var branch = 'dev_' + format(new Date(), 'yyyymmdd')
      await this.repo?.createBranch(branch);
      await this.repo?.push(branch);
    }




    this.debug('Plugin created');

    //Export info
  }

  public rollback_new(name: string) {

    rmSync(join(this.mpdk.pluginsDir, name), { recursive: true });
  }


  public async add(name: string, options: ExistingPluginOptions) {
    if (this.path) {
      ui.stop('A plugin is already defined, make sure you are NOT inside an instance directory');
    }
    var utils = new MoodleUtils(this.mpdk);
    this.path = join(this.mpdk.pluginsDir as string, name);

    var type = options.component?.split('_')[0];
    var typeInfo = utils.getPluginTypeInfo(type);
    var pluginInfo = utils.getPluginInfo(options.component);

    options = {
      ...options, ...{
        version: options.release,
        versionInt: options.version,
        type: type,
        shortname: options.component?.split('_')[1],
        configFile: join(this.path, 'mpdkplugin.json'),
        relativePath: typeInfo.path,
        typeName: typeInfo.name
      }
    }
    this.useGit = true;
    await this.load(options);

    //Try to get versions info from Moodle directory first then from GitHub
    if (pluginInfo) {
      pluginInfo.versions.forEach((v: any) => {
        this.versions.push(this.parseMoodlePluginVersion(v));
      });

    } else {
      ui.warn('Plugin not found in Moodle directory');
      if (this.useGit && this.owner && this.gitName) {
        ui.warn('Trying to get version list from GitHub if available');
        var tagInfo = await this.repo?.getAllTag();
        if (tagInfo) {
          this.versions.push(...(await Promise.all(tagInfo.map((tag: any) => {
            return this.parseGitPluginVersion(tag);
          }))));
        } else {
          ui.warn('No version found');
        }
      }
    }


  }





  public async install(instance: string | Instance, stop: boolean = true): Promise<boolean> {
    instance = (typeof instance == 'string') ? this.mpdk.getInstance(instance) : instance;
    if (this.instances.includes(instance.name)) {
      var msg = 'Plugin already installed on instance ' + instance.name;
      this.debug(msg);
      return stop ? ui.stop(msg) : ui.warn(msg);
    }
    this.debug('Installing plugin on instance %s', instance.name);
    if (!instance.status.running) {
      var msg = 'Instance ' + instance.name + ' is not running';
      this.debug(msg);
      return stop ? ui.stop(msg) : ui.warn(msg);
    }
    await instance.docker?.exec(`ln -s /opt/mpdk/myplugins/${this.component} /var/www/html/${this.relativePath}/${this.shortname}`);
    var result = await instance.docker?.exec(`php admin/cli/upgrade.php --non-interactive --allow-unstable --lang=en`, false);
    console.log(result);
    
    if (result.includes('completed successfully')) {
      this.instances.push(instance.name);
      instance.plugins.push(this.component);
      return true;
    }
    ui.warn('Error installing plugin on instance : ' + instance.name);
    ui.warn(result);
     return false;
  }



  public async installToMany(...instances:string[]) {
    await Promise.all(this.mpdk.getAllInstances(...instances).map(i => {
      return this.install(i, false)
    }));
  }


  public async uninstall(instance: string | Instance, stop: boolean = false): Promise<boolean> {
    instance = (typeof instance == 'string') ? this.mpdk.getInstance(instance) : instance as Instance;
    if (!instance.status.running) {
      return stop ? ui.stop('The instance is not running') : false;
    }
    var result = await instance.docker?.exec('php admin/cli/uninstall_plugins.php --run --plugins='+this.component, false);
    console.log(result);
    if (result.includes('Success')) {
      await instance.docker?.exec(`rm -rf /var/www/html/${this.relativePath}/${this.shortname}`);
      result = await instance.docker?.exec('php admin/cli/upgrade.php --non-interactive --allow-unstable --lang=en', false);
      if (result.includes('completed successfully')) {
        console.log(result);
        //@ts-ignore hate you typescript
        this.instances = this.instances.filter(i => i != instance.name);
        instance.plugins = instance.plugins.filter(p => p != this.component);
        return true;
      }
    } 
    ui.warn('Error uninstalling plugin (maybe it was not installed)');
    ui.warn(result);
    return false;

  }

  public async uninstallFromMany(...instances:string[]) {
    await Promise.all(this.mpdk.getAllInstances(...instances).map(async i => {
      return this.uninstall(i);
    }));
  }





  private async parseGitPluginVersion(tag: any): Promise<PluginVersion> {
    let content = (await axios.get<string>(`https://raw.githubusercontent.com/${this.owner}/${this.gitName}/${tag.name}/version.php`)).data as string;
    var versionInfo = MoodlePlugin.parseVersionFile(content);
    var version: PluginVersion = {
      version: tag.name,
      versionInt: versionInfo.version,
      branch: '',
      maturity: versionInfo.maturity,
      link: tag.zipball_url,
      moodleMinVersion: versionInfo.requires,
      moodleMaxVersion: 0,
      moodleTestedVersion: versionInfo.supported,
      pushed: true,
      released: false
    };

    return version;
  }


  private parseMoodlePluginVersion(v: any): PluginVersion {
    var version: PluginVersion = {
      version: v.release.split(' ')[0],
      versionInt: v.version,
      branch: v.vcsbranch,
      maturity: MoodleUtils.getMaturity(v.maturity),
      link: v.downloadurl,
      moodleMinVersion: 0,
      moodleMaxVersion: 0,
      moodleTestedVersion: v.supportedmoodles.map((e: any) => e.version),
      pushed: true,
      released: true
    };
    version.moodleMinVersion = parseInt(version.moodleTestedVersion[0]);
    version.moodleMaxVersion = parseInt(version.moodleTestedVersion[version.moodleTestedVersion.length - 1]);
    return version;
  }


  public newVersion(version: PluginVersion) {
    this.versions.push(version);
  }

  public static parseVersionFile(content: string) {
    return PhpVarParser.parse(content, {
      'version': 'number',
      'requires': 'number',
      'component': 'string',
      'maturity': 'constant',
      'release': 'string',
      'dependencies': 'array',
      'supported': 'array',
      'incompatible': 'array',
    }, '\\$plugin->', false);
  }

  public static parseExistingPlugin(path: string): ExistingPluginOptions {
    var versionFile = join(path, 'version.php');
    var info: any = this.parseVersionFile(FileUtils.readFile(versionFile));
    info = {
      ...info,
      version: info.release,
      versionInt: info.version,
      type: info.component?.split('_')[0],
      shortname: info.component?.split('_')[1],
      configFile: join(path, 'config.php'),
      minVersion: info.requires
    }
    var langFile = join(path, 'lang', 'en', info.component + '.php');
    var gitFile = join(path, '.git', 'config');
    var packageJson = join(path, 'package.json');

    if (existsSync(langFile)) {
      info.name = PhpVarParser.parse(FileUtils.readFile(langFile), { "string\\['pluginname'\\]": 'string' })["string\\['pluginname'\\]"];
    }
    if (existsSync(gitFile)) {
      var giturl = FileUtils.readFile(gitFile).matchAll(new RegExp('url\\s*?=\\s*?https:\\/\\/github\\.com\\/(.*?)\\/(.*?)\\.git', 'g')) as any
      if (giturl) {
        giturl = [...giturl][0];
        info.owner = giturl[1];
        info.gitName = giturl[2];
      }
    }
    if (existsSync(packageJson)) {
      info.useGrunt = true;
    }






    return info;
  }

  public getlastVersion(): PluginVersion {
    return {} as PluginVersion;
  }









  // Getters and setters

  get mpdk() {
    return this._mpdk
  }

  set mpdk(val: Mpdk) {
    this._mpdk = val
  }

  get name() {
    return this._name
  }

  set name(val: string) {
    this._name = val
  }

  get path() {
    return this._path
  }

  set path(val: string) {
    this._path = val
  }

  get relativePath() {
    return this._relativePath.startsWith('/') ? this._relativePath.substring(1) : this._relativePath
  }

  set relativePath(val: string) {
    this._relativePath = val
  }

  get type() {
    return this._type
  }

  set type(val: string) {
    this._type = val
  }

  get version() {
    return this._version
  }

  set version(val: string) {
    this._version = val
  }



  get useGit() {
    return this._useGit
  }

  set useGit(val: boolean) {
    this._useGit = val
  }

  get gitUrl() {
    return 'https://github.com/' + this.owner + '/moodle-' + this.component + '.git';
  }


  get versions() {
    return this._versions
  }

  set versions(val: PluginVersion[]) {
    this._versions = val
  }

  get shortname() {
    return this._shortname
  }

  set shortname(val: string) {
    this._shortname = val
  }

  get component() {
    return this._component
  }

  set component(val: string) {
    this._component = val
  }


  get recipeFile() {
    return this._recipeFile
  }

  set recipeFile(val: string) {
    this._recipeFile = val
  }

  get defaultInstance() {
    return this._defaultInstance
  }

  set defaultInstance(val: string) {
    this._defaultInstance = val
  }

  get typeName() {
    return this._typeName
  }

  set typeName(val: string) {
    this._typeName = val
  }

  get useGrunt() {
    return this._useGrunt
  }

  set useGrunt(val: boolean) {
    this._useGrunt = val
  }


  get repo() {
    return this._repo
  }

  set repo(val: GitClient | undefined) {
    this._repo = val
  }



  get description() {
    return this._description
  }

  set description(val: string) {
    this._description = val
  }

  get requirements() {
    return this._requirements
  }

  set requirements(val: PluginRequirements) {
    this._requirements = val
  }

  get badge() {
    return this._badge
  }

  set badge(val: string[]) {
    this._badge = val
  }


  get screenshot() {
    return this._screenshot
  }

  set screenshot(val: string) {
    this._screenshot = val
  }

  get owner() {
    return this._owner
  }

  set owner(val: string) {
    this._owner = val
  }

  get gitName() {
    return this._gitName
  }

  set gitName(val: string) {
    this._gitName = val
  }

  get instances() {
    return this._instances
  }

  set instances(val: string[]) {
    this._instances = val
  }





}

