import Plugin, { NewPluginOptions } from './plugin.js';
//@ts-ignore
import Mustache from 'mustache';
import { join } from 'path';
import Mpdk from './mpdk.js';
import { existsSync } from 'fs';
import debug from 'debug';
import FileUtils from './file-utils.js';
import * as yaml from  "write-yaml-file";

export default class Generator {
    public static debug = debug('mpdk:generator');

    public static readme(plugin: Plugin) {
        //Get data
        var req = '';
        var rel = plugin.relativePath;
        if (rel.startsWith('/')) rel = rel.substring(1);
        if (plugin.requirements.plugin) {
            if (plugin.requirements.plugin.length > 0) {
                req += `### Plugins\n\n ${plugin.name} plugin requires the following plugins:\n\n`;
                plugin.requirements.plugin.forEach((p: string) => {
                    req += `- [${p}](https://moodle.org/plugins/${p})\n`;
                })
            }
            if (plugin.requirements.other.length > 0) {
                req += `### Plugins\n\n ${plugin.name}\n\n`;
                plugin.requirements.other.forEach((r: string) => {
                    req += `- {r}\n}`;
                })
            }

        }
        var data = {
            name: plugin.name,
            type: plugin.type,
            shortname: plugin.shortname,
            rel_path: plugin.relativePath,
            banner: plugin.screenshot,
            badge: plugin.badge.join(' ') + plugin.mpdk.defaultBadge.join(' '),
            min_moodle: plugin.getlastVersion().moodleMinVersion,
            requirements: req,
            github_repo: plugin.gitUrl,
            copyright: plugin.mpdk.copyright,
        }

        //Get template
        var template = Mustache.render(FileUtils.readFile(join(plugin.mpdk.dataDir, 'template', 'README.md')), data);
        var readme = join(plugin.path, 'README.md')
        if (existsSync(readme)) {
            var tags = ["HEADER", "HEADER", "SHORT-DESCRIPTION", "DESCRIPTION", "TOK", "REQUIREMENTS", "INSTALL", "SUPPORT", "CONTRIB", "LICENSE"];
            var existingFile = FileUtils.readFile(readme);
            tags.forEach((tag) => {
                tag = tag.toUpperCase();
                var mdTagRegex = new RegExp(`<!--MPDK-${tag}-->.*?<!--\/MPDK-${tag}-->`, 'gs');
                var sourceMatch = template.match(mdTagRegex);
                if (sourceMatch) {
                    existingFile.replace(mdTagRegex, sourceMatch[0]);
                }
            });
            template = existingFile;
        }

        //Write file
        FileUtils.writeFile(readme, template);
    }


    public static packageJson(plugin: Plugin) {
        var data = {
            name: plugin.name,
            private: true
        }
        FileUtils.writeFile(join(plugin.path, 'package.json'), JSON.stringify(data, null, 3));
    }

    public static createPluginSkelRecipe(plugin: Plugin, options: NewPluginOptions) {
        var yamlFile = {
            copyright: plugin.mpdk.user.name + ' <'+plugin.mpdk.user.email+'>',
            component: plugin.component,
            release: options.version,
            version: options.versionInt,
            requires: options.minVersion,
            maturity: options.maturity,
            name: plugin.name,
            privacy: options.privacy,
            features: options.features
        };
        this.debug('Creating recipe YAML file :%s', JSON.stringify(yamlFile));
        yaml.sync(plugin.recipeFile, yamlFile);
    }

}