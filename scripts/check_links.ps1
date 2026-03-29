$errors = @()
Get-ChildItem -Path . -Recurse -Filter *.md | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content -Raw -Path $file
    $matches = [regex]::Matches($content,'\[.*?\]\((.*?)\)')
    foreach ($m in $matches) {
        $link = $m.Groups[1].Value
        if ($link -match '^(http|https|#)') { continue }
        $target = Join-Path -Path $_.DirectoryName -ChildPath $link
        $targetNoFragment = $target -replace '#.*$',''
        if (-not (Test-Path $targetNoFragment)) {
            $errors += "MISSING:$file -> $link"
        }
    }
}
if ($errors.Count -eq 0) {
    Write-Output "OK: no missing local markdown links found"
    exit 0
} else {
    $errors | ForEach-Object { Write-Output $_ }
    exit 2
}
