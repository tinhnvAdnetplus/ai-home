<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Shared constants for wizard configuration validation.
 *
 * Mirrored from:
 * - packages/config-schema/src/primitives.ts
 * - packages/config-schema/src/condition-types.ts
 * - packages/config-schema/src/wizard/types.ts
 */
final class WizardConstants
{
    /**
     * Forbidden prototype pollution keys (checked case-insensitively).
     * Mirrors DENIED_KEYS in packages/config-schema/src/primitives.ts.
     *
     * @var list<string>
     */
    public const DENIED_KEYS = [
        'constructor',
        'prototype',
        '__proto__',
        'proto',
        'hasownproperty',
        'tostring',
        'valueof',
        'isprototypeof',
        'propertyisenumerable',
        'tolocalestring',
    ];

    /**
     * Key regex anchored with \z (PCRE $ matches before trailing newline, \z does not).
     * Mirrors KEY_REGEX in packages/config-schema/src/primitives.ts.
     */
    public const KEY_REGEX = '/^[a-z][a-z0-9_]{0,47}\z/u';

    /**
     * Binding key dot.case regex anchored with \z.
     * Mirrors BINDING_KEY_REGEX in packages/config-schema/src/primitives.ts.
     */
    public const BINDING_KEY_REGEX = '/^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*\z/u';

    /**
     * Media identifier regex anchored with \z.
     * Mirrors MEDIA_ID_REGEX in packages/config-schema/src/primitives.ts.
     */
    public const MEDIA_ID_REGEX = '/^[A-Za-z0-9_-]{1,64}\z/u';

    /**
     * Allowed step icons.
     * Mirrors STEP_ICONS in packages/config-schema/src/wizard/types.ts.
     *
     * @var list<string>
     */
    public const STEP_ICONS = [
        'home',
        'map-pin',
        'layout-grid',
        'users',
        'image',
        'palette',
        'heart',
        'star',
        'yen',
        'shield',
        'check',
        'map',
        'family',
        'building',
        'sofa',
        'settings',
        'file-text',
    ];

    /**
     * Allowed upload MIME types.
     * Mirrors UPLOAD_MIME_TYPES in packages/config-schema/src/wizard/types.ts.
     *
     * @var list<string>
     */
    public const UPLOAD_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'application/dxf',
    ];

    /**
     * Allowed condition AST operators.
     * Mirrors ALLOWED_OPERATORS in packages/config-schema/src/condition-types.ts.
     *
     * @var list<string>
     */
    public const ALLOWED_OPERATORS = [
        'and',
        'or',
        '!',
        '==',
        '!=',
        '<',
        '<=',
        '>',
        '>=',
        'in',
    ];

    public const MAX_KEY_LENGTH = 48;

    public const MAX_BINDING_KEY_LENGTH = 64;

    public const MAX_MEDIA_ID_LENGTH = 64;

    public const MAX_STEPS = 20;

    public const MAX_SECTIONS_PER_STEP = 20;

    public const MAX_FIELDS_TOTAL = 150;

    public const MAX_OPTIONS_PER_FIELD = 60;

    public const MAX_CONDITION_DEPTH = 6;

    public const MAX_CONDITION_NODES = 60;

    public const MAX_IN_ITEMS = 50;

    public const MAX_LOCALIZED_TEXT_LENGTH = 500;

    public const MAX_TEXT_LENGTH = 500;

    public const MAX_TEXTAREA_LENGTH = 2000;

    public const MAX_CONDITION_STRING_LENGTH = 200;

    public const MAX_UPLOAD_FILES = 10;

    public const MAX_UPLOAD_SIZE_MB = 20;

    /**
     * Maximum raw JSON payload size (1 MB).
     */
    public const MAX_JSON_SIZE_BYTES = 1048576;
}
