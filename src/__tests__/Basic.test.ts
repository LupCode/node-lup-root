/// <reference types="jest" />
/// <reference types="node" />

import lupRoot from '../index.js';

describe('Basic tests', () => {

  const { APPLICATION_ROOT, SCRIPT_MAIN, SCRIPT_ROOT } = lupRoot;

  test('APPLICATION_ROOT not null', () => {
    expect(APPLICATION_ROOT).not.toBeNull();
  });

  test('SCRIPT_ROOT not null', () => {
    expect(SCRIPT_ROOT).not.toBeNull();
  });

  test('SCRIPT_MAIN not null', () => {
    expect(SCRIPT_MAIN).not.toBeNull();
  });

  test('SCRIPT_MAIN inside SCRIPT_ROOT', () => {
    expect(SCRIPT_MAIN.startsWith(SCRIPT_ROOT)).toBeTruthy();
    expect(SCRIPT_MAIN.length).toBeGreaterThan(SCRIPT_ROOT.length);
  });

  test('Is APPLICATION_ROOT correct location', () => {
    const actualRoot = process.cwd().replaceAll('\\', '/');
    expect(APPLICATION_ROOT).toBe(actualRoot);
  });

});