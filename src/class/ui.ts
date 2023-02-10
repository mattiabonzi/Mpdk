import { Command, Errors } from '@oclif/core';
import { color } from '@oclif/color';
import { format, inspect } from 'util'
import { ux } from '@oclif/core/lib/cli-ux/index.js';
import { PrettyPrintableError } from '@oclif/core/lib/interfaces/errors';
import { stringify } from 'querystring';
import { CLIError } from '@oclif/core/lib/errors';
import debug from 'debug';
import chalk from 'chalk';
export default class ui extends ux {



  public static log(message = '', ...args: any[]): void {
    message = format(typeof message === 'string' ? message : inspect(message), ...args);
    
      process.stdout.write(`[${color.blue('INFO')}] ${message}\n`)
    
  }

  public static output(output:any, newLine:boolean=true): void {
    if(typeof output !== 'string') JSON.stringify(output);
    process.stdout.write(output+(newLine?'\n':''));
  } 


  /**
   * Stop the execution and throw an error, the message is shown to the user, alongside the stack if in dev mode
   * @date 1/27/2023 - 2:17:50 PM
   *
   * @public
   * @static
   * @param {string} msg Message to show to the user
   * @param {(Error | null)} [error=null] Error object to be thrown (wil be created from msg if not provided)
   * @param {number} [code=1] Exit code (1-255)
   * @param {boolean} [rethrow=true] If false, the error will not be thrown
   */
  public static error(msg: string, error: Error | null = null, code: number = 1, rethrow=true): never {
    ux.action.stop('cancelling');
    
      process.stderr.write(`[${color.red('ERROR')}] ${msg}\n`);
      if (rethrow) {
        if (process.env['MPDK_DEV'] && error)  process.stderr.write(`[${color.red('DETAILS')}] ${error.message}\n`); 
        throw Errors.error(error ?? new Error(msg));
      }

    process.exit(code);
  }


  public static throw(e:any) {
    if (process.env['MPDK_DEV']) {
        throw e;
    } else {
      process.stdout.write(`[${color.red('ERROR')}] ${e.message}\n`);
    }
  }



  /**
   * Stop the execution, show an error to the user, without actualt throwing it (so the rollback functio n is not caleld)
   * @date 1/27/2023 - 2:15:41 PM
   *
   * @public
   * @static
   * @param {string} msg Message to show to the user
   * @param {number} [code=1] Exit code (1-255)
   */
  public static stop(msg: string, code: number = 1): never {
    ui.error(msg, null, code, false);
  }

  public static warn(message: string): boolean {
    
      process.stdout.write(`[${color.yellow('WARNING')}] ${message}\n`)
    
    return false;
  }



  public static success(message = '', ...args: any[]): never {
    ux.done();
    message = format(typeof message === 'string' ? message : inspect(message), ...args);
    
      process.stdout.write(`[${color.green('SUCCESS')}] ${message}\n`)
    
    process.exit(0);
  }


  public static debug = debug('mpdk:inner');


  public static heading(message = '', ...args: any[]):void {
    process.stdout.write("\n"+chalk.blue.bold(format(message, ...args))+"\n");
  }


}