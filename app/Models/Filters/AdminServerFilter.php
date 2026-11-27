<?php

namespace Pterodactyl\Models\Filters;

use Spatie\QueryBuilder\Filters\Filter;
use Illuminate\Database\Eloquent\Builder;

class AdminServerFilter implements Filter
{
    /**
     * A multi-column filter for the servers table that allows an administrative user to search
     * across UUID, name, owner username, and owner email.
     *
     * @param string $value
     */
    public function __invoke(Builder $query, $value, string $property)
    {
        if ($query->getQuery()->from !== 'servers') {
            throw new \BadMethodCallException('Cannot use the AdminServerFilter against a non-server model.');
        }
        $value = trim((string) $value);
        if ($value === '') {
            return;
        }

        $lower = mb_strtolower($value);

        $query
            ->select('servers.*')
            ->leftJoin('users', 'users.id', '=', 'servers.owner_id')
            ->where(function (Builder $builder) use ($lower) {
                $builder->whereRaw('LOWER(servers.uuid) = ?', [$lower])
                    ->orWhereRaw('LOWER(servers.uuid) LIKE ?', [$lower . '%'])
                    ->orWhereRaw('LOWER(servers.uuidShort) = ?', [$lower])
                    ->orWhereRaw('LOWER(servers.uuidShort) LIKE ?', [$lower . '%'])
                    ->orWhereRaw('LOWER(servers.external_id) = ?', [$lower])
                    ->orWhereRaw('LOWER(users.username) LIKE ?', ['%' . $lower . '%'])
                    ->orWhereRaw('LOWER(users.email) LIKE ?', [$lower . '%'])
                    ->orWhereRaw('LOWER(servers.name) LIKE ?', ['%' . $lower . '%']);
            })
            ->groupBy('servers.id');
    }
}
