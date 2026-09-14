@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo   SM HUB - aggiornamento impianti
echo ============================================================
echo.
echo Fonte: maxi-impianti.xlsx del sito Diesse Media (cartella qui accanto).
echo Gli impianti si correggono LA', non qui.
echo.
python build-impianti.py
if errorlevel 1 py build-impianti.py
echo.
echo ------------------------------------------------------------
echo   Fatto. Per pubblicare online:
echo     git add -A ^&^& git commit -m "aggiorna impianti" ^&^& git push
echo ------------------------------------------------------------
pause
