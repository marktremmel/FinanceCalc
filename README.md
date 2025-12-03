# Finance Calculator (Kiszámoló)

**A digital financial literacy education tool for 9th-10th grade students.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🌐 Live Demo](https://marktremmel.github.io/FinanceCalc/) | [📚 Course Resources](https://ghoul3.notion.site)

## 📖 Overview

Finance Calculator is an interactive web application designed to teach digital financial literacy to high school students (grades 9-10). Through hands-on calculations and simulations, students learn about income, taxes, expenses, loans, inflation, and investment strategies in an engaging way.

### ✨ Features

- **💰 Income & Tax Calculator**: Learn about gross vs. net income, tax deductions, and social security
- **📊 Income Quintiles**: Understand where you stand on the social ladder based on Hungarian income data
- **📝 Expense Tracking**: Interactive expense manager to understand monthly budgeting
- **🏠 Housing Calculator**: Compare renting vs. buying scenarios with adjustable home size
- **📈 Inflation Simulator**: Visualize how inflation affects purchasing power over time
- **🎲 Life Simulator**: Experience randomsurvival events in a gamified financial simulation
- **💎 Investment Comparison**: Compare cash, government bonds, and stock market returns
- **🌍 Multi-language Support**: Available in Hungarian, English, Spanish, German, Russian, Chinese, and Turkish

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/marktremmel/FinanceCalc.git
cd FinanceCalc/finance-calc

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎓 Educational Use

This tool was created for teaching digital financial literacy at SEK Budapest. The interactive approach helps students:

1. Understand the difference between gross and net income
2. Grasp the impact of taxes and social security contributions
3. Learn budgeting through expense tracking
4. Make informed decisions about housing (rent vs. buy)
5. Understand inflation's effect on money value
6. Compare different investment strategies
7. Experience financial decision-making through simulation

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build**: Vite
- **Deployment**: GitHub Pages

## 📊 Data Sources

- **Income Data**: [KSH (Hungarian Central Statistical Office)](https://www.ksh.hu/stadat_files/jov/hu/jov0055.html)
- **Quintiles**: [KSH Income Distribution](https://www.ksh.hu/stadat_files/jov/hu/jov0052.html)
- **Housing Prices**: [Negyzetmeterarak.hu](https://negyzetmeterarak.hu/statisztika?ugylet=elado&tipus=lakas)
- **Rental Prices**: [Negyzetmeterarak.hu](https://negyzetmeterarak.hu/statisztika?ugylet=kiado&tipus=lakas)
- **Average Home Size**: [Koltozzbe.hu](https://koltozzbe.hu/statisztikak/budapest/)
- **Loan Rates**: [Bankmonitor](https://bankmonitor.hu/mediatar/cikk/mire-szamithatsz-2025-oktobereben-ha-most-vennel-fel-lakashitelt/)
- **Inflation Data**: [KSH Inflation Statistics](https://www.ksh.hu/stadat_files/ara/hu/ara0040.html)

> **Disclaimer**: Data is for educational purposes and based on estimates. May contain inaccuracies.

## 🌐 Deployment

### GitHub Pages Deployment

1. **Configure Vite for GitHub Pages**:
   - The `vite.config.js` is already configured with `base: '/FinanceCalc/'`

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy to GitHub Pages**:
   ```bash
   # Install gh-pages package
   npm install -D gh-pages
   
   # Add deploy script to package.json (already added)
   # "deploy": "npm run build && gh-pages -d dist"
   
   # Deploy
   npm run deploy
   ```

4. **Configure GitHub Repository**:
   - Go to your repository settings
   - Navigate to Pages section
   - Set source to `gh-pages` branch
   - Your site will be live at: `https://marktremmel.github.io/FinanceCalc/`

### Alternative: Manual Deployment

```bash
# Build the project
npm run build

# The dist folder contains your production build
# Upload the contents to your hosting service
```

## 📝 License

MIT License - Created by Mark Tremmel (SEK Budapest) with Google Antigravity for teaching digital financial literacy.

## 🤝 Contributing

This is an educational project. Suggestions and improvements are welcome! Please open an issue or submit a pull request.

## 📧 Contact

Mark Tremmel - SEK Budapest

---

**Made with ❤️ for financial education**
