
import Downloader from "nodejs-file-downloader";
import { createReadStream, readdirSync, readFileSync, statSync, unlink, unlinkSync, writeFileSync } from "node:fs";
import * as unzipper from "unzipper";
import ui from "./ui.js";
import { join } from "node:path";
import debug from "debug";

export default class FileUtils {
    public static debug = debug('mpdk:fileutils');

    public static writeFile(path: string, content: string) {
        //use a single point for writing files
        this.debug('Writing file ' + path);
        return writeFileSync(path, content);
    }

    public static readFile(path: string) {
        //use a single point for writing files
        this.debug('Reading file ' + path);
        return readFileSync(path).toString();
    }
    
    
    public static async download(path: string, filname: string, url: string) {
        const downloader = new Downloader({
            url: url, 
            directory: path, 
            fileName: filname
        });
        this.debug('Downloading file from ' + url + ' to ' + path + ' as ' + filname + '...');
        const { filePath } = await downloader.download();
        return filePath;
    }



    public static unzip(archive: string, path: string, removeArchive: boolean = true) {
        return new Promise<void>((res) => {
            createReadStream(archive).pipe(unzipper.Extract({ path: path }))
                .on('close', function () {
                    if (removeArchive) unlinkSync(archive);
                    res();
                })
                .on('error', (err: any) => {
                    ui.error(err);
                });
        });
    }




    public static getContent(dir: string, files_: string[] = [], relative_ = ''): string[] {
        var ignore = ['.git', '.', '..'];
        readdirSync(dir).forEach(file => {
            if (!ignore.includes(file)) {
                var absolute = join(dir, file);
                var relative = join(relative_, file);
                if (statSync(absolute).isDirectory()) {
                    this.getContent(absolute, files_, relative);
                } else {
                    files_.push(relative);
                }
            }
        });
        return files_;
    }
}




