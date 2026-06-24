Set-Location "c:\Users\preesubs\OneDrive\Documents\quickbite"

# Remove any nested .git folders that were accidentally created
if (Test-Path "server\.git") { Remove-Item -Recurse -Force "server\.git" }
if (Test-Path "client\.git") { Remove-Item -Recurse -Force "client\.git" }

# Init at root
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/VarshiniJayakumar/quickbite.git
git push -u origin main
