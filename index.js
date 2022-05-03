var _MAIN = __filename;
var _ROOT = __dirname;
var limit = Error.stackTraceLimit;
Error.stackTraceLimit = Infinity;
try {
    throw new Error();
}
catch (ex) {
    var lines = ex.stack.toString().split("\n");
    for (var i = lines.length - 1; i >= 0; i--) {
        var line = lines[i].trim();
        var start = line.indexOf("(");
        if (start < 0)
            continue;
        start++;
        var end = line.indexOf(")", start);
        if (!end)
            continue;
        var path = line.substring(start, end).trim().replaceAll("\\", "/");
        end = Math.max(path.lastIndexOf("/node_modules/next/dist/"), path.lastIndexOf("/node_modules/lup-auth/"));
        var notTrimmed = end < 0;
        path = notTrimmed ? path : path.substring(0, end + 1);
        if (path.length == 0 || path.startsWith("internal/modules/") || path.startsWith("node:") ||
            path.lastIndexOf("/.next/server/") >= 0)
            continue;
        // remove line and column numbers at end
        if (notTrimmed)
            for (var j = 0; j < 2; j++) {
                end = path.lastIndexOf(":");
                if (end < 0)
                    break;
                path = path.substring(0, end);
            }
        if (path === _MAIN)
            continue;
        _MAIN = path;
        end = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
        _ROOT = end > 0 ? path.substring(0, end + 1) : path;
        break;
    }
}
Error.stackTraceLimit = limit;
/** Absolute path to the main file  */
export var MAIN = _MAIN;
/** Absolte path to root directory in which main file is located (always ends with '/' or '\\') */
export var ROOT = _ROOT;
export default {
    MAIN: MAIN,
    ROOT: ROOT
};
