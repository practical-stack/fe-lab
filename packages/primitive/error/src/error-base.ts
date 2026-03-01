export type CustomErrorOptions = {
  /**
   * 기존 에러를 wrapping할 때 원본 에러를 전달.
   * this.cause에 할당되어 에러 체인을 형성.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
   */
  originalError?: unknown;
  /**
   * Sentry의 에러 그룹화를 위한 fingerprint.
   * 동일 fingerprint를 가진 에러는 하나의 이슈로 합쳐짐.
   * @see https://docs.sentry.io/platforms/javascript/enriching-events/grouping-fingerprints/
   */
  fingerPrint?: string[];
};

export class ErrorBase extends Error {
  override cause?: unknown;
  fingerPrint?: string[];

  constructor(message: string, options?: CustomErrorOptions) {
    super(message);
    this.name = 'ErrorBase';
    this.fingerPrint = options?.fingerPrint;
    this.cause = options?.originalError;
  }
}
