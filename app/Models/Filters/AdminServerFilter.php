<?php

namespace Pterodactyl\Models\Filters;

use Spatie\QueryBuilder\Filters\Filter;
use Illuminate\Database\Eloquent\Builder;

class AdminServerFilter implements Filter
{
    /**
     * A multi-column filter for the servers table that allows an administrative user to search
     * across UUID, name, owner username/email, node name, and allocation IP/alias/port.
     *
     * @param string|array $value
     */
    public function __invoke(Builder $query, $value, string $property)
    {
        if ($query->getQuery()->from !== 'servers') {
            throw new \BadMethodCallException('Cannot use the AdminServerFilter against a non-server model.');
        }

        if (is_array($value)) {
            $value = implode(',', array_map('strval', $value));
        }

        $value = trim((string) $value);
        if ($value === '') {
            return;
        }

        $lower = mb_strtolower($value);

        $query->where(function (Builder $builder) use ($lower) {
            $builder->whereRaw('LOWER(servers.uuid) = ?', [$lower])
                ->orWhereRaw('LOWER(servers.uuid) LIKE ?', [$lower . '%'])
                ->orWhereRaw('LOWER(servers.uuidShort) = ?', [$lower])
                ->orWhereRaw('LOWER(servers.uuidShort) LIKE ?', [$lower . '%'])
                ->orWhereRaw('LOWER(servers.external_id) = ?', [$lower])
                ->orWhereRaw('LOWER(servers.name) LIKE ?', ['%' . $lower . '%'])
                ->orWhereRaw("LOWER(COALESCE(servers.description, '')) LIKE ?", ['%' . $lower . '%'])
                ->orWhereHas('user', function (Builder $user) use ($lower) {
                    $user->whereRaw('LOWER(username) LIKE ?', ['%' . $lower . '%'])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$lower . '%']);
                })
                ->orWhereHas('node', function (Builder $node) use ($lower) {
                    $node->whereRaw('LOWER(name) LIKE ?', ['%' . $lower . '%']);
                })
                ->orWhereHas('allocation', function (Builder $allocation) use ($lower) {
                    $allocation->whereRaw('LOWER(ip) LIKE ?', ['%' . $lower . '%'])
                        ->orWhereRaw("LOWER(COALESCE(ip_alias, '')) LIKE ?", ['%' . $lower . '%'])
                        ->orWhereRaw('CAST(port AS CHAR) LIKE ?', ['%' . $lower . '%']);
                });
        });
    }
}
