<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServerDomain extends Model
{
    protected $table = 'server_domains';

    protected $fillable = [
        'server_id',
        'domain',
        'cf_hostname_id',
        'status',
        'verification_cname_name',
        'verification_cname_target',
    ];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}
