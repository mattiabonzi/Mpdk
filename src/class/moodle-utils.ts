import axios from "axios";
import { copyFileSync, existsSync, fstatSync, mkdirSync,  renameSync, statSync, } from "fs";
import { version } from "os";
import { join } from "path";
import axiosThrottle from 'axios-request-throttle';
import debug from "debug";
import * as semver from "semver";
import Mpdk from "./mpdk.js";
import ui from "./ui.js";
import { parse as html } from 'node-html-parser';
import FileUtils from "./file-utils.js";
import { JSONPath } from "jsonpath-plus";
import PhpVarParser from "phpvarparser";



export interface MoodleVersion {
    name: string;
    zipball_url: string;
    tarball_url: string;
    commit: {
        sha: string;
        url: string;
    };
    node_id: string;
    versionInt: string;
    versionName: string;
    version: string;
    branch: string;
    maturity: string;
    php: string;
}

export interface PluginTypeInfo {
    name: string;
    component: string;
    path: string;
    description: string;
    minVersion: string;

}

export default class MoodleUtils {
    public debug = debug('mpdk:moodle-utils');
    public static day = 24 * 60 * 60 * 1000;
    public static shortTimeFrame = 7 * MoodleUtils.day; // 7 days
    public static longTimeFrame = 30 * MoodleUtils.day; // 30 days
    public pluginFile:string;
    public moodleFile:string;
    public typesFile :string;

    private mpdk: Mpdk;

    constructor(mpdk: Mpdk) {
        this.mpdk = mpdk;
        this.pluginFile = join(this.mpdk.cacheDir, 'pluginlist.json');
        this.moodleFile = join(this.mpdk.cacheDir, 'moodlelist.json');
        this.typesFile = join(this.mpdk.cacheDir, 'plugintypes.json');
    }

    public async updateCache(force:boolean = false) {
        if (this.isCacheOutdated() || force) {
            await Promise.all([
            this.updatePluginList(force),
            this.updateMoodleList(force),
            this.upddatePluginTypes(force)
            ]);
          }
    }

    public isCacheOutdated() {
        var now = new Date().getTime() - MoodleUtils.shortTimeFrame;        
        return (!existsSync(this.pluginFile) || 
         statSync(this.pluginFile).mtime.getTime() < now || 
        !existsSync(this.moodleFile) || 
        statSync(this.moodleFile).mtime.getTime() < now || 
        !existsSync(this.typesFile) || 
        statSync(this.typesFile).mtime.getTime() < now);
    }

    public async updatePluginList(force: boolean = false) {
        if (force || !existsSync(this.pluginFile) || statSync(this.pluginFile).mtime.getTime() < new Date().getTime() - MoodleUtils.shortTimeFrame) {
            this.debug('Updating plugin list');
            var content = await axios.get('https://download.moodle.org/api/1.3/pluglist.php');
            FileUtils.writeFile(this.pluginFile, JSON.stringify(content.data));
        }
    }


    public async updateMoodleList(force: boolean = false) {
        //throttle to not bombard github, love you github
        axiosThrottle.use(axios, { requestsPerSecond: 8 });
        if (force || !existsSync(this.moodleFile) || statSync(this.moodleFile).mtime.getTime() < new Date().getTime() - MoodleUtils.shortTimeFrame) {
            this.debug('Updating moodle version list');
            var content: any = {};
            var versionList: any[] = [];
            for (var i = 1; i <= 3; i++) {
                versionList = [...versionList, ...(await axios.get('http://api.github.com/repos/moodle/moodle/tags?per_page=100&page=' + i)).data];
            }

            var promises = versionList.map(async (version: any) => {
                    let versionInfo = (await axios.get<string>('https://raw.githubusercontent.com/moodle/moodle/' + version.name + '/version.php')).data as string;                    
                    version.versionInt = PhpVarParser.parse(versionInfo, {version: 'number'}).version?.substring(0,10);
                    version.versionName = PhpVarParser.parse(versionInfo, {release: 'string'}).release;
                    version.branch = PhpVarParser.parse(versionInfo, {branch: 'string'}).branch;
                    version.maturity = PhpVarParser.parse(versionInfo, {maturity: 'constant'}).maturity;

                    version.version = semver.clean(version.name) as string;
                    if (semver.gt(version.version, '4.1.0')) {
                        version.php = '8.1';
                    } else if (semver.gte(version.version, '3.11.8')) {
                        version.php = '8';
                    } else if (semver.gte(version.version, '3.8.3')) {
                        version.php = '7.4';
                    } else if (semver.gte(version.version, '3.6.4')) {
                        version.php = '7.3';
                    } else if (semver.gte(version.version, '3.4.0')) {
                        version.php = '7.2';
                    } else if (semver.gte(version.version, '3.2.0')) {
                        version.php = '7.1';
                    } else if (semver.gte(version.version, '3.0.1')) {
                        version.php = '7.0';
                    } else {
                        version.php = '';
                    }
                    content[version.name] = version;
            });

            await Promise.all(promises);
            FileUtils.writeFile(this.moodleFile, JSON.stringify(content, null, 3));
        }
    }


