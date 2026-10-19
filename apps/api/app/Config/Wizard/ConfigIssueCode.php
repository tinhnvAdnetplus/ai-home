<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Machine-readable validation issue codes.
 *
 * Case names and backing string values are identical to the TypeScript
 * ISSUE_CODES in packages/config-schema/src/wizard/issue-codes.ts.
 */
enum ConfigIssueCode: string
{
    case SchemaInvalid = 'SCHEMA_INVALID';
    case DuplicateKey = 'DUPLICATE_KEY';
    case UnknownFieldRef = 'UNKNOWN_FIELD_REF';
    case SelfReference = 'SELF_REFERENCE';
    case ConditionCycle = 'CONDITION_CYCLE';
    case UnknownBinding = 'UNKNOWN_BINDING';
    case BindingTypeMismatch = 'BINDING_TYPE_MISMATCH';
    case DuplicateBinding = 'DUPLICATE_BINDING';
    case DefaultNotInOptions = 'DEFAULT_NOT_IN_OPTIONS';
    case DefaultOutOfRange = 'DEFAULT_OUT_OF_RANGE';
    case RangeInvalid = 'RANGE_INVALID';
    case SelectionLimitsInvalid = 'SELECTION_LIMITS_INVALID';
    case EmptyOptions = 'EMPTY_OPTIONS';
    case LimitExceeded = 'LIMIT_EXCEEDED';
    case UnknownKey = 'UNKNOWN_KEY';
    case WrongType = 'WRONG_TYPE';
    case OptionNotAllowed = 'OPTION_NOT_ALLOWED';
    case OutOfRange = 'OUT_OF_RANGE';
    case RequiredMissing = 'REQUIRED_MISSING';
}
