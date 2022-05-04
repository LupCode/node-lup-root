![GitHub package.json version](https://img.shields.io/github/package-json/v/LupCode/node-lup-root)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/LupCode/node-lup-root/On%20Push)
![NPM](https://img.shields.io/npm/l/lup-root)
![npm bundle size](https://img.shields.io/bundlephobia/min/lup-root)

# lup-root
Node module that determines absolute path to project root and main file of project  

## Example
```javascript
const {ROOT, MAIN} = require('lup-root');

console.log("Root directory: " + ROOT);
console.log("Main file: " + MAIN);
```
