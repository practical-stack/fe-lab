import { describe, test, expect } from 'vitest';
import { ErrorBase } from './error-base';
import { isCustomDefinedError, isError } from './guards';

describe(ErrorBase.name, () => {
  test('메시지만으로 생성하면 name은 ErrorBase이고 fingerPrint와 cause는 undefined이다', () => {
    // given
    const message = 'something went wrong';

    // when
    const error = new ErrorBase(message);

    // then
    expect(error.message).toBe('something went wrong');
    expect(error.name).toBe('ErrorBase');
    expect(error.fingerPrint).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  test('fingerPrint 옵션을 지정하면 에러에 fingerPrint가 설정된다', () => {
    // given
    const fingerPrint = ['handleBack'];

    // when
    const error = new ErrorBase('not found', { fingerPrint });

    // then
    expect(error.fingerPrint).toEqual(['handleBack']);
  });

  test('originalError를 전달하면 cause로 에러 체인을 형성한다', () => {
    // given
    const original = new Error('original cause');

    // when
    const error = new ErrorBase('wrapped', { originalError: original });

    // then
    expect(error.cause).toBe(original);
  });

  test('Error를 상속하므로 instanceof Error가 true이다', () => {
    // given
    const error = new ErrorBase('test');

    // when & then
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ErrorBase);
  });
});

describe('ErrorBase 서브클래스', () => {
  class BridgeNotFoundError extends ErrorBase {
    handlerName: string;

    constructor(handlerName: string) {
      super(`${handlerName} 핸들러를 찾을 수 없습니다.`, {
        fingerPrint: [handlerName],
      });
      this.name = 'BridgeNotFoundError';
      this.handlerName = handlerName;
    }
  }

  test('서브클래스에서 this.name을 설정하면 fingerPrint에 서브클래스명이 포함된다', () => {
    // given
    const handlerName = 'handleBack';

    // when
    const error = new BridgeNotFoundError(handlerName);

    // then
    expect(error.name).toBe('BridgeNotFoundError');
    expect(error.fingerPrint).toEqual(['handleBack']);
    expect(error.message).toBe('handleBack 핸들러를 찾을 수 없습니다.');
  });

  test('서브클래스 인스턴스는 isCustomDefinedError로 판별할 수 있다', () => {
    // given
    const error = new BridgeNotFoundError('handleBack');

    // when
    const actual = isCustomDefinedError(error);

    // then
    expect(actual).toBe(true);
  });
});

describe(isCustomDefinedError.name, () => {
  test.each([
    { input: new ErrorBase('base error'), expected: true, description: 'ErrorBase 인스턴스' },
    { input: new Error('plain error'), expected: false, description: '일반 Error 인스턴스' },
    { input: 'string', expected: false, description: '문자열' },
    { input: null, expected: false, description: 'null' },
    { input: undefined, expected: false, description: 'undefined' },
  ])('$description → $expected', ({ input, expected }) => {
    // when
    const actual = isCustomDefinedError(input);

    // then
    expect(actual).toBe(expected);
  });
});

describe(isError.name, () => {
  test.each([
    { input: new Error('plain'), expected: true, description: 'Error 인스턴스' },
    { input: new ErrorBase('custom'), expected: true, description: 'ErrorBase 인스턴스' },
    { input: 'not an error', expected: false, description: '문자열' },
    { input: null, expected: false, description: 'null' },
    { input: undefined, expected: false, description: 'undefined' },
    { input: 42, expected: false, description: '숫자' },
  ])('$description → $expected', ({ input, expected }) => {
    // when
    const actual = isError(input);

    // then
    expect(actual).toBe(expected);
  });
});
