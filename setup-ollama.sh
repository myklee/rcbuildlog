#!/bin/bash

echo "🚀 RC Build Log - Ollama Setup Script"
echo "====================================="
echo ""

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed!"
else
    echo "📥 Installing Ollama..."
    
    # Detect OS and install Ollama
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Detected macOS"
        curl -fsSL https://ollama.ai/install.sh | sh
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Detected Linux"
        curl -fsSL https://ollama.ai/install.sh | sh
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        echo "Detected Windows"
        echo "Please visit https://ollama.ai/ to download the Windows installer"
        exit 1
    else
        echo "Unsupported OS: $OSTYPE"
        echo "Please visit https://ollama.ai/ to download manually"
        exit 1
    fi
fi

echo ""
echo "🔄 Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
echo "⏳ Waiting for Ollama to start..."
sleep 5

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running!"
else
    echo "❌ Failed to start Ollama. Please try running 'ollama serve' manually"
    exit 1
fi

echo ""
echo "📦 Pulling Llama2 model (this may take a few minutes)..."
ollama pull llama2:7b

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start your RC Build Log application"
echo "2. Open a project and click the 'AI Parser' button"
echo "3. Click 'Test LLM Connection' to verify everything works"
echo ""
echo "To stop Ollama later, run: pkill ollama"
echo "To start Ollama again, run: ollama serve" 