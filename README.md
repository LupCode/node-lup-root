![GitHub package.json version](https://img.shields.io/github/package-json/v/LupCode/node-lup-root)
![npm bundle size](https://img.shields.io/bundlephobia/min/lup-root)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/LupCode/node-lup-root/on-push.yml?branch=main)
![NPM](https://img.shields.io/npm/l/lup-root)

# lup-root
Node module that determines absolute path to project root and main file of project  

## Example
```javascript
import { getApplicationRoot, getProjectRoot, getScriptMain } from "lup-root";

// Absolute path to the main file that started the application.
console.log('Main file: ' + getScriptMain());,

// Absolute path to the root of the application directory (actual root of the app inside a monorepo).
console.log("Application root: " + getApplicationRoot());

// Absolute path to the root directory of the project (monorepo root if the application is inside a monorepo).
console.log("Project root: " + getProjectRoot());

```
