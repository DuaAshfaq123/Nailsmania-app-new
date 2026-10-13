# Run from the project root (the folder that contains package.json and android\).
# Close Android Studio and stop Metro first.
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)

# ---- 0. Backup everything this script touches ---------------------------------
$backup = '_backup_before_rename'
if (Test-Path $backup) { throw "$backup already exists. Move or delete it, then run again." }
New-Item -ItemType Directory $backup | Out-Null
Copy-Item 'android\app\build.gradle' $backup
Copy-Item 'android\app\src\main\java' "$backup\java" -Recurse
Copy-Item 'src\services\download\downloadService.js' $backup
Copy-Item 'src\utils\permissions.js' $backup
Copy-Item 'src\utils\debugLog.js' $backup
Write-Host "Backup saved in $backup"

# Replaces text in a file as UTF-8 without BOM (Get-Content/Set-Content can garble the
# special characters in these files on Windows PowerShell 5).
function Edit-File($path, $pairs) {
  $text = [System.IO.File]::ReadAllText($path)
  $out = $text
  foreach ($p in $pairs) { $out = $out.Replace($p[0], $p[1]) }
  if ($out -ne $text) {
    [System.IO.File]::WriteAllText($path, $out, $utf8)
    Write-Host "updated   $path"
  } else {
    Write-Host "no change $path"
  }
}

# ---- 1. Rename the Kotlin package folder --------------------------------------
$oldDir = 'android\app\src\main\java\com\mehandi724xone'
$newDir = 'android\app\src\main\java\com\nails724xone'
if (Test-Path $oldDir) {
  Rename-Item $oldDir 'nails724xone'
  Write-Host 'renamed   folder mehandi724xone -> nails724xone'
}

# ---- 2. Update package / import lines in every Kotlin file --------------------
Get-ChildItem $newDir -Recurse -Filter *.kt | ForEach-Object {
  Edit-File $_.FullName @(,@('com.mehandi724xone', 'com.nails724xone'))
}

# ---- 3. build.gradle: namespace, application id, version ----------------------
Edit-File 'android\app\build.gradle' @(
  ,@('namespace "com.mehandi724xone"', 'namespace "com.nails724xone"')
  ,@('applicationId "com.mehandi724xone"', 'applicationId "com.nails724xone"')
  ,@('versionCode 19', 'versionCode 1')
  ,@('versionName "2.0"', 'versionName "1.0"')
)

# ---- 4. Small JS branding fixes ------------------------------------------------
Edit-File 'src\services\download\downloadService.js' @(
  ,@('Mehandi724', 'Nails724')
  ,@('mehandi_', 'nails_')
)
Edit-File 'src\utils\permissions.js' @(,@('Mehandi724', 'Nails724'))
Edit-File 'src\utils\debugLog.js' @(,@('[Mehandi Debug]', '[Nails Debug]'))

# ---- 5. Report anything that still has the old id -----------------------------
Write-Host "`nStill mentioning the old id (outside build folders):"
Get-ChildItem . -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\(node_modules|build|\.gradle|\.cxx|_backup_before_rename|\.git)\\' } |
  Select-String -Pattern 'mehandi724xone' -ErrorAction SilentlyContinue |
  ForEach-Object { "$($_.Path.Replace((Get-Location).Path,'')):$($_.LineNumber): $($_.Line.Trim())" }

Write-Host "`nDone. Now clean the Android build: cd android; .\gradlew clean"
