import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let _APPLICATION_ROOT: string | null = null;
let _PROJECT_ROOT: string | null = null;
let _SCRIPT_MAIN: string | null = null;
let _SCRIPT_ROOT: string | null = null;

const COMMON_BUILD_DIRECTORIES = ['/bin', '/.bin', '/build', '/dist', '/lib', '/out', '/target'];

function _commonPrefix(...paths: string[]): string {
  if(paths.length === 0) throw new Error('No paths provided');
  if(paths.length === 1) return paths[0]!;
  for(let i = 0; i < paths[0]!.length; i++){
    const char = paths[0]![i];
    for(let j = 1; j < paths.length; j++){
      if(i >= paths[j]!.length || paths[j]![i] !== char) return paths[0]!.substring(0, i);
    }
  }
  return paths[0]!;
}

function _removeLineAndColumnNumbers(path: string): string {
  let end = path.length;
  let prevEnd = path.length + 1;
  for(let j = 0; j < 2; j++) {
    end = path.lastIndexOf(':', prevEnd - 1);
    if(end < 0 || isNaN(parseInt(path.substring(end + 1, prevEnd), 10)))
      return path; // no more ':' found or not a number -> cannot have line and column numbers anymore
    prevEnd = end;
  }
  return path.substring(0, end);
}

function _removeBuildDirectory(path: string | null): string | null {
  if(!path) return path;
  const lastSlash = path.lastIndexOf('/');
  if(lastSlash < 0) return path;
  const dir = path.substring(lastSlash);
  for(const buildDir of COMMON_BUILD_DIRECTORIES) {
    if(dir === buildDir) return path.substring(0, lastSlash);
  }
  return path;
}

function _cleanUpStackTraceLineCandiate(path: string): string {
  path = _removeLineAndColumnNumbers(path);
  path = path.startsWith('file:') ? path.substring(5) : path;
  path = path.startsWith('///') ? path.substring(3) : path;
  return path;
}

function _cleanUpStackTraceLine(line: string): string[] {
  const result: string[] = [];

  // all brackets
  let start = 0;
  let end = 0;
  do {
    start = line.indexOf('(', start);
    if (start < 0) break;
    start++;
    end = start;

    // find closing bracket
    let countOpening = 1;
    do {
      const idx1 = line.indexOf('(', end);
      const idx2 = line.indexOf(')', end);
      if (idx1 < 0 && idx2 < 0) {
        countOpening = -1;
        break;
      }

      if (idx1 >= 0 && idx1 < idx2) {
        // another opening bracket found
        countOpening++;
        end = idx1 + 1;
      } else {
        // closing bracket found
        countOpening--;
        end = idx2 + (countOpening === 0 ? 0 : 1);
      }
    } while (countOpening > 0);
    if (countOpening < 0) break;

    const path = _cleanUpStackTraceLineCandiate(line.substring(start, end).trim().replaceAll('\\', '/'));
    if(path.length > 0) result.push(path);
    start = end + 1;
  } while (start < line.length);

  // all 'file:'
  start = 0;
  do {
    start = line.indexOf('file:', start);
    if (start < 0) break;
    start += 5;
    
    const end1 = line.indexOf(')', start);
    const end2 = line.indexOf(' ', start);
    const end3 = line.indexOf(',', start);
    const end4 = line.indexOf(';', start);
    const end5 = line.indexOf('\n', start);

    end = Math.min(
      end1 < 0 ? Number.MAX_SAFE_INTEGER : end1,
      end2 < 0 ? Number.MAX_SAFE_INTEGER : end2,
      end3 < 0 ? Number.MAX_SAFE_INTEGER : end3,
      end4 < 0 ? Number.MAX_SAFE_INTEGER : end4,
      end5 < 0 ? Number.MAX_SAFE_INTEGER : end5,
      line.length
    );

    const path = _cleanUpStackTraceLineCandiate(line.substring(start, end).trim().replaceAll('\\', '/'));
    if(path.length > 0) result.push(path);
    start = end + 1;
  } while(start < line.length);

  return result;
}



