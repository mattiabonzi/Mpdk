import GitClient from "./git-client.js";
import { Octokit } from "@octokit/rest";
//@ts-ignore
import Git from "nodegit";
import debug from "debug";
import ui from "./ui.js";
import MoodlePlugin, { PluginVersion } from "./plugin.js";
import Mpdk from "./mpdk.js";



export default class GitHubClient extends GitClient {
    public debug = debug('mpdk:github-client');
    protected client = new Octokit();


    public static async get(plugin: MoodlePlugin, mpdk: Mpdk): Promise<GitHubClient> {
        var i = new GitHubClient(plugin, mpdk);
        await i.load();
        return i;
    }


    private constructor(plugin: MoodlePlugin, mpdk: Mpdk) {
        super(plugin, mpdk);
        if (this.mpdk.github.token) {
            this.client = new Octokit({ auth: mpdk.github.token });
        }
    }


    protected authCallback: any = {
        callbacks: {
            certificateCheck: () => {
                return 1;
            },
            credentials: (url: string, username: string) => {
                return Git.Credential.userpassPlaintextNew(this.mpdk.github.token, "x-oauth-basic");
            }
        }
    };


    public async createRemote() {
        if (!this.mpdk.github.token) ui.error('No github token found');
        if (!this.mpdk.github.username) ui.error('No github username found');
        var options: any = {
            name: 'moodle-' + this.plugin.component,
            description: this.plugin.description ?? `Moodle ${this.plugin.typeName} plugin: ${this.plugin.name}`,
            private: false,
            has_issues: true,
            has_projects: false,
            has_wiki: true
        };
        this.plugin.debug('Creating remote: %s', options.name);
        if (this.plugin.description) options.description = this.plugin.description;
        if (this.mpdk.github.org) {
            options.org = this.mpdk.github.org;
            this.plugin.debug('Creating project in org: %s', options);
            await this.client.repos.createInOrg(options);
        } else {
            this.plugin.debug('Creating project in user: %s', options);
            await this.client.repos.createForAuthenticatedUser(options);
        }
        var owner = this.mpdk.github.org ?? this.mpdk.github.username;
        this.plugin.owner = owner;
        this.plugin.gitName = options.name;
        await this.client.rest.repos.replaceAllTopics({
            owner: owner,
            repo: options.name,
            names: ['moodle', 'moodle-plugin', 'moodle-' + this.plugin.type],
        });


    }



    public async getAllTag(): Promise<{
        name: string;
        commit: {
            sha: string;
            url: string;
        };
        zipball_url: string;
        tarball_url: string;
        node_id: string;
    }[]> {
        this.debug('Getting all tags for %s/%s', this.plugin.owner, this.plugin.gitName);
        return (await this.client.rest.repos.listTags({
            owner: this.plugin.owner,
            repo: this.plugin.gitName,
            per_page: 100
        })).data;
    }
}