<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\DiscardConfigDraft;
use App\Actions\PublishConfigDraft;
use App\Actions\SaveConfigDraft;
use App\Config\ConfigDocumentRegistry;
use App\Models\ConfigDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

final class PublishConfigFileCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'config:publish-file
                            {key : The configuration document key (e.g. wizard)}
                            {file : The path to the JSON configuration file to publish}
                            {--label= : Optional label for this published version}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate and publish a configuration JSON file through domain actions';

    /**
     * Execute the console command.
     */
    public function handle(
        SaveConfigDraft $saveAction,
        PublishConfigDraft $publishAction,
        DiscardConfigDraft $discardAction
    ): int {
        $key = (string) $this->argument('key');
        $filePath = (string) $this->argument('file');
        $label = $this->option('label') !== null ? (string) $this->option('label') : null;

        if (! ConfigDocumentRegistry::has($key)) {
            $this->error("Unknown configuration key: {$key}");

            return self::FAILURE;
        }

        if (! file_exists($filePath)) {
            $this->error("File not found: {$filePath}");

            return self::FAILURE;
        }

        $json = file_get_contents($filePath);
        if ($json === false) {
            $this->error("Failed to read file: {$filePath}");

            return self::FAILURE;
        }

        if (strlen($json) > 1_048_576) {
            $this->line('SCHEMA_INVALID . File size exceeds 1 MB limit');
            $this->error('Validation failed: file exceeds 1 MB limit.');

            return self::FAILURE;
        }

        /** @var mixed $payload */
        $payload = json_decode($json, true);
        if (! is_array($payload) || (count($payload) > 0 && array_is_list($payload))) {
            $this->line('SCHEMA_INVALID . Root element must be a JSON object');
            $this->error('Validation failed: expected JSON object at root.');

            return self::FAILURE;
        }

        $validatorClass = ConfigDocumentRegistry::getValidator($key);
        if ($validatorClass !== null) {
            /** @var \App\Config\Wizard\ValidationResult $result */
            $result = $validatorClass::validate($payload);
            if (! $result->ok) {
                foreach ($result->issues as $issue) {
                    $this->line("{$issue->code->value} {$issue->getPathString()} {$issue->message}");
                }
                $this->error('Validation failed with '.count($result->issues).' issue(s).');

                return self::FAILURE;
            }

            /** @var array<string, mixed> $payload */
            $payload = $result->data ?? $payload;
        }

        $document = ConfigDocument::where('key', $key)->first();
        if ($document !== null && $document->draftVersion !== null) {
            $discardAction->handle($key, userId: null, requestId: 'cli-discard-'.Str::uuid());
        }

        $requestId = 'cli-publish-'.Str::uuid();

        $saveAction->handle(
            key: $key,
            payload: $payload,
            label: $label,
            userId: null,
            requestId: $requestId
        );

        $published = $publishAction->handle(
            key: $key,
            label: $label,
            userId: null,
            requestId: $requestId
        );

        $this->info("Published configuration '{$key}' as version {$published->version}.");

        return self::SUCCESS;
    }
}
