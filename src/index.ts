let _MAIN = __filename;
let _ROOT = __dirname;

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
    let path = line.substring(start, end).trim().replaceAll('\\', '/');
    end = Math.max(path.lastIndexOf('/node_modules/next/dist/'), path.lastIndexOf('/node_modules/lup-auth/'));
    const notTrimmed = end < 0;
    path = notTrimmed ? path : path.substring(0, end + 1);
    if (
      path.length === 0 ||
      path.startsWith('internal/modules/') ||
      path.startsWith('node:') ||
      path.lastIndexOf('/.next/server/') >= 0
    )
      continue;

    // remove line and column numbers at end
    if (notTrimmed)
      for (let j = 0; j < 2; j++) {
        end = path.lastIndexOf(':');
        if (end < 0) break;
        path = path.substring(0, end);
      }

    if (path === _MAIN) continue;

    _MAIN = path;
    end = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    _ROOT = end > 0 ? path.substring(0, end + 1) : path;
    break;
  }
}
Error.stackTraceLimit = originalStackTraceLimit;

/** Absolute path to the main file  */
export const MAIN = _MAIN;

/** Absolte path to root directory in which main file is located (always ends with '/' or '\\') */
export const ROOT = _ROOT;

export default {
  MAIN,
  ROOT,
};
