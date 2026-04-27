@echo off
REM Double-click this file, or run from cmd, to delete %USERPROFILE%\CrossDevice and show C: free space.
echo Running clear-crossdevice-and-free-c.ps1 ...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0clear-crossdevice-and-free-c.ps1"
echo.
pause
