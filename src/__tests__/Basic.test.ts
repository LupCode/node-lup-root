/// <reference types="jest" />
/// <reference types="node" />

import { ROOT, MAIN } from '../index.js';

describe('Basic tests', () => {

  test('ROOT not null', () => {
    expect(ROOT).not.toBeNull();
  });

  test('MAIN not null', () => {
    expect(MAIN).not.toBeNull();
  });

  test('MAIN inside ROOT', () => {
    expect(MAIN.startsWith(ROOT)).toBeTruthy();
  });

  test('MAIN and ROOT not equal', () => {
    expect(MAIN.length).toBeGreaterThan(ROOT.length);
  });

  test('Is ROOT correct location', () => {
    //const actualRoot = __dirname.substring(0, __dirname.length - 'src/__tests__'.length - 1).replace(/\\/g, '/');
    const actualRoot = process.cwd().replaceAll('\\', '/');
    expect(ROOT).toBe(actualRoot);
  });

});