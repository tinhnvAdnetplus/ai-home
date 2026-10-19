<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Config\Wizard\ConfigIssueCode;
use App\Config\Wizard\WizardConfigValidator;
use Illuminate\Console\Command;

final class ValidateWizardConfigCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'config:validate-wizard
                            {file? : The path to the wizard JSON configuration file to validate}
                            {--dos-bench : Run denial-of-service benchmarks (100k steps, 50k-deep condition)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate a wizard JSON configuration against config-schema rules';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->option('dos-bench')) {
            return $this->runDosBenchmark();
        }

        $filePath = $this->argument('file');
        if (! is_string($filePath) || $filePath === '') {
            $this->error('Please specify a file path or use --dos-bench');

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

        $result = WizardConfigValidator::validateJson($json);

        if ($result->ok) {
            $this->line('OK');

            return self::SUCCESS;
        }

        foreach ($result->issues as $issue) {
            $this->line("{$issue->code->value} {$issue->getPathString()} {$issue->message}");
        }

        return self::FAILURE;
    }

    /**
     * Benchmark and verify denial-of-service resilience.
     */
    private function runDosBenchmark(): int
    {
        $this->info('Running DoS resilience benchmarks...');

        // 1. 100,000 steps array (LimitPrecheck resilience)
        $this->line('1. Testing 100,000 steps array precheck...');
        $sampleStep = [
            'key' => 'step_1',
            'title' => ['ja' => 'ステップ'],
            'sections' => [],
        ];
        $oversizedSteps = array_fill(0, 100_000, $sampleStep);
        $wizardInput = [
            'schemaVersion' => 1,
            'steps' => $oversizedSteps,
        ];

        $startSteps = hrtime(true);
        $stepsResult = WizardConfigValidator::validate($wizardInput);
        $stepsElapsedMs = (hrtime(true) - $startSteps) / 1e6;

        if ($stepsResult->ok || empty($stepsResult->issues) || $stepsResult->issues[0]->code !== ConfigIssueCode::LimitExceeded) {
            $this->error('Failed: 100k steps did not yield LIMIT_EXCEEDED');

            return self::FAILURE;
        }
        $this->line(sprintf('   [PASS] 100,000 steps rejected in %.2f ms (%s at %s)', $stepsElapsedMs, $stepsResult->issues[0]->code->value, $stepsResult->issues[0]->getPathString()));

        // 2. 50,000-deep condition nesting (ConditionAstValidator recursion guard)
        $this->line('2. Testing 50,000-level nested condition...');
        $deepCondition = true;
        for ($i = 0; $i < 50_000; $i++) {
            $deepCondition = ['and' => [$deepCondition]];
        }
        $conditionInput = [
            'schemaVersion' => 1,
            'steps' => [
                [
                    'key' => 'step_dos',
                    'title' => ['ja' => 'DoSテスト'],
                    'sections' => [
                        [
                            'key' => 'sec_dos',
                            'title' => ['ja' => 'セクション'],
                            'fields' => [
                                [
                                    'type' => 'boolean',
                                    'key' => 'field_dos',
                                    'label' => ['ja' => 'フィールド'],
                                    'visibleWhen' => $deepCondition,
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $startCond = hrtime(true);
        $condResult = WizardConfigValidator::validate($conditionInput);
        $condElapsedMs = (hrtime(true) - $startCond) / 1e6;

        if ($condResult->ok || empty($condResult->issues) || $condResult->issues[0]->code !== ConfigIssueCode::SchemaInvalid) {
            $this->error('Failed: 50k-deep condition did not yield SCHEMA_INVALID');

            return self::FAILURE;
        }
        $this->line(sprintf('   [PASS] 50,000-deep condition rejected in %.2f ms (%s at %s)', $condElapsedMs, $condResult->issues[0]->code->value, $condResult->issues[0]->getPathString()));

        // 3. 1 MB payload size cap check
        $this->line('3. Testing 1 MB JSON size cap...');
        $oversizedJson = '{"schemaVersion":1,"steps":[],"pad":"' . str_repeat('a', 1_050_000) . '"}';
        $jsonResult = WizardConfigValidator::validateJson($oversizedJson);
        if ($jsonResult->ok || empty($jsonResult->issues) || $jsonResult->issues[0]->code !== ConfigIssueCode::SchemaInvalid) {
            $this->error('Failed: oversized JSON did not yield SCHEMA_INVALID');

            return self::FAILURE;
        }
        $this->line("   [PASS] >1 MB JSON rejected: {$jsonResult->issues[0]->message}");

        $this->info('All DoS benchmarks passed successfully.');

        return self::SUCCESS;
    }
}
