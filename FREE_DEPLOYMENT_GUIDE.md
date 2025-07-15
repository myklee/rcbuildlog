# 🆓 Free GitHub Pages Deployment Guide

This guide shows you how to deploy your RC Build Log app to GitHub Pages using **completely free** LLM options.

## 🎯 **Free Options Overview**

| Provider | Free Tier | Setup Difficulty | Quality | Best For |
|----------|-----------|------------------|---------|----------|
| **OpenRouter** | Multiple models | Easy | Excellent | Best quality |
| **Replicate** | Limited usage | Medium | Good | Alternative |
| **Fallback Parser** | Unlimited | None | Basic | No setup needed |

## 🚀 **Quick Start - Choose Your Option**

### **Option 1: OpenRouter (Best Quality)**

**Why choose this?** Access to multiple high-quality models, generous free tier.

#### Setup Steps:
1. **Create OpenRouter Account**
   - Visit [openrouter.ai](https://openrouter.ai/)
   - Click "Sign Up" and create account

2. **Get API Key**
   - Go to [openrouter.ai/keys](https://openrouter.ai/keys)
   - Click "Create Key"
   - Copy the API key

3. **Configure Your App**
   ```bash
   # Create .env file in project root
   echo "VITE_OPENROUTER_API_KEY=your_key_here" > .env
   ```

4. **Update Configuration**
   ```javascript
   // In src/config/llm.js
   export const LLM_CONFIG = {
     provider: 'openrouter',
     // ... rest stays the same
   }
   ```

### **Option 2: Fallback Parser (No Setup)**

**Why choose this?** Works immediately, no API keys, completely free.

#### Setup Steps:
1. **Update Configuration**
   ```javascript
   // In src/config/llm.js
   export const LLM_CONFIG = {
     provider: 'fallback',
     // No additional config needed
   }
   ```

2. **Deploy Immediately**
   ```bash
   npm run build
   git add .
   git commit -m "Add fallback parser"
   git push origin main
   ```

## 🔧 **Detailed Setup Instructions**

### **OpenRouter Setup**

1. **Account Creation**
   - Visit [openrouter.ai](https://openrouter.ai/)
   - Sign up with email or GitHub

2. **API Key Generation**
   - Go to [Keys page](https://openrouter.ai/keys)
   - Click "Create Key"
   - Name: `RC Build Log`
   - Copy the key

3. **Environment Setup**
   ```bash
   # Create .env file
   cat > .env << EOF
   VITE_OPENROUTER_API_KEY=sk-or-v1-your_key_here
   EOF
   ```

4. **Configuration Update**
   ```javascript
   // Edit src/config/llm.js
   export const LLM_CONFIG = {
     provider: 'openrouter',
     openrouter: {
       apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
       model: 'openai/gpt-3.5-turbo', // Free model
       baseUrl: 'https://openrouter.ai/api/v1',
     }
   }
   ```

### **Fallback Parser Setup**

1. **No Account Required**
   - This option works immediately
   - No API keys or external services needed

2. **Configuration Update**
   ```javascript
   // Edit src/config/llm.js
   export const LLM_CONFIG = {
     provider: 'fallback',
     // No additional configuration needed
   }
   ```

3. **Test the Parser**
   ```bash
   # Start development server
   npm run dev
   
   # Open browser console and test:
   import { fallbackParser } from './src/services/fallbackParser.js'
   fallbackParser.testParser()
   ```

## 🌐 **GitHub Pages Deployment**

### **Step 1: Prepare Your Repository**

```bash
# Ensure your code is committed
git add .
git commit -m "Add free LLM support"
git push origin main
```

### **Step 2: Enable GitHub Pages**

1. Go to your repository on GitHub
2. Click "Settings" → "Pages"
3. Source: "Deploy from a branch"
4. Branch: "main"
5. Folder: "/docs"
6. Click "Save"

### **Step 3: Build and Deploy**

```bash
# Build your app
npm run build

# Create docs folder and copy build files
mkdir docs
cp -r dist/* docs/

# Commit and push
git add docs/
git commit -m "Add built files for GitHub Pages"
git push origin main
```

### **Step 4: Add Environment Variables (Optional)**

For OpenRouter and Replicate, you can add environment variables to GitHub:

1. Go to repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add your API key as a secret
4. Create GitHub Actions workflow to inject during build

## 🧪 **Testing Your Deployment**

### **Test Checklist**

- [ ] **Build Spec Sheet**: Create a project and test the form
- [ ] **AI Parser**: Click "AI Parser" button
- [ ] **Connection Test**: Click "Test LLM Connection"
- [ ] **Parse Test**: Add a log entry with RC specs and test parsing
- [ ] **Auto-Populate**: Test auto-filling build specs

### **Sample Test Data**

Add this log entry to test:
```
"Installed Hobbywing 3650 3200KV brushless motor with 60A ESC. 
Running on 3S 5000mAh LiPo battery with XT60 connectors. 
The car is a 1/10 scale Traxxas Slash 4x4 with Pro-Line Badlands tires."
```

Expected extraction:
- Motor: 3650 brushless, 3200KV
- ESC: 60A
- Battery: 3S 5000mAh LiPo, XT60
- Vehicle: 1/10 Traxxas Slash 4x4
- Tires: Pro-Line Badlands

## 🔍 **Troubleshooting**

### **Common Issues**

**"LLM connection failed"**
- Check your API key is correct
- Verify the provider is set correctly in `src/config/llm.js`
- Check browser console for detailed errors

**"Environment variables not working"**
- Ensure variables start with `VITE_`
- Rebuild the app after changing variables
- Check GitHub Secrets are set correctly

**"Fallback parser not working"**
- Check browser console for errors
- Verify the provider is set to 'fallback'
- Test with the sample text above

### **Debug Mode**

Enable debug logging:
```javascript
// In browser console
console.log('LLM Config:', LLM_CONFIG)
console.log('Provider:', LLM_CONFIG.provider)
```

## 📊 **Performance Comparison**

| Feature | OpenRouter | Replicate | Fallback Parser |
|---------|------------|-----------|-----------------|
| **Setup Time** | 5 minutes | 5 minutes | 1 minute |
| **API Calls** | Required | Required | None |
| **Quality** | Excellent | Good | Basic |
| **Speed** | Fast | Fast | Instant |
| **Cost** | Free tier | Free tier | Completely free |
| **Offline** | No | No | Yes |

## 🎯 **Recommendations**

### **For Beginners**
- Start with **Fallback Parser** (no setup)
- Upgrade to **OpenRouter** when ready

### **For Best Quality**
- Use **OpenRouter** with GPT-3.5-turbo
- Fallback to Replicate if needed

### **For Development**
- Use **Fallback Parser** for testing
- Use **Ollama** locally for development

## 🚀 **Next Steps**

1. **Choose your preferred option** from the list above
2. **Follow the setup steps** for your chosen provider
3. **Test locally** before deploying
4. **Deploy to GitHub Pages** using the deployment guide
5. **Share your app** with the RC community!

Your RC Build Log app is now ready for free deployment with AI-powered spec extraction! 🚗💨 