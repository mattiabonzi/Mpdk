import { join  } from "path";
import * as os  from "node:os";

export default class Setting {

    static instance: Setting;

    private home:string = "";
    private bin:string = "";
    private configDir:string = "";
    private configFile:string = "";
    private dataDir:string = "";
    private platform:string = "";
    private instancesDir:string = "";
    private pluginsDir:string = "";
    private moodleDir:string = "";
    private moodleDockerDir:string = "";
    private user:string = "";
    private baseDir:string = "";
    private minPort:number = 10000;
    private maxPort:number = 10100;
    private dns:boolean = true;
    private proxy:boolean = true;
    private remoteHost:string = '';
    private browser:string = "chrome";
    private defaultHost:string = ".moodle.dev";
    private dev:boolean = true;
    private cacheDir:string = "";
    private logDocker:boolean = false


    static getInstance(config:InitialConfig): Setting {
        if (!Setting.instance) {
            Setting.instance = new Setting(config);
        }
        return Setting.instance;
    }

    private constructor(config:InitialConfig) {
        this.home = config.home;
        this.configDir = config.configDir;
        this.dataDir = config.dataDir;
        this.platform = config.platform;
        this.configFile = join(config.configDir, 'config.json');
        this.user = `${os.userInfo().username} @${os.userInfo().username}`;
        this.baseDir = join(config.home, 'Moodle-plugin');
    }

}


interface InitialConfig {
    home:string;
    configDir:string;
    dataDir:string;
    platform:string;
}