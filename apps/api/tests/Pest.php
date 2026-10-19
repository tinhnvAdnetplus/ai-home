<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to watch for any specific methods that Laravel or Pest provides.
|
*/

pest()->extend(Tests\TestCase::class)->in('Feature', 'Unit', 'Arch');
