<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Validates field planner bindings (existence, type compatibility, uniqueness).
 *
 * Mirrors validateFieldBinding in packages/config-schema/src/wizard/binding-validator.ts.
 */
final class BindingValidator
{
    /**
     * @param  array<string, mixed>  $field
     * @param  list<string|int>  $path
     * @param  array<string, list<string|int>>  $seenBindings
     * @return list<ConfigIssue>
     */
    public static function validate(array $field, array $path, array &$seenBindings): array
    {
        $issues = [];
        $binding = $field['binding'] ?? null;
        if (! is_string($binding) || $binding === '') {
            return $issues;
        }

        $bindingPath = [...$path, 'binding'];
        $entry = BindingRegistry::find($binding);

        if ($entry === null) {
            $issues[] = new ConfigIssue(
                $bindingPath,
                ConfigIssueCode::UnknownBinding,
                "Binding key '{$binding}' is not in the planner capability registry"
            );

            return $issues;
        }

        $fieldType = (string) ($field['type'] ?? '');
        $isMultiple = ($fieldType === 'image_select' && ! empty($field['multiple']));

        if (! BindingRegistry::isCompatible($fieldType, $isMultiple, $entry['valueType'])) {
            $issues[] = new ConfigIssue(
                $bindingPath,
                ConfigIssueCode::BindingTypeMismatch,
                "Field type '{$fieldType}' is incompatible with binding '{$binding}' which expects type '{$entry['valueType']}'"
            );
        }

        if (isset($seenBindings[$binding])) {
            $previousPathStr = implode('.', array_map(strval(...), $seenBindings[$binding]));
            $issues[] = new ConfigIssue(
                $bindingPath,
                ConfigIssueCode::DuplicateBinding,
                "Binding key '{$binding}' is duplicated; already bound at {$previousPathStr}"
            );
        } else {
            $seenBindings[$binding] = $bindingPath;
        }

        return $issues;
    }
}
