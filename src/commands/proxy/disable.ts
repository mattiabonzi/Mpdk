
import BaseCommand from '../../class/base-command.js';
import ui from '../../class/ui.js';
import Proxy from '../../class/proxy.js';




export default class DnsEnable extends BaseCommand<typeof DnsEnable> {
  static description = 'Stop an instance (data will NOT be destroyed)'


  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]


  public async run(): Promise<void> {
    try {
        ui.action.start('Disabling Proxy');
        await (new Proxy(this.mpdk)).disable();
        this.success("Proxy disabled");
    } catch (e) {
      ui.throw(e);
    }

  }
}
