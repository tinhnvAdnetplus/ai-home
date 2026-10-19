<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Support\Facades\DB;
use Throwable;

final class CheckHealth
{
    /**
     * @return array{status: string, db: string, time: string}
     */
    public function execute(): array
    {
        $dbStatus = 'down';
        try {
            DB::select('SELECT 1');
            $dbStatus = 'up';
        } catch (Throwable) {
            $dbStatus = 'down';
        }

        return [
            'status' => 'ok',
            'db' => $dbStatus,
            'time' => gmdate('Y-m-d\TH:i:s\Z'),
        ];
    }
}
