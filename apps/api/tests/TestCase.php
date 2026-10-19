<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /**
     * Refuse to run against anything but the in-memory SQLite test database.
     *
     * Container environment variables (DB_CONNECTION=mysql ...) beat phpunit.xml unless the <env> entries are forced,
     * and RefreshDatabase would then wipe the developer's real MySQL data. This guard runs before any trait can touch the DB.
     */
    public function createApplication(): Application
    {
        $app = parent::createApplication();

        $connection = $app['config']->get('database.default');
        $database = $app['config']->get('database.connections.'.$connection.'.database');

        if ($connection !== 'sqlite' || $database !== ':memory:') {
            throw new RuntimeException(sprintf(
                'Refusing to run tests against "%s" (database "%s"). Tests must use sqlite :memory: (see phpunit.xml force="true").',
                is_string($connection) ? $connection : 'unknown',
                is_string($database) ? $database : 'unknown',
            ));
        }

        return $app;
    }
}
