<?php

namespace Pterodactyl\Services\Eggs\Sharing;

use Illuminate\Support\Arr;
use Pterodactyl\Models\Egg;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Pterodactyl\Models\EggVariable;
use Illuminate\Database\ConnectionInterface;
use Pterodactyl\Services\Eggs\EggParserService;

class EggUpdateImporterService
{
    /**
     * EggUpdateImporterService constructor.
     */
    public function __construct(protected ConnectionInterface $connection, protected EggParserService $parser)
    {
    }

    /**
     * Update an existing Egg using an uploaded JSON file.
     *
     * @throws \Pterodactyl\Exceptions\Service\InvalidFileUploadException|\Throwable
     */
    public function handle(Egg $egg, UploadedFile $file): Egg
    {
        $parsed = $this->parser->handle($file);

        return $this->connection->transaction(function () use ($egg, $parsed) {
            $author = Arr::get($parsed, 'author');
            if (!empty($author) && is_string($author)) {
                $egg->author = $author;
            }

            $egg = $this->parser->fillFromParsed($egg, $parsed);
            $egg->save();

            // Update existing variables or create new ones.
            foreach ($parsed['variables'] ?? [] as $variable) {
                $cleanVar = [
                    'name' => Arr::get($variable, 'name', 'Variable'),
                    'description' => (string) (Arr::get($variable, 'description') ?? ''),
                    'default_value' => (string) (Arr::get($variable, 'default_value') ?? ''),
                    'user_viewable' => (bool) Arr::get($variable, 'user_viewable', false),
                    'user_editable' => (bool) Arr::get($variable, 'user_editable', false),
                    'rules' => (string) (Arr::get($variable, 'rules') ?? 'nullable|string'),
                ];

                EggVariable::unguarded(function () use ($egg, $variable, $cleanVar) {
                    $egg->variables()->updateOrCreate([
                        'env_variable' => $variable['env_variable'],
                    ], $cleanVar);
                });
            }

            $imported = array_map(fn ($value) => $value['env_variable'], $parsed['variables'] ?? []);

            $egg->variables()->whereNotIn('env_variable', $imported)->delete();

            return $egg->refresh();
        });
    }
}
