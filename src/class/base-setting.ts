import debug from 'debug';
import { } from "node:fs";
import FileUtils from './file-utils.js';
import ui from "./ui.js";

export default abstract class HasSetting {

    protected _configFile:string = '';

      get configFile() {
        return this._configFile
      }

      set configFile(val: string) {
        this._configFile = val
      }

    public toJSON(){
        var obj:any = {};
        for (let prop in this) {
          if (typeof this[prop] == 'function') {
            continue;
          }
          obj[prop.substring(1, prop.length)] = this[prop];
        }
        return obj;
      }


      public fromJSON(obj:any){
        for (let prop in obj) {
          if (this.hasOwnProperty('_'+prop)) {
            this[prop as keyof typeof this] = obj[prop];
          }
        }
        return obj;
      }

    public saveSetting() {
      HasSetting.saveSetting(this.toJSON());
    }

    public static saveSetting(setting:any) {
      ui.debug('Saving setting to: ' + setting.configFile);
      if (!setting.configFile) {
        ui.error('Something really bad happened. Please report this bug (no-setting-file).');
      }
      FileUtils.writeFile(setting.configFile, JSON.stringify(setting, null, 3));
    }
    
}