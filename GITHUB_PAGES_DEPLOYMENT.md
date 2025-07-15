# GitHub Pages Deployment Guide

This guide will help you deploy your RC Build Log application to GitHub Pages with cloud-based LLM support.

## 🚀 Quick Setup

### 1. Get an API Key

**Option A: OpenAI (Recommended)**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get an API key
3. Add credits to your account (required for API usage)

**Option B: Anthropic Claude**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account and get an API key
3. Add credits to your account

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# For OpenAI
VITE_OPENAI_API_KEY=your_openai_api_key_here

# For Anthropic (if using Claude)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Update Configuration

Edit `src/config/llm.js` to use your preferred provider:

```javascript
export const LLM_CONFIG = {
  provider: 'openai', // or 'anthropic'
  // ... rest of config
}
```

### 4. Deploy to GitHub Pages

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add cloud LLM support for GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Select "Deploy from a branch"
   - Choose "main" branch and "/docs" folder
   - Click "Save"

3. **Build and Deploy:**
   ```bash
   npm run build
   ```
   
   Then copy the contents of the `dist` folder to a `docs` folder in your repository root.

4. **Add Environment Variables to GitHub:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add your API key as a secret

## 🔧 Advanced Configuration

### Environment Variables in GitHub Pages

Since GitHub Pages doesn't support server-side environment variables, you have a few options:

#### Option 1: Build-time Environment Variables
1. Set environment variables in your GitHub Actions workflow
2. Build the app with the variables embedded

#### Option 2: Client-side Configuration
1. Create a config file that gets updated during build
2. Use GitHub Actions to inject the API key

#### Option 3: Use a Backend Proxy
1. Create a simple backend service (Vercel, Netlify, etc.)
2. Proxy API calls through your backend to hide the API key

### Recommended: Option 1 (Build-time)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      env:
        VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        VITE_ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 🔒 Security Considerations

### API Key Security
- **Never commit API keys to your repository**
- Use GitHub Secrets for sensitive data
- Consider using a backend proxy for production

### Rate Limiting
- OpenAI: ~3,000 requests per minute
- Anthropic: ~100 requests per minute
- Monitor your usage to avoid unexpected charges

### CORS Issues
- Cloud LLM APIs support CORS for browser requests
- No additional configuration needed for GitHub Pages

## 💰 Cost Estimation

### OpenAI Pricing (GPT-3.5-turbo)
- Input: $0.0015 per 1K tokens
- Output: $0.002 per 1K tokens
- Typical RC spec extraction: ~500-1000 tokens
- **Cost per extraction: ~$0.001-0.002**

### Anthropic Pricing (Claude-3-haiku)
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens
- Typical RC spec extraction: ~500-1000 tokens
- **Cost per extraction: ~$0.0005-0.001**

## 🧪 Testing Your Deployment

1. **Test the Build Spec Sheet:**
   - Open your deployed app
   - Create a project and add some log entries
   - Click "Build Specs" to test the form

2. **Test the AI Parser:**
   - Click "AI Parser" button
   - Click "Test LLM Connection"
   - Should show "LLM connection successful!"

3. **Test with Real Data:**
   - Add a log entry with RC specs like:
     ```
     "Installed Hobbywing 3650 3200KV brushless motor with 60A ESC, 
      running on 3S 5000mAh LiPo battery with XT60 connectors"
     ```
   - Use "Parse All Project Content"
   - Check if specs are extracted correctly

## 🐛 Troubleshooting

### Common Issues

**"LLM connection failed"**
- Check your API key is correct
- Verify you have credits in your account
- Check the browser console for detailed errors

**"Build spec sheet not loading"**
- Check Supabase connection
- Verify RLS policies are correct
- Check browser console for errors

**"Environment variables not working"**
- Ensure variables start with `VITE_`
- Rebuild the app after changing variables
- Check GitHub Secrets are set correctly

### Debug Mode

Enable debug logging by checking the browser console:
- Press F12 to open developer tools
- Look for LLM-related logs
- Check network tab for API calls

## 📈 Performance Optimization

### For Production Use
1. **Use GPT-3.5-turbo** for faster, cheaper responses
2. **Implement caching** for repeated extractions
3. **Add rate limiting** to prevent abuse
4. **Monitor API usage** to control costs

### For Development
1. **Use local models** (Ollama) to avoid API costs
2. **Implement offline mode** for basic functionality
3. **Add fallback parsing** when LLM is unavailable

## 🎯 Next Steps

1. **Deploy your app** following this guide
2. **Test all functionality** thoroughly
3. **Monitor API usage** and costs
4. **Consider adding more features** like:
   - Batch processing of multiple entries
   - Export to PDF/CSV
   - Integration with RC parts databases
   - Image analysis for parts identification

Your RC Build Log app is now ready for GitHub Pages deployment with cloud LLM support! 🚗💨 