function _extractFromStackTrace(): { SCRIPT_MAIN: string; SCRIPT_ROOT: string } {
  let SCRIPT_MAIN: string | null = null;
  let SCRIPT_ROOT: string | null = null;

  const originalStackTraceLimit = Error.stackTraceLimit;
  if(originalStackTraceLimit !== undefined) Error.stackTraceLimit = Infinity;

  try {
    throw new Error();
  } catch (ex: any) {
    const lines = ex.stack.toString().split('\n');
    let found = false;
    for(let i = lines.length - 1; i >= 0 && !found; i--){
      const line = lines[i].trim();

      const candidatePaths = _cleanUpStackTraceLine(line);
      for(let c = 0; c < candidatePaths.length && !found; c++){
        const candidatePath = candidatePaths[c];

        if(
          candidatePath.lastIndexOf('.') < 0 ||
          candidatePath.startsWith('internal/modules/') ||
          candidatePath.startsWith('node:') ||
          candidatePath.startsWith('webpack-internal:') ||
          candidatePath.lastIndexOf('/webpack-runtime.') >= 0 ||
          candidatePath.lastIndexOf('/next/dist') >= 0 ||
          candidatePath.startsWith('index ')
        )
          continue;

        //  if (candidatePath === SCRIPT_MAIN && path.lastIndexOf('/.next/server') < 0) break;

        // next middleware (special case)
        let end = candidatePath.lastIndexOf('/.next/dev/server/');
        if (end >= 0 && SCRIPT_MAIN && SCRIPT_ROOT) {
          const fileName = SCRIPT_MAIN.substring(SCRIPT_ROOT.length + 1);
          SCRIPT_ROOT = candidatePath.substring(0, end);
          SCRIPT_MAIN = SCRIPT_ROOT! + (SCRIPT_ROOT!.endsWith('/') ? '/' : '') + fileName.substring(fileName.startsWith('/') ? 1 : 0);
          found = true;
          break;
        }

        SCRIPT_MAIN = candidatePath;
        end = candidatePath.lastIndexOf('/node_modules/');
        end = end < 0 ? candidatePath.lastIndexOf('/.next/server') : end;
        end = end < 0 ? candidatePath.lastIndexOf('/') : end;
        SCRIPT_ROOT = end > 0 ? candidatePath.substring(0, end + 1) : candidatePath;
        SCRIPT_ROOT = SCRIPT_ROOT!.endsWith('/') ? SCRIPT_ROOT!.substring(0, SCRIPT_ROOT!.length - 1) : SCRIPT_ROOT;

        found = true;
      }
    }
  }
  if(originalStackTraceLimit !== undefined) Error.stackTraceLimit = originalStackTraceLimit;
  return { SCRIPT_MAIN: SCRIPT_MAIN!, SCRIPT_ROOT: SCRIPT_ROOT! };
}




function _getMonoRepoRoot(path: string): string | null {
  const parentDir = dirname(path);
  const parentDirName = basename(parentDir);
  if(parentDirName !== 'apps' && parentDirName !== 'packages') return null;
  const monoRepoRoot = dirname(parentDir);
  const packageJson = join(monoRepoRoot, 'package.json');
  if (!existsSync(packageJson)) return null;
  return monoRepoRoot;
}

function _computeProjectRoot(applicationRoot: string | null, scriptRoot: string | null): string | null {
  if(applicationRoot){
    const monoRepoRoot = _getMonoRepoRoot(applicationRoot);
    if(monoRepoRoot) return monoRepoRoot;
  }
  if(scriptRoot){
    const monoRepoRoot = _getMonoRepoRoot(scriptRoot);
    if(monoRepoRoot) return monoRepoRoot;
  }
  if(applicationRoot && scriptRoot) return _commonPrefix(applicationRoot, scriptRoot);
  return null;
}



