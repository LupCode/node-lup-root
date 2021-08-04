
/** Absolute path to the main file  */
let MAIN = __filename;

/** Absolte path to root directory in which main file is located (always ends with '/' or '\') */
let ROOT = __dirname;


let limit = Error.stackTraceLimit;
Error.stackTraceLimit = Infinity;
try {
    throw new Error();
} catch (ex){
    const lines = ex.stack.toString().split("\n");
    for(let i=lines.length-1; i>=0; i--){
        const line = lines[i].trim();
        let start = line.indexOf("(");
        if(start < 0) continue;
        start++;
        let end = line.indexOf(")", start);
        if(!end) continue;
        let path = line.substring(start, end).trim();
        if(path.length == 0 || path.startsWith("internal/modules/")) continue;

        // remove line and column numbers at end
        for(let j=0; j < 2; j++){
            end = path.lastIndexOf(":");
            if(end < 0) break;
            path = path.substring(0, end);
        }

        if(path === __filename) continue;

        MAIN = path;
        end = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
        ROOT = end > 0 ? path.substring(0, end+1) : path;
        break;
    }
}
Error.stackTraceLimit = limit;

module.exports = {
    MAIN,
    ROOT
};