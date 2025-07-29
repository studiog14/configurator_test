@echo off
REM Skrypt do automatycznego commit i push do GitHub z wyborem repo

REM === MENU WYBORU ===
echo.
echo 🔄 Wybierz repozytorium docelowe:
echo [1] Oficjalne (https://github.com/studiog14/configurator_fk.git)
echo [2] Testowe   (https://github.com/studiog14/configurator_test.git)
set /p choice=Twój wybór (1/2):

REM === USTAWIENIE URL NA PODSTAWIE WYBORU ===
if "%choice%"=="1" (
    set repoURL=https://github.com/studiog14/configurator_fk.git
) else if "%choice%"=="2" (
    set repoURL=https://github.com/studiog14/configurator_test.git
) else (
    echo ❌ Nieprawidłowy wybór. Wpisz 1 lub 2.
    pause
    exit /b
)

REM === PRZEJŚCIE DO FOLDERU PROJEKTU ===
cd /d E:\FK_Configurator\FK_Configurator

REM === USTAWIENIE REMOTE ORIGIN ===
git remote set-url origin %repoURL%

REM === DODANIE ZMIAN I COMMIT Z DATĄ ===
git add .
for /f "tokens=1-4 delims=/:. " %%a in ("%date% %time%") do (
  set datetime=%%d-%%b-%%c_%%a%%e
)
git commit -m "Auto commit: %datetime%"

REM === PUSH NA BRANCH MAIN ===
git push origin main

pause
