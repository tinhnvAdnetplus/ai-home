<?php

declare(strict_types=1);

namespace App\Enums;

enum ConfigAuditAction: string
{
    case CreateDraft = 'create_draft';
    case UpdateDraft = 'update_draft';
    case DiscardDraft = 'discard_draft';
    case Publish = 'publish';
    case Rollback = 'rollback';
}
