<?php

declare(strict_types=1);

namespace App\Ai\Schema;

final class DesignConstraints
{
    /**
     * Allowed canonical room types in design constraints.
     *
     * @var list<string>
     */
    public const ROOM_TYPES = [
        'ldk',
        'living',
        'dining',
        'kitchen',
        'bedroom',
        'childRoom',
        'washitsu',
        'tatami',
        'bath',
        'wash',
        'toilet',
        'entrance',
        'hall',
        'corridor',
        'stairs',
        'storage',
        'closet',
        'walkInCloset',
        'pantry',
        'laundry',
        'study',
        'balcony',
        'void',
        'guest',
        'hobby',
        'porch',
        'deck',
        'elevator',
    ];

    /**
     * Allowed orientations.
     *
     * @var list<string>
     */
    public const ORIENTATIONS = ['north', 'south', 'east', 'west', 'any'];

    /**
     * Allowed adjacency relations.
     *
     * @var list<string>
     */
    public const RELATIONS = ['near', 'far', 'adjacent'];

    /**
     * @param array{housework: int, storage: int, daylight: int, budget: int, privacy: int, family: int} $priorities
     * @param list<string> $mustHaveRooms
     * @param list<string> $avoidRooms
     * @param list<array{room: string, count: int, sizeJo: float|int}> $roomHints
     * @param list<array{a: string, b: string, relation: string}> $adjacency
     * @param array{livingFacing: string, entranceSide: string} $orientation
     * @param array{oneLevelLiving: bool, wideCorridors: bool} $accessibility
     * @param list<string> $notes
     * @param list<string> $unmappedRequests
     */
    public function __construct(
        public readonly int $schemaVersion,
        public readonly string $summary,
        public readonly array $priorities,
        public readonly array $mustHaveRooms,
        public readonly array $avoidRooms,
        public readonly array $roomHints,
        public readonly array $adjacency,
        public readonly array $orientation,
        public readonly array $accessibility,
        public readonly bool $pets,
        public readonly bool $workFromHome,
        public readonly array $notes,
        public readonly array $unmappedRequests,
    ) {
    }

    /**
     * Get the JSON schema definition for DesignConstraints.
     *
     * @return array<string, mixed>
     */
    public static function schema(): array
    {
        $path = resource_path('ai/design-constraints.schema.json');
        if (! file_exists($path)) {
            throw new \RuntimeException("Schema file not found at: {$path}");
        }

        $content = (string) file_get_contents($path);
        /** @var array<string, mixed> $schema */
        $schema = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

        return $schema;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'schemaVersion' => $this->schemaVersion,
            'summary' => $this->summary,
            'priorities' => $this->priorities,
            'mustHaveRooms' => $this->mustHaveRooms,
            'avoidRooms' => $this->avoidRooms,
            'roomHints' => $this->roomHints,
            'adjacency' => $this->adjacency,
            'orientation' => $this->orientation,
            'accessibility' => $this->accessibility,
            'pets' => $this->pets,
            'workFromHome' => $this->workFromHome,
            'notes' => $this->notes,
            'unmappedRequests' => $this->unmappedRequests,
        ];
    }
}
