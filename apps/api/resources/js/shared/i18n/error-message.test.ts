import { describe, it, expect } from 'vitest';
import { initI18n } from './init';
import { getErrorMessage } from './error-message';

describe('shared/i18n/error-message', () => {
    const i18n = initI18n('ja');
    const t = i18n.t.bind(i18n);

    it('translates HTTP_ERROR with status code', () => {
        const error = { code: 'HTTP_ERROR', status: 500 };
        expect(getErrorMessage(error, t)).toBe('HTTPエラー (ステータス 500)');
    });

    it('translates NETWORK_ERROR', () => {
        const error = { code: 'NETWORK_ERROR' };
        expect(getErrorMessage(error, t)).toBe(
            'ネットワークエラーが発生しました',
        );
    });

    it('translates ABORTED', () => {
        const error = { code: 'ABORTED' };
        expect(getErrorMessage(error, t)).toBe('リクエストが中断されました');
    });

    it('translates EMPTY_BODY', () => {
        const error = { code: 'EMPTY_BODY' };
        expect(getErrorMessage(error, t)).toBe('レスポンスデータが空です');
    });

    it('translates INVALID_JSON', () => {
        const error = { code: 'INVALID_JSON' };
        expect(getErrorMessage(error, t)).toBe(
            '不正なJSONデータを受信しました',
        );
    });

    it('translates INVALID_PAYLOAD', () => {
        const error = { code: 'INVALID_PAYLOAD' };
        expect(getErrorMessage(error, t)).toBe(
            '受信したデータの形式が正しくありません',
        );
    });

    it('returns UNKNOWN_ERROR for generic Error instance', () => {
        const error = new Error('Raw unhandled error');
        expect(getErrorMessage(error, t)).toBe('予期せぬエラーが発生しました');
    });

    it('returns UNKNOWN_ERROR for non-object errors or null', () => {
        expect(getErrorMessage('string error', t)).toBe(
            '予期せぬエラーが発生しました',
        );
        expect(getErrorMessage(null, t)).toBe('予期せぬエラーが発生しました');
        expect(getErrorMessage(undefined, t)).toBe(
            '予期せぬエラーが発生しました',
        );
        expect(getErrorMessage(12345, t)).toBe('予期せぬエラーが発生しました');
    });
});
