<?php

declare(strict_types=1);

namespace App\Config\Wizard;

final class AnswerLogFormatter
{
    /**
     * Turn a raw answers map into a human-readable "label => value" map,
     * using the wizard's field/option labels instead of internal keys.
     *
     * @param  array<string, mixed>  $wizardPayload
     * @param  array<string, mixed>  $answers
     * @param  string  $locale  Preferred label language (e.g. the request's own locale); falls back to vi/ja/en.
     * @return array<string, mixed>
     */
    public static function format(array $wizardPayload, array $answers, ?string $locale = null): array
    {
        $fields = AnswerResolver::collectFields($wizardPayload);
        $locale ??= app()->getLocale();

        $formatted = [];
        $matchedKeys = [];
        foreach ($fields as $field) {
            $key = $field['key'] ?? null;
            if (!is_string($key) || !array_key_exists($key, $answers)) {
                continue;
            }

            $matchedKeys[$key] = true;
            $label = self::localizedText($field['label'] ?? null, $locale) ?? $key;
            $formatted[$label] = self::formatValue($field, $answers[$key], $locale);
        }

        // Keep keys the current wizard schema doesn't know about (e.g. a stale
        // client, or a config version mismatch) so nothing the user picked is lost.
        foreach ($answers as $key => $value) {
            if (!isset($matchedKeys[$key])) {
                $formatted[$key] = is_scalar($value) || $value === null
                    ? $value
                    : (json_encode($value, JSON_UNESCAPED_UNICODE) ?: '');
            }
        }

        return $formatted;
    }

    private static function formatValue(array $field, mixed $value, string $locale): mixed
    {
        if ($value === null) {
            return null;
        }

        $options = $field['options'] ?? null;
        if (is_array($options)) {
            if (is_array($value)) {
                return array_map(
                    fn (mixed $item): string => self::resolveOption($options, $item, $locale),
                    $value,
                );
            }

            return self::resolveOption($options, $value, $locale);
        }

        if (is_bool($value)) {
            return $value ? 'Có' : 'Không';
        }

        return $value;
    }

    /**
     * @param  list<mixed>  $options
     */
    private static function resolveOption(array $options, mixed $value, string $locale): string
    {
        foreach ($options as $option) {
            if (is_array($option) && ($option['value'] ?? null) === $value) {
                return self::localizedText($option['label'] ?? null, $locale) ?? (string) $value;
            }
        }

        if (is_scalar($value)) {
            return (string) $value;
        }

        return json_encode($value, JSON_UNESCAPED_UNICODE) ?: '';
    }

    /**
     * Resolve a localized text object (e.g. ['ja' => '...', 'vi' => '...'])
     * to a single string, preferring the current locale.
     */
    private static function localizedText(mixed $label, string $locale): ?string
    {
        if (!is_array($label)) {
            return null;
        }

        foreach ([$locale, 'vi', 'ja', 'en'] as $candidate) {
            $text = $label[$candidate] ?? null;
            if (is_string($text) && $text !== '') {
                return $text;
            }
        }

        foreach ($label as $text) {
            if (is_string($text) && $text !== '') {
                return $text;
            }
        }

        return null;
    }
}
