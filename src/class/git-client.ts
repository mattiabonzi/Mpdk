import debug from "debug";
import Mpdk from "./mpdk.js";
import MoodlePlugin from "./plugin.js";
//@ts-ignore
import Git from "nodegit";
import FileUtils from "./file-utils.js";
import { existsSync } from "fs";
import { join } from "path";

export default abstract class  GitClient {
    public debug = debug('mpdk:git-client');

    protected plugin: MoodlePlugin;
    protected mpdk: Mpdk;
    protected repo: Git.Repository;
    
    
    protected abstract authCallback:any;
    public abstract getAllTag(): Promise<any>;
    public abstract createRemote(): Promise<any>;


    public constructor(plugin: MoodlePlugin, mpdk: Mpdk) {
        this.plugin = plugin;
        this.mpdk = mpdk;
     
    }

    public async load() {
        if (this.plugin.useGit) {
            if (existsSync(join(this.plugin.path, '.git'))) {
                this.debug('Loading gitnode');
                this.repo = await Git.Repository.open(this.plugin.path, 0);
                this.debug('Gitnode loaded: '+this.repo.path());
            } else this.debug('Repository not found, not loading for now');
        }
    }

    public async initRepo() {
        this.plugin.debug('Init git repo');
        this.repo = await Git.Repository.init(this.plugin.path, 0);
        this.debug('Gitnode loaded: '+this.repo.path());
        if (this.plugin.gitUrl) this.addRemote();
      }

      public async commit(message: string, ...files: string[]) {
        var sign = Git.Signature.create(this.mpdk.user.name, this.mpdk.user.email, Math.round(Date.now()/1000), 0);
        if (files.length == 0) {
          files = [];
          var files = FileUtils.getContent(this.plugin.path);
        }
        this.plugin.debug('Committing "%s", files :%s, signature:', message, files, sign.toString());
        await this.repo.createCommitOnHead(files, sign, sign, message);
      }

      public async addRemote(name: string='origin', url: string=this.plugin.gitUrl) {
        this.plugin.debug('Adding remote: %s', this.plugin.gitUrl);
        if (this.repo)await Git.Remote.create(this.repo, name, url);
        
        
      }


      public async push(branch: string='master', name: string='origin') {
        this.plugin.debug('Pushing to %s', name);
        var remote = await this.repo.getRemote(name);
        await remote?.push([`refs/heads/${branch}:refs/heads/${branch}`], this.authCallback);
      }

      public async createBranch(name:string) {
        this.plugin.debug('Creating branch: %s', name);
        await this.repo.createBranch(name, await this.repo.getHeadCommit(), true);
        
      }

      public async setbranch(name:string) {
        this.plugin.debug('Checkout branch: %s', name);
        await this.repo.checkoutBranch(name);
      }

      public async tag(name: string, message: string = '') {
        this.plugin.debug('Creating tag: %s', name);
        var commit = await this.repo.getBranchCommit('master');
        if (commit) this.repo.createTag(commit.sha(), name, message);
      }


}