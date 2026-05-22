# One-time contrast pass: replace opacity-muted Tailwind with solid semantic tokens.
$replacements = @(
  @('text-kelly-page/40', 'text-kelly-inverse-muted'),
  @('text-kelly-page/45', 'text-kelly-inverse-muted'),
  @('text-kelly-page/50', 'text-kelly-inverse-muted'),
  @('text-kelly-page/55', 'text-kelly-inverse-muted'),
  @('text-kelly-page/65', 'text-kelly-inverse-soft'),
  @('text-kelly-page/70', 'text-kelly-inverse-soft'),
  @('text-kelly-page/80', 'text-kelly-inverse-soft'),
  @('text-kelly-page/85', 'text-kelly-inverse'),
  @('text-kelly-page/90', 'text-kelly-inverse'),
  @('text-kelly-text/45', 'text-kelly-subtle'),
  @('text-kelly-text/50', 'text-kelly-subtle'),
  @('text-kelly-text/55', 'text-kelly-muted'),
  @('text-kelly-text/60', 'text-kelly-muted'),
  @('text-kelly-text/65', 'text-kelly-muted'),
  @('text-kelly-text/70', 'text-kelly-muted')
)
$count = 0
Get-ChildItem -Path src\app\admin, src\components\admin -Recurse -Filter *.tsx | ForEach-Object {
  $content = [IO.File]::ReadAllText($_.FullName)
  $original = $content
  foreach ($pair in $replacements) {
    $content = $content.Replace($pair[0], $pair[1])
  }
  if ($content -ne $original) {
    [IO.File]::WriteAllText($_.FullName, $content)
    $count++
  }
}
Write-Host "Updated $count admin TSX files"
