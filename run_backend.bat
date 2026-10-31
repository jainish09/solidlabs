@echo off
setlocal
cd /d "%~dp0"

echo ============================================================================
echo Starting SolidLabs AI Manufacturing Backend Server...
echo ============================================================================
echo.

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in .venv!
    echo Creating virtual environment...
    python -m venv .venv
    echo Installing requirements...
    .\.venv\Scripts\pip install -r requirements.txt
)

echo Starting FastAPI server on http://127.0.0.1:8001 ...
echo.
echo - Swagger API Docs:  http://localhost:8001/api/v1/docs
echo - Admin Dashboard:   http://localhost:8001/admin
echo - 3D Studio Viewer:  http://localhost:8001/studio
echo.
echo Press CTRL+C to stop the server.
echo ============================================================================
echo.

.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
pause
