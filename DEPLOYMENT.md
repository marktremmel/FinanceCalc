# Deployment Guide for Finance Calculator

This guide explains how to deploy the Finance Calculator to GitHub Pages at `https://marktremmel.github.io/FinanceCalc/`.

## Prerequisites

- Git installed and configured
- GitHub account
- Node.js and npm installed
- Repository created on GitHub (`marktremmel/FinanceCalc`)

## Initial Setup

### 1. Create GitHub Repository

If you haven't already created the repository:

```bash
# On GitHub, create a new repository named 'FinanceCalc'
# Do NOT initialize it with README, .gitignore, or license (we already have these)
```

### 2. Configure Git Remote

```bash
# Navigate to your project
cd /Users/marktremmel/Documents/SEK/CodeProjects_Antigravity/kiszamolo/finance-calc

# Initialize git if not already done
git init

# Add the remote repository
git remote add origin https://github.com/marktremmel/FinanceCalc.git

# Or if remote already exists (you can check with `git remote -v`):
git remote set-url origin https://github.com/marktremmel/FinanceCalc.git
```

### 3. Install Deployment Package

```bash
npm install -D gh-pages
```

The `package.json` already has the deploy scripts configured:
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist",
    "predeploy": "npm run build"
  }
}
```

## Deploying to GitHub Pages

### First Deployment

```bash
# 1. Add all files to git
git add .

# 2. Commit your changes
git commit -m "Initial commit - Finance Calculator v1.0"

# 3. Push to main branch
git push -u origin main

# 4. Deploy to GitHub Pages
npm run deploy
```

The `npm run deploy` command will:
1. Run `npm run build` (via predeploy script)
2. Create a `gh-pages` branch
3. Push the `dist` folder contents to that branch
4. GitHub Pages will automatically serve from the `gh-pages` branch

### Configure GitHub Pages Settings

1. Go to your repository on GitHub: `https://github.com/marktremmel/FinanceCalc`
2. Click on **Settings**
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

Your site will be published at: **https://marktremmel.github.io/FinanceCalc/**

### Subsequent Deployments

After making changes:

```bash
# 1. Add and commit your changes
git add .
git commit -m "Description of your changes"

# 2. Push to main branch (to keep your source code updated)
git push origin main

# 3. Deploy the updated build
npm run deploy
```

## Vite Configuration

The `vite.config.js` is already configured with the correct base path:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FinanceCalc/',  // Important for GitHub Pages
})
```

**Note**: The base must match your repository name for assets to load correctly.

## Troubleshooting

### Site not loading / 404 errors
- Verify the `base` in `vite.config.js` matches your repository name
- Check that GitHub Pages is enabled in repository settings
- Wait a few minutes after deploying for changes to propagate

### Assets not loading (broken images, CSS)
- Ensure `base: '/FinanceCalc/'` is set in `vite.config.js`
- Rebuild and redeploy: `npm run deploy`

### Build errors
- Run `npm run build` locally first to catch errors
- Check console output for specific error messages
- Ensure all dependencies are installed: `npm install`

## Project Structure

```
finance-calc/
├── dist/              # Build output (auto-generated, don't commit)
├── node_modules/      # Dependencies (don't commit)
├── public/            # Static assets
├── src/               # Source code
│   ├── About.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── simulatorData.js
│   └── translations.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Useful Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:5173

# Building
npm run build        # Build for production (creates dist folder)
npm run preview      # Preview production build locally

# Deployment
npm run deploy       # Build and deploy to GitHub Pages

# Git
git status           # Check current status
git log --oneline    # View commit history
git push origin main # Push to main branch
```

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public` folder with your domain:
   ```
   yourdomain.com
   ```

2. Configure DNS settings with your domain provider:
   - Add a CNAME record pointing to `marktremmel.github.io`

3. In GitHub repository settings > Pages, enter your custom domain

## License

MIT License - See README.md for full license text.

---

**For questions or issues, contact Mark Tremmel at SEK Budapest** 
