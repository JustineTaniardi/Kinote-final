# Script to run the category cleanup and seeding
Write-Host "🔄 Running category cleanup and seeding script..." -ForegroundColor Cyan

npx ts-node prisma/clean-and-seed-categories.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Category cleanup and seeding completed!" -ForegroundColor Green
} else {
    Write-Host "❌ An error occurred during seeding!" -ForegroundColor Red
    exit 1
}
