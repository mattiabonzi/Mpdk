import { spawn } from 'child_process';
import { existsSync } from 'node:fs';
import { join } from 'path';
import _debug from 'debug';
const debug = _debug('oclif:test:interactiveCommand');







/**
 * Description placeholder
 * @date 8/2/2023 - 03:49:49
 *
 * @export
 * @param {string[]} args [command, ...args] array of arguments, the first element is the command name
 * @param {string[]} stdin array of strings to be sent to the cli as stdin, use the constant [ENTER, DOWN, UP] for keyboard navigation
 * @param {number} [timeout=100] timeout between each stdin string is sent
 * @param {number} [quitTimeout=-1] timeout before the cli is killed, if -1 not imeout is set (yuo will have to manage it yourself)

 */
export default function exec(args: string[], stdinList: { [key: string]: string[] }|null = null, prefix:string='#', suffix:string=':', answerTimeout:number=1000, quitTimeout: number = -1) {
  return {
    async run(ctx: any) {
      
      return await new Promise<void>((resolve, reject) => {

       
        if (stdinList && stdinList.hasOwnProperty('*')) {
          stdinList[escapeRegex(prefix)+'.*?'+escapeRegex(suffix)] = stdinList['*'];
          delete stdinList['*'];
        }

        function escapeRegex(str:string) {
          return str.replace(/[\|\{\}\(\)\[\]\^\$\+\*\?\.\\]/gi, '\\$&');
       }


        var lastMatch:string|null = null;
        async function writeStdin(list: any, handle: string) {
          var arr = handle.split(prefix);
          var trim =  prefix+' '+arr[arr.length-1].trim();
          if (lastMatch &&trim.includes(lastMatch)) { 
            return;
          }

          var key = Object.keys(list).find((k) => trim.match(new RegExp(k, 'i')));
          
          if (key) {
            lastMatch = key.split(suffix)[0].trim();
            var value = list[key];     
            debug('Answering to: "%s" (match: "'+key+'") with: ', trim,  value);
            for (var str of value) {
              await new Promise((resolve) => setTimeout(resolve, 100));
              proc.stdin.write(str);
            }
          }
        }

        if (!ctx.config) {
          reject(new Error('No config found, have you called .loadConfig() before running this command?'));
        }

        ctx.expectation = ctx.expectation || `runs ${args.join(' ')}`;
        ctx.timeout = false;



        if (quitTimeout != -1) {
          setTimeout(() => {
            ctx.timeout = true;
            proc.kill();
            reject('Test timeout');
          }, quitTimeout);
        }


        var bin = join(ctx.config.root, 'bin/dev.js');
        if (!existsSync(bin)) {
          bin = join(ctx.config.root, 'bin/dev')
          if (!existsSync(bin)) {
            bin = join(ctx.config.root, ctx.config.pjson.bin[ctx.config.bin]);
            if (!existsSync(bin)) {
              reject(new Error('Cannot find the binary'));
            }
          }
        }

        debug('Running: ' + bin + ' ' + args.join(' '));
        var proc = spawn(bin, args, { stdio: [null, null, null] });

        //@ts-ignore
        proc.stdin.setEncoding('utf-8');
        proc.stdout.setEncoding('utf-8');
        proc.stderr.setEncoding('utf-8');

        //On exit
        proc.on('close', function (code) {
          debug('Command finished, Exit code: ' + code);
          proc.stderr.removeAllListeners();
          proc.stdout.removeAllListeners();
          proc.stdin.end();
          ctx.exitCode = code;
          resolve();
        });

          //On stdout message
          var buffer:string = '';
          var stdinTimeout: NodeJS.Timeout|null = null;
          proc.stdout.on('data', function (data) {
            process.stdout.write(data);
            if (!stdinList) return;
            //Avoid parsing "delete line"
            if (data.match('\\033\\[2K')) {
              buffer = '';
              return;
            }
            //Get rid of bad ascii characters
            buffer +=data.trim().replace( /\u001Bc*\[*[0-9]*[HABCDEFGJKsu];*[0-9]*/gi, '').replaceAll('\n', '');
            //If the line end iwth a cursor move, parse the content
            if (data.match('\\033\\[\\d+C$')) {
              //Only if is elapsed at least 2s from the last message, otherwise refresh the timeout
              if (stdinTimeout) stdinTimeout.refresh();
              else stdinTimeout = setTimeout(() => { 
                writeStdin(stdinList, buffer);
                buffer = '';
              }, answerTimeout);
            }
  
          });



        //On stderr message
        proc.stderr.on('data', function (data) {
          process.stderr.write(data);
        })


      });
    },
  };
}


export const interactiveCommand = exec;
export const DOWN = '\x1B\x5B\x42';
export const UP = '\x1B\x5B\x41';
export const ENTER = '\x0D';


function write(char: string, num?: number) {
  var str: string | string[] = char;
  if (num == 0) str = [''];
  if (num) {
    str = [];
    for (var i = 0; i < num; i++) {
      str.push(char);
    }
  }
  return str;
}

function _down(): string;
function _down(num: number): string[];
function _down(num?: number): string | string[] {
  return write(DOWN, num);
}

function _up(): string;
function _up(num: number): string[];
function _up(num?: number): string | string[] {
  return write(UP, num);
}

function _enter(): string;
function _enter(num: number): string[];
function _enter(num?: number): string | string[] {
  return write(ENTER, num);
}

export const down = _down;
export const up = _up;
export const enter = _enter;


