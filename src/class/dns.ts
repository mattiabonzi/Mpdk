import DockerClient from "./docker.js";
import { join  } from 'path';
import ui from "./ui.js";
import Mpdk from "./mpdk.js";
import Proxy from "./proxy.js";



export default class Dns {

    private mpdk: Mpdk;
    private docker: DockerClient;
    private workDir: string;
    private configDir: string;

    constructor(mpdk: Mpdk) {
        this.mpdk = mpdk;
        this.workDir = join(this.mpdk.dataDir, 'mpdk-docker', 'proxy');
        this.docker = new DockerClient(this.workDir);
        this.configDir = join(this.mpdk.configDir, 'dns');
    }

    public async enable() {
        this.docker = this.docker ?? new DockerClient(this.workDir);
        if (!this.mpdk.proxy) {
            ui.stop('Proxy must be enabled before enabling dns, run "mpdk proxy enable"');
        }
        //TODO: find a way to set dns automatically
        var run = `run --name mpdk-dns --network=localdev -p 53:53/udp -p 53:53/tcp -v${this.configDir}:/app/conf -v /var/run/docker.sock:/var/run/docker.sock --restart=always -d defreitas/dns-proxy-server`
        await this.docker.cmd(run);
        await (new Proxy(this.mpdk)).createVh('dns', 'dns.mpdk', 'mpdk-dns')
        this.mpdk.dns = true;
        ui.warn("At the moment, you still need to manually set your dns to 127.0.0.1, rembber to backup your dns setting");
    }


    public async disable() {
        //TODO: find a way to set dns automatically
        await this.docker.cmd('stop mpdk-dns');
        await this.docker.cmd('rm mpdk-dns');
        await (new Proxy(this.mpdk)).removeVH('dns');
        this.mpdk.dns = false;
        ui.warn("Remebmer to restore your dns setting, or set Google (8.8.8.8) or Cloudflare (1.1.1.1)");
    }
}