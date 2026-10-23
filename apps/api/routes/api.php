<?php

declare(strict_types=1);

use App\Http\Controllers\AdminAiTestPromptController;
use App\Http\Controllers\AdminAiUsageController;
use App\Http\Controllers\AdminConfigController;
use App\Http\Controllers\AdminConfigDraftController;
use App\Http\Controllers\AdminConfigHistoryController;
use App\Http\Controllers\AdminConfigPublishController;
use App\Http\Controllers\AdminProjectController;
use App\Http\Controllers\AiCommentaryController;
use App\Http\Controllers\AiBriefController;
use App\Http\Controllers\AiLayoutController;
use App\Http\Controllers\AiConstraintsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConfigBundleController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\ProjectAnswersController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectPlanController;
use App\Http\Controllers\ProjectReportController;
use App\Support\Ability;
use Illuminate\Support\Facades\Route;

Route::get('/v1/health', HealthController::class);

Route::post('/v1/auth/register', [AuthController::class, 'register'])->middleware('throttle:auth-register');
Route::post('/v1/auth/login', [AuthController::class, 'login']);
Route::post('/v1/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/v1/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::get('/v1/auth/session', [AuthController::class, 'session']);

// Public config bundle
Route::get('/v1/config/bundle', [ConfigBundleController::class, 'show']);

// Admin config management
Route::get('/v1/admin/configs', [AdminConfigController::class, 'index'])
    ->middleware(['auth:sanctum', 'can:'.Ability::MANAGE_CONFIG]);

Route::get('/v1/admin/configs/{key}', [AdminConfigController::class, 'show'])
    ->middleware(['auth:sanctum', 'can:'.Ability::MANAGE_CONFIG]);

Route::put('/v1/admin/configs/{key}/draft', [AdminConfigDraftController::class, 'update'])
    ->middleware(['auth:sanctum', 'can:'.Ability::MANAGE_CONFIG, 'throttle:config-write']);

Route::delete('/v1/admin/configs/{key}/draft', [AdminConfigDraftController::class, 'destroy'])
    ->middleware(['auth:sanctum', 'can:'.Ability::MANAGE_CONFIG, 'throttle:config-write']);

Route::post('/v1/admin/configs/{key}/publish', [AdminConfigPublishController::class, 'publish'])
    ->middleware(['auth:sanctum', 'can:'.Ability::MANAGE_CONFIG, 'throttle:config-write']);

Route::post('/v1/admin/configs/{key}/rollback', [AdminConfigPublishController::class, 'rollback'])
    ->middleware(['auth:sanctum', 'can:'.Ability::MANAGE_CONFIG, 'throttle:config-write']);

Route::get('/v1/admin/configs/{key}/versions', [AdminConfigHistoryController::class, 'versions'])
    ->middleware(['auth:sanctum', 'can:'.Ability::MANAGE_CONFIG]);

Route::get('/v1/admin/configs/{key}/versions/{n}', [AdminConfigHistoryController::class, 'version'])
    ->where('n', '[1-9][0-9]{0,8}')
    ->middleware(['auth:sanctum', 'can:'.Ability::MANAGE_CONFIG]);

Route::get('/v1/admin/configs/{key}/audit', [AdminConfigHistoryController::class, 'audit'])
    ->middleware(['auth:sanctum', 'can:'.Ability::MANAGE_CONFIG]);

// User Projects
// No auth:sanctum here by design: anonymous callers get full access (see
// App\Support\GuestAccess and findOwnedProject()/findAuthorizedProject() in
// the Project* controllers below). Logged-in users keep normal ownership checks.
Route::get('/v1/projects', [ProjectController::class, 'index']);
Route::post('/v1/projects', [ProjectController::class, 'store']);
Route::get('/v1/projects/{id}', [ProjectController::class, 'show'])
    ->where('id', '[1-9][0-9]{0,8}');
Route::patch('/v1/projects/{id}', [ProjectController::class, 'update'])
    ->where('id', '[1-9][0-9]{0,8}');
Route::delete('/v1/projects/{id}', [ProjectController::class, 'destroy'])
    ->where('id', '[1-9][0-9]{0,8}');

// Project Answers & Submit
Route::put('/v1/projects/{id}/answers', [ProjectAnswersController::class, 'update'])
    ->where('id', '[1-9][0-9]{0,8}');
Route::post('/v1/projects/{id}/submit', [ProjectAnswersController::class, 'submit'])
    ->where('id', '[1-9][0-9]{0,8}');

// Project Plans
Route::get('/v1/projects/{id}/plans', [ProjectPlanController::class, 'index'])
    ->where('id', '[1-9][0-9]{0,8}');
Route::post('/v1/projects/{id}/plans', [ProjectPlanController::class, 'store'])
    ->where('id', '[1-9][0-9]{0,8}');
Route::delete('/v1/projects/{id}/plans/{planId}', [ProjectPlanController::class, 'destroy'])
    ->where('id', '[1-9][0-9]{0,8}')
    ->where('planId', '[1-9][0-9]{0,8}');

// Project Report
Route::post('/v1/projects/{id}/report', ProjectReportController::class)
    ->where('id', '[1-9][0-9]{0,8}')
    ->middleware(['throttle:6,1', 'max.payload:6291456']);

// Admin Projects
Route::get('/v1/admin/projects', [AdminProjectController::class, 'index'])
    ->middleware(['auth:sanctum', 'role:admin,editor,architect']);

// AI Endpoints
Route::post('/v1/ai/constraints', AiConstraintsController::class)
    ->middleware(['throttle:ai', 'max.payload:32768']);
Route::post('/v1/ai/commentary', AiCommentaryController::class)
    ->middleware(['throttle:ai', 'max.payload:32768']);
Route::post('/v1/ai/layout', AiLayoutController::class)
    ->middleware(['throttle:ai-layout', 'max.payload:65536']);
Route::post('/v1/ai/brief', AiBriefController::class)
    ->middleware(['throttle:ai-layout', 'max.payload:65536']);
Route::get('/v1/admin/ai/usage', AdminAiUsageController::class)
    ->middleware(['auth:sanctum', 'role:admin,editor']);
Route::post('/v1/admin/ai/test-prompt', AdminAiTestPromptController::class)
    ->middleware(['auth:sanctum', 'role:admin,editor', 'throttle:6,1']);
