param(
  [string]$RemoteDbUrl = "",
  [string]$RemoteSyncUrl = "",
  [string]$SyncSecret = "",
  [switch]$EnableSync,
  [switch]$SkipInstall,
  [switch]$SkipRemoteDb,
  [switch]$SkipSeed
)

$argsList = @()
if ($RemoteDbUrl) { $argsList += "--remote-db-url=$RemoteDbUrl" }
if ($RemoteSyncUrl) { $argsList += "--remote-sync-url=$RemoteSyncUrl" }
if ($SyncSecret) { $argsList += "--sync-secret=$SyncSecret" }
if ($EnableSync) { $argsList += "--enable-sync" }
if ($SkipInstall) { $argsList += "--skip-install" }
if ($SkipRemoteDb) { $argsList += "--skip-remote-db" }
if ($SkipSeed) { $argsList += "--skip-seed" }

node scripts/bootstrap.mjs @argsList
