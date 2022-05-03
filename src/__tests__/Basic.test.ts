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
