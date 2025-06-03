$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    studentId = "1103210016"
    date = "2024-12-31"
    type = "positive"
    description = "Student helped classmate with homework - API test"
    severity = "positive"
    category = "participation"
    action_taken = "Praised in class"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/behavior-records" -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCCESS! Behavior record created:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Host "Response Status:" $_.Exception.Response.StatusCode
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body:" $reader.ReadToEnd()
    }
}
