/**
 * Formats a numeric value using Intl.NumberFormat according to the given locale.
 *
 * Safe fallback: returns '-' if the input is not a finite number or formatting throws.
 *
 * @param value - Numeric value to format.
 * @param locale - BCP 47 language tag (default 'ja').
 * @param options - Intl.NumberFormat options.
 * @returns Formatted number string or '-' on invalid input.
 */
export function formatNumber(
    value: number,
    locale = 'ja',
    options?: Intl.NumberFormatOptions,
): string {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return '-';
    }

    try {
        return new Intl.NumberFormat(locale, options).format(value);
    } catch {
        return '-';
    }
}

/**
 * Formats an ISO 8601 UTC date-time string using Intl.DateTimeFormat.
 * For Japanese ('ja'), defaults to 'Asia/Tokyo' time zone (UTC+9).
 * For other languages, defaults to UTC if no timeZone is specified in options.
 *
 * Safe fallback: returns '-' if the input is not a valid date string or formatting throws.
 *
 * @param isoUtcString - ISO date string (e.g. '2026-10-12T02:35:33Z').
 * @param locale - BCP 47 language tag (default 'ja').
 * @param options - Intl.DateTimeFormat options.
 * @returns Formatted date-time string or '-' on invalid input.
 */
export function formatDateTime(
    isoUtcString: string,
    locale = 'ja',
    options?: Intl.DateTimeFormatOptions,
): string {
    if (typeof isoUtcString !== 'string' || isoUtcString.trim() === '') {
        return '-';
    }

    const date = new Date(isoUtcString);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    const resolvedTimeZone =
        options?.timeZone ?? (locale.startsWith('ja') ? 'Asia/Tokyo' : 'UTC');

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: resolvedTimeZone,
        ...options,
    };

    try {
        return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
    } catch {
        return '-';
    }
}