function _init(){

  // process.cwd()
  if(typeof process !== 'undefined' && (process as any)?.cwd){
    const cwd = process.cwd().replaceAll('\\', '/');
    if(cwd && cwd.length > 0) _APPLICATION_ROOT = _removeBuildDirectory(cwd) || cwd;
  }

  // import.meta.url
  if(typeof import.meta !== 'undefined' && import.meta?.url){
    const url = import.meta.url;
    if(url && url.length > 0){
      const path = fileURLToPath(url).replaceAll('\\', '/');
      if(path && path.length > 0){
        _SCRIPT_MAIN = path;
        _SCRIPT_ROOT = dirname(path);
      }
    }
  }

  // stack trace
  const { SCRIPT_MAIN, SCRIPT_ROOT } = _extractFromStackTrace();
  _SCRIPT_MAIN = SCRIPT_MAIN || _SCRIPT_MAIN;
  _SCRIPT_ROOT = SCRIPT_ROOT || _SCRIPT_ROOT;

  // project root
  _PROJECT_ROOT = _computeProjectRoot(_APPLICATION_ROOT, _SCRIPT_ROOT) || _PROJECT_ROOT || _APPLICATION_ROOT || _SCRIPT_ROOT;

  // fallback
  _APPLICATION_ROOT = _APPLICATION_ROOT || _removeBuildDirectory(_SCRIPT_ROOT) || '';
  _PROJECT_ROOT = _PROJECT_ROOT || _APPLICATION_ROOT || '';
  _SCRIPT_ROOT = _SCRIPT_ROOT || _APPLICATION_ROOT || '';

  // clean up
  _APPLICATION_ROOT = (_APPLICATION_ROOT && _APPLICATION_ROOT.endsWith('/')) ? _APPLICATION_ROOT.substring(0, _APPLICATION_ROOT.length - 1) : _APPLICATION_ROOT;
  _PROJECT_ROOT = (_PROJECT_ROOT && _PROJECT_ROOT.endsWith('/')) ? _PROJECT_ROOT.substring(0, _PROJECT_ROOT.length - 1) : _PROJECT_ROOT;
  _SCRIPT_ROOT = (_SCRIPT_ROOT && _SCRIPT_ROOT.endsWith('/')) ? _SCRIPT_ROOT.substring(0, _SCRIPT_ROOT.length - 1) : _SCRIPT_ROOT;
}


/**
 * Returns the absolute path to the root directory of the application (never ends with '/').
 * If the project is a Monorepo, this will return the root of the app that is currently running, not the root of the Monorepo.
 * @returns Absolute path to the root directory of the application (never ends with '/').
 */
export function getApplicationRoot(): string {
  if(_APPLICATION_ROOT === null) _init();
  return _APPLICATION_ROOT!;
}

/**
 * Returns the absolute path to the root directory of the project (never ends with '/').
 * If the project is a Monorepo, this will return the root of the Monorepo.
 * @returns Absolute path to the root directory of the project (never ends with '/').
 */
export function getProjectRoot(): string {
  if(_PROJECT_ROOT === null) _init();
  return _PROJECT_ROOT!;
}

/**
 * Returns the absolute path to the main file of the script that got invoked.
 * @returns Absolute path to the main file of the script that got invoked.
 */
export function getScriptMain(): string {
  if(_SCRIPT_MAIN === null) _init();
  return _SCRIPT_MAIN!;
}

/**
 * Returns the absolute path to the root directory of the script that got invoked (never ends with '/').
 * @returns Absolute path to the root directory of the script that got invoked (never ends with '/').
 */
export function getScriptRoot(): string {
  if(_SCRIPT_ROOT === null) _init();
  return _SCRIPT_ROOT!;
}

const lupRoot = {

  /**
   * Absolute path to the root directory of the application (never ends with '/').
   * If the project is a Monorepo, this will return the root of the app that is currently running, not the root of the Monorepo.
   */
  get APPLICATION_ROOT(): string {
    return getApplicationRoot();
  },

  /**
   * Absolute path to the root directory of the project (never ends with '/').
   * If the project is a Monorepo, this will return the root of the Monorepo.
   */
  get PROJECT_ROOT(): string {
    return getProjectRoot();
  },

  /**
   * Absolute path to the main file of the script that is currently running and that got initially invoked.
   */
  get SCRIPT_MAIN(): string {
    return getScriptMain();
  },

  /**
   * Absolute path to the root directory of the script that is currently running and that got initially invoked (never ends with '/').
   */
  get SCRIPT_ROOT(): string {
    return getScriptRoot();
  },
};
export default lupRoot;
