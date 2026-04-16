$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()
Write-Host "Server started on http://localhost:8080"
Write-Host "Serving from: $baseDir"
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $localPath = [System.Uri]::UnescapeDataString($req.Url.LocalPath)
    if ($localPath -eq '/' -or $localPath -eq '') { $localPath = '/index.html' }
    $safeRel = $localPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
    $filePath = [System.IO.Path]::Combine($baseDir, $safeRel)
    Write-Host "GET $localPath -> $filePath"
    if ([System.IO.File]::Exists($filePath)) {
        try {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.png'  { 'image/png' }
                '.jpg'  { 'image/jpeg' }
                '.svg'  { 'image/svg+xml' }
                '.ico'  { 'image/x-icon' }
                default { 'application/octet-stream' }
            }
            $res.ContentType = $mime
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  -> 200 OK ($($bytes.Length) bytes)"
        } catch {
            $res.StatusCode = 500
            Write-Host "  -> 500 ERROR: $_"
        }
    } else {
        $res.StatusCode = 404
        Write-Host "  -> 404 NOT FOUND"
    }
    $res.OutputStream.Close()
    $res.Close()
}
