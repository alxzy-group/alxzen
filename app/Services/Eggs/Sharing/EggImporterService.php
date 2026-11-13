<?php

namespace Pterodactyl\Services\Eggs\Sharing;

use Ramsey\Uuid\Uuid;
use Illuminate\Support\Arr;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Nest;
use Illuminate\Http\UploadedFile;
use Pterodactyl\Models\EggVariable;
use Illuminate\Database\ConnectionInterface;
use Pterodactyl\Services\Eggs\EggParserService;

class EggImporterService
{
    public function __construct(protected ConnectionInterface $connection, protected EggParserService $parser)
    {
    }

    /**
     * Take an uploaded JSON file and parse it into a new egg.
     *
     * @throws \Pterodactyl\Exceptions\Service\InvalidFileUploadException|\Throwable
     */
    public function handle(UploadedFile $file, int $nest): Egg
    {
        $parsed = $this->parser->handle($file);

        /** @var Nest $nest */
        $nest = Nest::query()->with('eggs', 'eggs.variables')->findOrFail($nest);

        return $this->connection->transaction(function () use ($nest, $parsed) {
            $author = Arr::get($parsed, 'author');
            if (empty($author) || !is_string($author)) {
                $author = config('pterodactyl.service.author', 'support@pterodactyl.io');
            }

            $egg = (new Egg())->forceFill([
                'uuid' => Uuid::uuid4()->toString(),
                'nest_id' => $nest->id,
                'author' => $author,
                'copy_script_from' => null,
            ]);

            $egg = $this->parser->fillFromParsed($egg, $parsed);
            $egg->save();

            foreach ($parsed['variables'] ?? [] as $variable) {
                $cleanVar = [
                    'egg_id' => $egg->id,
                    'name' => Arr::get($variable, 'name', 'Variable'),
                    'description' => (string) (Arr::get($variable, 'description') ?? ''),
                    'env_variable' => Arr::get($variable, 'env_variable'),
                    'default_value' => (string) (Arr::get($variable, 'default_value') ?? ''),
                    'user_viewable' => (bool) Arr::get($variable, 'user_viewable', false),
                    'user_editable' => (bool) Arr::get($variable, 'user_editable', false),
                    'rules' => (string) (Arr::get($variable, 'rules') ?? 'nullable|string'),
                ];

                EggVariable::query()->create($cleanVar);
            }

            return $egg;
        });
    }
}
