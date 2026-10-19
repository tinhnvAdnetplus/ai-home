<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

// The React app is the front end of Laravel: every non-API URL returns the SPA shell
// and React Router takes over on the client. `/api/*` keeps going to routes/api.php.
Route::view('/{any?}', 'app')->where('any', '^(?!api(/|$)).*$');
