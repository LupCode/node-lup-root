![GitHub package.json version](https://img.shields.io/github/package-json/v/LupCode/node-lup-root)
![npm bundle size](https://img.shields.io/bundlephobia/min/lup-root)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/LupCode/node-lup-root/on-push.yml?branch=main)
![NPM](https://img.shields.io/npm/l/lup-root)

# lup-root
Node module that determines absolute path to project root and main file of project  

## Example
```javascript
import { APPLICATION_ROOT, MAIN, ROOT, SCRIPT_MAIN, SCRIPT_ROOT } from "lup-root";

// Absolute path to the main file of the application (not the script that is currently running).
console.log('Main file: ' + MAIN);,

// Absolute path to the root directory of the application (never ends with '/' or '\\').
console.log("Root directory: " + ROOT);

// Absolute path to the root directory of the application (never ends with '/' or '\\').
console.log("Application root: " + APPLICATION_ROOT);

// Absolute path to the main file of the script that is currently running and that got initially invoked.
console.log("Script main: " + SCRIPT_MAIN);

// Absolute path to the root directory of the script that is currently running and that got initially invoked (never ends with '/' or '\\').
console.log("Script root: " + SCRIPT_ROOT);
```
