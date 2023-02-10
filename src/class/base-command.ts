import { Command, Config, Flags, Interfaces, settings } from '@oclif/core'
import { env, cwd, getuid } from "node:process";
import color from '@oclif/color';
import { join, basename } from 'path';
import { existsSync, realpathSync, renameSync } from 'fs';
import Mpdk from './mpdk.js';
import Instance from './instance.js';
import MPlugin from './plugin.js';
import { realpath } from 'node:fs';
import ui from './ui.js';
import FileUtils from './file-utils.js';
import MoodleUtils from './moodle-utils.js';




export type Flags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCommand['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export default abstract class BaseCommand<T extends typeof Command> extends Command {

  protected cname = 'base';
  protected mpdk: Mpdk = Mpdk.get(join(this.config.configDir, 'config.json'));



  protected opt!: Flags<T>
  protected arg!: Args<T>

  static baseFlags = {
    'test-config-file': Flags.string({ description: 'Only used for testing, do not use this option', hidden: true }),
  }

  public static instanceFlag = { instance: Flags.string({ char: 'i', description: 'Provide a nane or path to an instance to use' }) }
  public static pluginFlag = { plugin: Flags.string({ char: 'p', description: 'Provide a nane or path to an instance to use' }) }


  public constructor(argv: string[], config: Config) {
    if ('OCLIF_TESTING_CONFIG') {
      try {
        var testConfig = { ...config, ...(JSON.parse(env['OCLIF_TESTING_CONFIG'] as string)) } as Config;
        config = mergeConfig(config, testConfig)
      } catch (e) { }
    }

    super(argv, config);

    function mergeConfig(config: any, testConfig: any): Config {
      for (let prop in testConfig) {
        config[prop] = testConfig[prop];
      }
      return config as Config;
    }
  }



  protected async init() {
    this.debug("Start initialization");

    //Parse option and argument
    await super.init()
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.opt = flags as Flags<T>;
    this.arg = args as Args<T>;



    //Dev mode
    if (process.env['DEBUG'] || basename(this.config.options.root) == 'dev' || basename(this.config.options.root) == 'dev.js') {
      process.env['MPDK_DEV'] = 'true';
      this.mpdk.dev = true;
    }




    //Che if system is isnatlled
    if (!existsSync(this.mpdk.configFile)) {
      if (this.cname == 'install') {
        this.debug('Install command, skipping initializations');

      } else {
        ui.error(`Must install first, run mpdk install`);
      }
    } else {
      //Instances
      this.debug("Guess the right instances");
      var instancePath = '';
      if (flags.instance) {
        if (existsSync(join(flags.instance, 'mpdkinstance.json'))) {
          this.debug('Using provied path as instance');
          instancePath = flags.instance;
        } else if (existsSync(join(this.mpdk.instancesDir, flags.instance, 'mpdkinstance.json'))) {
          this.debug('Using provied name as instance');
          instancePath = join(this.mpdk.instancesDir, flags.instance);
        } else {
          ui.error('The path provided must be an existing instance!');
        }
      } else {
        this.debug('Guessing the instance form CWD');
        var back = '';
        for (var i = 0; i < 20; i++) {
          let p = join(process.cwd(), back, 'mpdkinstance.json');
          if (existsSync(p)) {
            instancePath = realpathSync(join(process.cwd(), back));
            this.debug(`Found instance config "${instancePath}" at level -${i}`);
            break;
          }
          back += '../';
        }
      }


      //Plugin
      this.debug("Guess the right plugin");
      var pluginPath = '';
      if (flags.plugin) {
        if (existsSync(join(flags.plugin, 'mpdkplugin.json'))) {
          this.debug('Using provied path as plugin');
          pluginPath = flags.plugin;
        } else if (existsSync(join(this.mpdk.pluginsDir, flags.plugin, 'mpdkplugin.json'))) {
          this.debug('Using provied name as plugin');
          pluginPath = join(this.mpdk.pluginsDir, flags.plugin);
        } else {
          ui.error('The path provided must be an existing plugin!');
        }
      } else {
        this.debug('Guessing the plugin form CWD');
        var back = '';
        for (var i = 0; i < 20; i++) {
          let p = join(process.cwd(), back, 'mpdkplugin.json');
          if (existsSync(p)) {
            pluginPath = realpathSync(join(process.cwd(), back));
            this.debug(`Found plugin config "${pluginPath}" at level -${i}`);
            break;
          }
          back += '../';
        }
      }


      //load plugin
      if (pluginPath && existsSync(pluginPath)) {
        var settings = { ...(JSON.parse(FileUtils.readFile(join(pluginPath, 'mpdkplugin.json')))) };
        await this.mpdk.plugin.load(settings);
        if (!instancePath) {
          instancePath = join(this.mpdk.instancesDir, this.mpdk.plugin.defaultInstance);
        }
      }


      //Load instance
      if (instancePath && existsSync(instancePath)) {
        var settings = { ...(JSON.parse(FileUtils.readFile(join(instancePath, 'mpdkinstance.json')))) };
        this.mpdk.instance.load(settings);
      }


      //Update versions cache
      var utils = new MoodleUtils(this.mpdk);
      if (utils.isCacheOutdated()) {
        ui.action.start('Cache is outdated, updating cache');
        await utils.updateCache();
        ui.action.stop('Cache updated');
      }

    }
    this.debug("Finished initialization");
  }

  protected success(message?: string, ...args: any[]) {
    this.onCleanExit();
    ui.success(message, ...args);
  }

  protected onCleanExit() {
    this.debug('Running exit hooks');
    this.mpdk.saveSetting();
    if (this.mpdk.instance.path) this.mpdk.instance.saveSetting();
    if (this.mpdk.plugin.path) this.mpdk.plugin.saveSetting();
  }

  protected requireInstance() {
    this.mpdk.instance.path || ui.error('An instance must be defined to run this command!');
  }

  protected getNonInteractiveJsonOptions(options: any) {
    if (options) {
      try {
        return JSON.parse(options);
      } catch (error) {
        ui.warn('Check if your command actually need an argument');
        ui.error("The provided json option is not a valid json document! " + options,);
      }
    }
    return {};
  }





}
