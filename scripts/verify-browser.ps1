$proc = Start-Process "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "--headless=new", "--dump-dom", "--virtual-time-budget=2000", "http://localhost:3000/index.html" -NoNewWindow -PassThru -RedirectStandardOutput "dump-dom.html"
$proc.WaitForExit(10000)

if (Test-Path "dump-dom.html") {
  $content = Get-Content "dump-dom.html" -Raw
  Write-Host "DOM Content Length: $($content.Length) bytes"

  if ($content -match "lf-001") {
    Write-Host "✅ Product items rendered in DOM successfully!"
  } else {
    Write-Host "❌ Product items NOT found in DOM"
  }

  if ($content -match "<canvas") {
    Write-Host "✅ Three.js 3D Canvas element created successfully!"
  } else {
    Write-Host "❌ Three.js 3D Canvas NOT found"
  }

  if ($content -match "0797035039") {
    Write-Host "✅ WhatsApp Phone 0797035039 verified in DOM!"
  }

  Remove-Item "dump-dom.html" -Force
} else {
  Write-Host "Failed to dump DOM"
}
