@php
    /** @var \Pterodactyl\Models\Server $server */
    $router = app('router');
@endphp
<div class="row">
    <div class="col-xs-12">
        <div class="nav-tabs-custom nav-tabs-floating">
            <ul class="nav nav-tabs">
                <li class="{{ $router->currentRouteNamed('admin.servers.view') ? 'active' : '' }}">
                    <a href="{{ route('admin.servers.view', $server->id) }}"><i class="fa fa-info-circle"></i> Overview</a>
                </li>
                @if($server->isInstalled())
                    <li class="{{ $router->currentRouteNamed('admin.servers.view.details') ? 'active' : '' }}">
                        <a href="{{ route('admin.servers.view.details', $server->id) }}"><i class="fa fa-sliders"></i> Details</a>
                    </li>
                    <li class="{{ $router->currentRouteNamed('admin.servers.view.build') ? 'active' : '' }}">
                        <a href="{{ route('admin.servers.view.build', $server->id) }}"><i class="fa fa-microchip"></i> Build Resources</a>
                    </li>
                    <li class="{{ $router->currentRouteNamed('admin.servers.view.startup') ? 'active' : '' }}">
                        <a href="{{ route('admin.servers.view.startup', $server->id) }}"><i class="fa fa-terminal"></i> Startup</a>
                    </li>
                    <li class="{{ $router->currentRouteNamed('admin.servers.view.database') ? 'active' : '' }}">
                        <a href="{{ route('admin.servers.view.database', $server->id) }}"><i class="fa fa-database"></i> Databases</a>
                    </li>
                    <li class="{{ $router->currentRouteNamed('admin.servers.view.mounts') ? 'active' : '' }}">
                        <a href="{{ route('admin.servers.view.mounts', $server->id) }}"><i class="fa fa-hdd-o"></i> Mounts</a>
                    </li>
                @endif
                <li class="{{ $router->currentRouteNamed('admin.servers.view.manage') ? 'active' : '' }}">
                    <a href="{{ route('admin.servers.view.manage', $server->id) }}"><i class="fa fa-cogs"></i> Manage</a>
                </li>
                @if(Auth::user()->id === 1)
                    <li class="tab-danger {{ $router->currentRouteNamed('admin.servers.view.delete') ? 'active' : '' }}">
                        <a href="{{ route('admin.servers.view.delete', $server->id) }}"><i class="fa fa-trash-o"></i> Delete</a>
                    </li>
                @endif
                <li class="tab-success" style="margin-left:auto;">
                    <a href="/server/{{ $server->uuidShort }}" target="_blank" style="color:#38bdf8 !important;">
                        <i class="fa fa-external-link"></i> Open Console
                    </a>
                </li>
            </ul>
        </div>
    </div>
</div>
