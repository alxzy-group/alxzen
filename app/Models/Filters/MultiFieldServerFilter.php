<?php

namespace Pterodactyl\Models\Filters;

use Illuminate\Support\Str;
use Spatie\QueryBuilder\Filters\Filter;
use Illuminate\Database\Eloquent\Builder;

class MultiFieldServerFilter implements Filter
{
    /**
     * If we detect that the value matches an IPv4 address we will use a different type of filtering
     * to look at the allocations.
     */
    private const IPV4_REGEX = '/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(\:\d{1,5})?$/';

    /**
     * A multi-column filter for the servers table that allows you to pass in a single value and
     * search across multiple columns. This allows us to provide a very generic search ability for
     * the frontend.
     *
     * @param string|array $value
     */
    public function __invoke(Builder $query, $value, string $property)
    {
        if ($query->getQuery()->from !== 'servers') {
            throw new \BadMethodCallException('Cannot use the MultiFieldServerFilter against a non-server model.');
        }

        if (is_array($value)) {
            $value = implode(',', array_map('strval', $value));
        }

        $value = trim((string) $value);
        if ($value === '') {
            return;
        }

        if (preg_match(self::IPV4_REGEX, $value) || preg_match('/^:\d{1,5}$/', $value)) {
            $query->whereHas('allocations', function (Builder $builder) use ($value) {
                $parts = explode(':', $value);

                $builder->when(
                    !Str::startsWith($value, ':'),
                    function (Builder $sub) use ($parts) {
                        $sub->where('ip', $parts[0]);
                        if (!is_null($parts[1] ?? null)) {
                            $sub->where('port', 'LIKE', "{$parts[1]}%");
                        }
                    },
                    function (Builder $sub) use ($value) {
                        $sub->where('port', 'LIKE', substr($value, 1) . '%');
                    }
                );
            });

            return;
        }

        $lower = mb_strtolower($value);

        $query
            ->where(function (Builder $builder) use ($lower) {
                $builder->whereRaw('LOWER(servers.uuid) = ?', [$lower])
                    ->orWhereRaw('LOWER(servers.uuid) LIKE ?', [$lower . '%'])
                    ->orWhereRaw('LOWER(servers.uuidShort) = ?', [$lower])
                    ->orWhereRaw('LOWER(servers.uuidShort) LIKE ?', [$lower . '%'])
                    ->orWhereRaw('LOWER(servers.external_id) = ?', [$lower])
                    ->orWhereRaw('LOWER(servers.name) LIKE ?', ['%' . $lower . '%'])
                    ->orWhereRaw("LOWER(COALESCE(servers.description, '')) LIKE ?", ['%' . $lower . '%'])
                    ->orWhereHas('node', function (Builder $node) use ($lower) {
                        $node->whereRaw('LOWER(name) LIKE ?', ['%' . $lower . '%']);
                    });
            });
    }
}
