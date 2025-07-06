@echo off
echo 🚀 RC Build Log - Ollama Setup Script
echo =====================================
echo.

REM Check if Ollama is already installed
where ollama >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ Ollama is already installed!
) else (
    echo 📥 Ollama is not installed.
    echo.
    echo Please visit https://ollama.ai/ to download and install Ollama for Windows
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo.
echo 🔄 Starting Ollama service...
start /B ollama serve

REM Wait for Ollama to start
echo ⏳ Waiting for Ollama to start...
timeout /t 5 /nobreak >nul

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ Ollama is running!
) else (
    echo ❌ Failed to start Ollama. Please try running 'ollama serve' manually
    pause
    exit /b 1
)

echo.
echo 📦 Pulling Llama2 model (this may take a few minutes)...
ollama pull llama2:7b

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Start your RC Build Log application
echo 2. Open a project and click the 'AI Parser' button
echo 3. Click 'Test LLM Connection' to verify everything works
echo.
echo To stop Ollama later, close the terminal or run: taskkill /f /im ollama.exe
echo To start Ollama again, run: ollama serve
pause 