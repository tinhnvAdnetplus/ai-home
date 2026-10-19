<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\DiscardConfigDraft;
use App\Actions\PublishConfigDraft;
use App\Actions\SaveConfigDraft;
use App\Ai\AiSettings;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use Illuminate\Console\Command;

final class PublishAiDefaultsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:publish-defaults';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed and publish default AI configuration document';

    public function handle(
        SaveConfigDraft $saveDraft,
        PublishConfigDraft $publishDraft,
        DiscardConfigDraft $discardDraft
    ): int {
        $this->info('Preparing default AI configuration...');

        $doc = ConfigDocument::where('key', 'ai')->first();
        if ($doc !== null) {
            $hasDraft = ConfigVersion::where('config_document_id', $doc->id)
                ->where('is_draft', true)
                ->exists();
            if ($hasDraft) {
                $this->line('Discarding existing uncommitted draft for document [ai]...');
                $discardDraft->handle('ai');
            }
        }

        $defaults = AiSettings::getDefaults();

        $this->line('Saving draft for document [ai]...');
        try {
            $saveDraft->handle(
                key: 'ai',
                payload: $defaults,
                label: 'Default AI Settings'
            );
        } catch (\App\Exceptions\ConfigProblemException $e) {
            $this->error('Validation failed with issues:');
            foreach ($e->issues ?? [] as $issue) {
                $this->error(json_encode($issue, JSON_UNESCAPED_UNICODE));
            }
            throw $e;
        }

        $this->line('Publishing draft for document [ai]...');
        $published = $publishDraft->handle(
            key: 'ai',
            label: 'Default AI Settings'
        );

        $this->info("Published AI configuration 'ai' as version {$published->version}.");

        return self::SUCCESS;
    }
}