    public async upddatePluginTypes(force: boolean = false) {
        if (force || !existsSync(this.typesFile) || statSync(this.typesFile).mtime.getTime() < new Date().getTime() - MoodleUtils.longTimeFrame) {
        var content = await axios.get('https://moodledev.io/docs/apis/plugintypes');
        var document = html(content.data);
        
        
        var types = [...document.querySelectorAll('tbody tr')].map((tr) => {
            
            let cells = tr.childNodes;
            let type =  {
                name: cells[0].childNodes[0].innerText,
                component: cells[1].innerText,
                path: cells[2].innerText,
                description: cells[3].innerText,
                minVersion: cells[4].innerText.match('(\\d\\.\\d)\\+')?.[1]+'.0',
            }
            if (!type.name || !type.component || !type.path || !type.description || !type.minVersion) {
                ui.warn('Something went wrong updating plugin types, please update mpdk or report this bug');
                return null;
            }
            return type;
        })
        FileUtils.writeFile(this.typesFile, JSON.stringify(types, null, 3));
        }
        
    }


    public getVersionInfo(version?: string): MoodleVersion {
        var versionList = this.getVersionList();
        var versionInfo = null;
        var cleaned = semver.coerce(version)?.version as string;
        if (!version || version == 'latest') {
            //Lastest version
            versionInfo = Object.values(versionList)[0];
        } else if (version.match('\\d{10}')) {
            //Version info in form 2023110900 or 2023110900.00
            if (!version.match('\\d{10}\\.\\d{2}')) {
                version = version + '.00';
            }
            versionInfo = JSONPath<string>({path: `$..[?(@.versionInt == "${version}")]`, json: versionList})[0];
        } else if (version.match(/^\d{1,3}\.*\d{0,3}$/g)) {
            //Version info in form 3 or 3.1 (or 3. it will be cleaned)
            if (version.endsWith('.')) {
                version = version.substring(0, version.length-1);
            }
            version = Object.keys(versionList).filter((v:string) => v.startsWith('v'+version)).reduce((max:string, act:string) => {
                act = semver.coerce(act)?.version as string;
                return (!max || (act && semver.gt(act, max))) ? act : max;
            }, '');
            versionInfo = version ? versionList['v'+version] : null;
        } else if (versionList.hasOwnProperty('v'+version)) {
            //Versin in form 3.11.8
            versionInfo = versionList['v'+version];
        } else if (cleaned && versionList.hasOwnProperty('v'+cleaned)) {
            //Version in valid semver form
            versionInfo = versionList['v'+cleaned];
        }
        
        
        if (!versionInfo) {
            ui.error('Version not found, try to update the cache using mpdk update-cache or check the version name (Min version is 3.0)');
        }
        return versionInfo;
    }

    public getVersionLink(version?: string) {
        return this.getVersionInfo(version).zipball_url;
    }


    public getVersionList(): any {
        return JSON.parse(FileUtils.readFile(this.moodleFile));
    }

    public getVersionOptions(limit: number=100): {name: string, value: string}[] {
        var list = this.getVersionList();
        return Object.values<MoodleVersion>(list).filter(plugin => plugin.maturity == 'MATURITY_STABLE').slice(0,limit).map((version) => {
            return {name: version.versionName, value: version.versionInt}
        });
    }

    public getPluginTypesList(): any[] {
        return JSON.parse(FileUtils.readFile(this.typesFile));
    }

    public getPluginTypesOptions(limit: number=100): {name: string, value: string}[] {
        var list = this.getPluginTypesList();
        return list.slice(0,limit).map((type:any) => {
            return {name: type.name, value: type.component}
        });
    }

    public getPluginTypeInfo(type: string): PluginTypeInfo {
        var list = this.getPluginTypesList();
        return list.find((t:any) => t.component == type);
    }

