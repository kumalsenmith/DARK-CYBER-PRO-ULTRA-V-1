@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title DARK CYBER PRO ULTRA - Python EXE Builder
color 0A

echo.
echo  ==================================================
echo       DARK CYBER PRO ULTRA - PYTHON EXE BUILDER
echo  ==================================================
echo.

where py >nul 2>nul
if not errorlevel 1 (
    set "PYTHON=py"
    set "PYFLAGS=-3"
    goto python_found
)

where python >nul 2>nul
if not errorlevel 1 (
    set "PYTHON=python"
    set "PYFLAGS="
    goto python_found
)

echo [ERROR] Python was not found.
echo Install Python 3.10-3.13 from https://www.python.org/downloads/
echo During installation, enable "Add Python to PATH".
goto fail

:python_found
echo [1/4] Python version:
%PYTHON% %PYFLAGS% --version
if errorlevel 1 goto fail

echo.
echo [2/4] Creating local virtual environment if needed...
if not exist ".venv\Scripts\python.exe" (
    %PYTHON% %PYFLAGS% -m venv .venv
    if errorlevel 1 goto fail
)

set "VPY=%CD%\.venv\Scripts\python.exe"

echo.
echo [3/4] Installing required Python packages...
"%VPY%" -m pip install --upgrade pip
if errorlevel 1 goto fail
"%VPY%" -m pip install -r requirements.txt
if errorlevel 1 goto fail

echo.
echo [4/4] Building Windows application...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist BLACK_HAT_CYBER_OPS.spec del /q BLACK_HAT_CYBER_OPS.spec

"%VPY%" -m PyInstaller --noconfirm --clean --onefile --windowed ^
  --name BLACK_HAT_CYBER_OPS ^
  --add-data "index.html;." ^
  --add-data "style.css;." ^
  --add-data "app.js;." ^
  --collect-all webview ^
  --collect-all proxy_tools ^
  main.py

if errorlevel 1 (
    echo.
    echo [ERROR] PyInstaller build failed. See the error above.
    goto fail
)

if not exist "dist\BLACK_HAT_CYBER_OPS.exe" (
    echo [ERROR] EXE was not created.
    goto fail
)

echo.
echo [SUCCESS] EXE created:
echo %CD%\dist\BLACK_HAT_CYBER_OPS.exe
echo.
echo NOTE: Microsoft Edge WebView2 Runtime is required on the target PC.
echo It is included on most current Windows 10/11 systems.
start "" "%CD%\dist"
echo.
echo Build completed successfully.
pause
exit /b 0

:fail
echo.
echo BUILD FAILED. Please read the error shown above.
pause
exit /b 1
