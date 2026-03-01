import { ErrorBase } from './error-base';

/** 프로젝트에서 직접 정의한 에러(ErrorBase 하위)인지 확인 (type guard) */
export const isCustomDefinedError = (error: unknown): error is ErrorBase => {
  return error instanceof ErrorBase;
};

/** Error 인스턴스인지 확인 (type guard) */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};
