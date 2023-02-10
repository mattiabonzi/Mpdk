import DockerClient from "./docker.js";
import { join  } from 'path';
import ui from "./ui.js";
import { existsSync, unlink, unlinkSync, } from "fs";
import Mpdk from "./mpdk.js";
import * as Mustache from "mustache";
import * as hostfile from "hostile";
import FileUtils from "./file-utils.js";



export default class Proxy {

    private mpdk: any;
    private configDir: string;
    private docker: DockerClient;

    constructor(mpdk: Mpdk) {
        this.mpdk = mpdk;
        this.configDir = join(this.mpdk.configDir, 'proxy');
        this.docker = new DockerClient();
    }

    public async enable() {
        try {
            var netwrok = "network create -d bridge --attachable localdev"
            var run = `run -d --name mpdk-proxy --network=localdev -p 80:80 -v ${this.configDir}:/etc/nginx/conf.d nginx:latest`;
            if (!(await this.docker.cmd('network inspect localdev')).raw.includes('localdev'))
                await this.docker.cmd(netwrok);
            await this.docker.cmd(run);
            this.mpdk.proxy = true;
            this.createAllVH()
        } catch (e: any) {
            this.rollback_enable();
            ui.error('Error enabling proxy', e);
        }
    }

    public async rollback_enable() {
        await this.docker.cmd('network rm localdev');
        await this.docker.cmd('rm -f mpdk-proxy');
    }

    public async disable() {
        if (this.mpdk.dns) {
            ui.stop('DNS must be disabled before disabling proxy, run "mpdk dns disable"');
        }
        try {
            await this.docker.cmd('network rm localdev');
        } catch(e:any) {
            ui.warn(e.message);
        } 
        try {
            await this.docker.cmd('stop mpdk-proxy');
            await this.docker.cmd('rm mpdk-proxy');
        } catch(e:any) {
            ui.warn(e.message);
        } 
        this.mpdk.proxy = false;
        this.removeAllVH();
    }


    public async createInstanceVH(instance: any, reload: boolean = true) {
        try {
            await this.createVh(instance.name, instance.hostname, `${instance.name}-webserver-1`, reload);
        } catch (e: any) {
            ui.error('Error writing nginx config for instance ' + instance.name, e);
        }
        
        if (this.mpdk.autoProxy) {
            ui.warn(`Will fail if you don't have sudo access, you can run, you can edit maually the /etc/hosts file and add the following line: 127.0.0.1 ${instance.hostname}`);
            hostfile.set('127.0.0.1', instance.name);
        }

    }


    public async createVh(name:string, hostname:string, dockername:string, reload: boolean = true) {
        FileUtils.writeFile(join(this.configDir, name + '.conf'), this.getTemplate(hostname, dockername));
        if (reload) {
            await this.docker.cmd('exec mpdk-proxy nginx -s reload');
        }
    }


    public async removeVH(name: any, reload: boolean = true) {
        var file = join(this.configDir, name + '.conf');
        if (existsSync(file)) unlinkSync(file);
        if (reload) {
            await this.docker.cmd('exec mpdk-proxy nginx -s reload');
        }
    }


    public async removeInstanceVH(instance: any, reload: boolean = true) {
        await this.removeVH(instance.name, reload)
    }

    public async createAllVH() {
        Object.values(this.mpdk.getConfFromAllInstance()).forEach(async (instance:any) => {
            if (instance.running)
                await this.createInstanceVH(instance, false);
        });
        await this.docker.cmd('exec mpdk-proxy nginx -s reload');
    }


    public async removeAllVH() {
        Object.values(this.mpdk.getConfFromAllInstance()).forEach(async (instance) => {
            await this.removeInstanceVH(instance, false);
        });
        await this.docker.cmd('exec mpdk-proxy nginx -s reload');
    }

    private getTemplate(hostname: string, dockername: string) {
        return `server {
        listen 80;
        listen [::]:80;
    
        server_name ${hostname};
            
        location / {
            proxy_pass http://${dockername};
            proxy_set_header Host ${hostname};
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }`;
    }


}