import * as fs from 'fs';
import { ROOT, MAIN } from '../index';

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
  let actualRoot = __dirname.substring(0, __dirname.length - 'src/__tests__'.length - 1).replace(/\\/g, '/');
  expect(ROOT).toBe(actualRoot);
});
