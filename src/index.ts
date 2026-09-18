const _APPLICATION_ROOT = process.cwd().replaceAll('\\', '/'); // '\' -> '/'
let _SCRIPT_ROOT = import.meta.dirname.replaceAll('\\', '/'); // '\' -> '/'
let _SCRIPT_MAIN = import.meta.filename.replaceAll('\\', '/'); // '\' -> '/'

const COMMON_BUILD_DIRECTORIES = ['/bin', '/.bin', '/build', '/dist', '/lib', '/out', '/target'];

const originalStackTraceLimit = Error.stackTraceLimit;
if(originalStackTraceLimit !== undefined) Error.stackTraceLimit = Infinity;
try {
  throw new Error();
} catch (ex: any) {
  const lines = ex.stack.toString().split('\n');
  let found = false;

  for (let i = lines.length - 1; i >= 0 && !found; i--) {
    const line = lines[i].trim();
    let start = 0;
    do {
      start = line.indexOf('(', start);
      if (start < 0) break;
      start++;
      let end = start;

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

      let path = line.substring(start, end).trim().replace(/\\/g, '/'); // '\' -> '/'
      start = end + 1;
      if (
        path.lastIndexOf('.') < 0 ||
        path.startsWith('internal/modules/') ||
        path.startsWith('node:') ||
        path.startsWith('webpack-internal:') ||
        path.lastIndexOf('/webpack-runtime.') >= 0 ||
        path.lastIndexOf('/next/dist') >= 0 ||
        path.startsWith('index ')
      )
        continue;

      // remove line and column numbers at end
      for (let j = 0; j < 2; j++) {
        end = path.lastIndexOf(':');
        if (end < 0) break;
        path = path.substring(0, end);
      }

      //  if (path === SCRIPT_MAIN && path.lastIndexOf('/.next/server') < 0) break;

      // next middleware (special case)
      end = path.lastIndexOf('/.next/dev/server/');
      if (end >= 0) {
        const fileName = _SCRIPT_MAIN.substring(_SCRIPT_ROOT.length + 1);
        _SCRIPT_ROOT = path.substring(0, end);
        _SCRIPT_MAIN = _SCRIPT_ROOT + (!_SCRIPT_ROOT.endsWith('/') ? '/' : '') + fileName.substring(fileName.startsWith('/') ? 1 : 0);
        found = true;
        break;
      }

      _SCRIPT_MAIN = path;
      end = path.lastIndexOf('/node_modules/');
      end = end < 0 ? path.lastIndexOf('/.next/server') : end;
      end = end < 0 ? path.lastIndexOf('/') : end;
      _SCRIPT_ROOT = end > 0 ? path.substring(0, end + 1) : path;
      _SCRIPT_ROOT = _SCRIPT_ROOT.endsWith('/') ? _SCRIPT_ROOT.substring(0, _SCRIPT_ROOT.length - 1) : _SCRIPT_ROOT;

      // strip common build directories
      for(const buildDir of COMMON_BUILD_DIRECTORIES) {
        if(_SCRIPT_ROOT.endsWith(buildDir)) {
          _SCRIPT_ROOT = _SCRIPT_ROOT.substring(0, _SCRIPT_ROOT.length - buildDir.length);
          break;
        }
      }

      found = true;
    } while (!found);
  }
}
if(originalStackTraceLimit !== undefined) Error.stackTraceLimit = originalStackTraceLimit;



/** Absolute path to the root directory of the application (never ends with '/' or '\\'). */
export const APPLICATION_ROOT = _APPLICATION_ROOT;

/** Absolute path to the main file of the script that got invoked. */
export const MAIN = _SCRIPT_MAIN;

/** Absolute path to the root directory of the application (never ends with '/' or '\\'). */
export const ROOT = _APPLICATION_ROOT;

/** Absolute path to the main file of the script that got invoked. */
export const SCRIPT_MAIN = _SCRIPT_MAIN;

/** Absolute path to the root directory of the script that got invoked (never ends with '/' or '\\'). */
export const SCRIPT_ROOT = _SCRIPT_ROOT;

const lupRoot = {

  /** Absolute path to the main file of the application (not the script that is currently running).  */
  MAIN,

  /** Absolute path to the root directory of the application (never ends with '/' or '\\'). */
  ROOT,

  /** Absolute path to the root directory of the application (never ends with '/' or '\\'). */
  APPLICATION_ROOT,

  /** Absolute path to the main file of the script that is currently running and that got initially invoked. */
  SCRIPT_MAIN,

  /** Absolute path to the root directory of the script that is currently running and that got initially invoked (never ends with '/' or '\\'). */
  SCRIPT_ROOT,
};
export default lupRoot;