    public getMaturityOptions(): {name: string, value: string}[] {
        return [
            {name: 'Alpha', value: 'MATURITY_ALPHA'},
            {name: 'Beta', value: 'MATURITY_BETA'},
            {name: 'RC', value: 'MATURITY_RC'},
            {name: 'Stable', value: 'MATURITY_STABLE'}
        ];
    }

    public getPluginList(): any[] {
        var o = JSON.parse(FileUtils.readFile(this.pluginFile));
        return o.plugins; 
    }

    public getPluginInfo(component: string):any {
        var list = this.getPluginList();
        return list.find((t:any) => t.component == component);
    }

    public getPluginskelFeaturesOptions(): {name: string, value: string}[] {
        return [
            { name: 'db/install.php', value: 'install'},
            { name: 'db/uninstall.php', value: 'uninstall'},
            { name: 'settings.php', value: 'settings'},
            { name: 'LICENSE.md', value: 'license'},
            { name: 'db/upgrade.php', value: 'upgrade'},
            { name: 'db/upgradelib.php', value: 'upgradelib'},
        ];
    }



    public async downloadMoodle(version:string, path:string, cache:boolean=true) {
        var info = this.getVersionInfo(version);
        var name = 'moodle-'+info.version;
        if (existsSync(join(path,name))) ui.stop('Version already exists here: '+path);
        var archive = join(path,'moodle.zip');
        var cacheDir = join(this.mpdk.cacheDir,info.version);
          if (cache && existsSync(cacheDir)) {
            copyFileSync(archive, join(cacheDir,'moodle.zip'));
            return;
          }
          await FileUtils.download(path, 'moodle.zip', info.zipball_url);
          if (cache) {
            mkdirSync(cacheDir);
            copyFileSync(archive, join(cacheDir,'moodle.zip'));
          }
        await FileUtils.unzip(archive, path, true);
        renameSync(join(path,'moodle'), join(path,name));
    }

    public static getMaturity(m: number): string {
        var o = 'MATURITY_ALPHA';
        switch (m) {
            case 200 : return 'MATURITY_STABLE';break;
            case 150 : return 'MATURITY_RC';break;
            case 100 : return 'MATURITY_BETA';break;
            case 50 : return 'MATURITY_ALPHA';break;
            default:
                ui.error('Maturity not found, something strange happened, please report this issue');
                break;
        }
        return o;
    }

    



    /**
     * Description placeholder
     * @date 2/3/2023 - 1:04:16 PM
     *
     * @deprecated Use MoodleUtils.getVersionLink instead
     * @public
     * @async
     * @param {?string} [v]
     * @returns {unknown}
     */
    public async buildVersionLink(v?: string) {
        var link = null;
        var version = v ?? 'latest';
        if (version == 'latest') {
            this.debug('Getting last version link from moodle.org');
            var document = await axios.get('https://download.moodle.org/releases/latest/');
            link = html.parse(document.data).querySelector('tr:nth-child(2) > td:nth-child(4) > a')?.getAttribute('href');
            link = link?.replace('download.php', 'download.php/direct');
            if (link) {
                var parts = link.split('/');
                version = parts[parts.length - 1];
                version = version.substring(7, version.length - 4);
            } else {
                ui.error('Something went wrong fetching the lastest version, try use a specific version')
            }

        } else if (version.includes('latest-')) {
            var branch = version.substring(7, version.length);
            link = `https://download.moodle.org/download.php/direct/stable${branch}/moodle-latest${version}.zip`;
        } else {
            var hasPatch = version.split('.').length == 3;
            version = semver.coerce(version) as any;
            var info = semver.parse(version);
            if (!info) {
                ui.error('Not a valid Moodle version: ' + version);
            }

            var branch = '';
            //Set the branch
            if (semver.gte(version, '4.0.0')) {
                let minor = ('' + info.minor).padStart(2, '0')
                branch = `${info.major}${minor}`
            } else {
                branch = `${info.major}${info.minor}`
            }

            if (hasPatch) {
                if (info.patch == 0) version = `${info.major}.${info.minor}`;
                link = `https://download.moodle.org/download.php/direct/stable${branch}/moodle-${version}.zip`;
            } else {
                link = `https://download.moodle.org/download.php/direct/stable${branch}/moodle-latest-${info.major}${info.minor}.zip`;
            }


        }
        if (!link) {
            ui.error("Unable to build a valid url, use syntax 'x.x.x', 'x.x' or 'x' to specify the version");
        }
        return { version: version, link: link };
    }





}

