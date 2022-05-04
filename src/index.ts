let _MAIN = __filename.replace(/\\/g, '/'); // '\' -> '/'
let _ROOT = __dirname.replace(/\\/g, '/'); // '\' -> '/'

const COMMON_BUILD_DIRECTORIES = ['/bin', '/.bin', '/build', '/out', '/target'];

const originalStackTraceLimit = Error.stackTraceLimit;
Error.stackTraceLimit = Infinity;
try {
  throw new Error();
} catch (ex: any) {
  const lines = ex.stack.toString().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    let start = line.indexOf('(');
    if (start < 0) continue;
    start++;
    let end = line.indexOf(')', start);
    if (!end) continue;
    let path = line.substring(start, end).trim().replace(/\\/g, '/'); // '\' -> '/'
    if (
      path.length === 0 ||
      path.startsWith('internal/modules/') ||
      path.startsWith('node:') ||
      path.lastIndexOf('/.next/server/') >= 0
    )
      continue;

    // remove line and column numbers at end
    for (let j = 0; j < 2; j++) {
      end = path.lastIndexOf(':');
      if (end < 0) break;
      path = path.substring(0, end);
    }

    if (path === _MAIN) continue;

    _MAIN = path;
    end = path.lastIndexOf('/node_modules/');
    end = end < 0 ? path.lastIndexOf('/') : end;
    _ROOT = end > 0 ? path.substring(0, end + 1) : path;
    _ROOT = _ROOT.endsWith('/') ? _ROOT.substring(0, _ROOT.length - 1) : _ROOT;

    // strip common build directories
    for (const buildDir of COMMON_BUILD_DIRECTORIES) {
      if (_ROOT.endsWith(buildDir)) {
        _ROOT = _ROOT.substring(0, _ROOT.length - buildDir.length);
        break;
      }
    }

    break;
  }
}
Error.stackTraceLimit = originalStackTraceLimit;

/** Absolute path to the main file  */
export const MAIN = _MAIN;

/** Absolte path to root directory in which main file is located (never ends with '/' or '\\') */
export const ROOT = _ROOT;

export default {
  MAIN,
  ROOT,
};
