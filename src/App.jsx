import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { getRandomEvent, getRandomWeather } from './simulatorData';
import { Calculator, TrendingUp, Home, PieChart as PieIcon, Info, Check, X, Globe, Coins, Dice5, AlertTriangle, RefreshCw } from 'lucide-react';
import { translations } from './translations';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const REF_DATA = {
  // 2025 Income Data
  minWage2025: 290800,     // Source: https://kormanyhivatalok.hu/sites/default/files/2025-02/mennyi-is-2025-ben_1.pdf
  avgGross: 704400,        // KSH 2025 Aug Source: https://www.ksh.hu/gyorstajekoztatok/ker/ker2506.html
  avgGrossBP: 835457,      // Budapest Avg Q1-3 2025 Source: https://www.ksh.hu/stadat_files/mun/hu/mun0206.html
  medianGross: 567700,     // KSH 2025 Aug Source: https://www.ksh.hu/gyorstajekoztatok/ker/ker2506.html

  // Tax rates
  tax_SZJA: 0.15,
  tax_TB: 0.185,
  tax_SZOCHO: 0.13,

  // Housing data
  avgHomeSize: 72.2,       // Source: https://koltozzbe.hu/statisztikak/budapest/
  marketLoanRate: 0.0724,  // 7.24% Source: https://bankmonitor.hu/mediatar/cikk/mire-szamithatsz-2025-oktobereben-ha-most-vennel-fel-lakashitelt/
  supportedLoanRate: 0.03, // 3% state-supported (CSOK Plus)
  supportedLoanMax: 50000000, // 50M Ft max for 3% rate

  // Data sources
  sources: {
    income: 'https://www.ksh.hu/gyorstajekoztatok/ker/ker2506.html',
    quintiles: 'https://www.ksh.hu/stadat_files/jov/hu/jov0052.html',
    quintilesHouseholds: 'https://www.ksh.hu/stadat_files/jov/hu/jov0055.html',
    rentalPrices: 'https://negyzetmeterarak.hu/statisztika?ugylet=kiado&tipus=lakas',
    salePrices: 'https://negyzetmeterarak.hu/statisztika?ugylet=elado&tipus=lakas',
    homeSize: 'https://koltozzbe.hu/statisztikak/budapest/',
    loanRate: 'https://bankmonitor.hu/mediatar/cikk/mire-szamithatsz-2025-oktobereben-ha-most-vennel-fel-lakashitelt/',
  }
};

// QUINTILES for working professionals based on gross employee income
// Note: These ranges are ESTIMATED based on typical income distribution around
// KSH employee statistics (avg: 704,400 Ft, median: 567,700 Ft). They represent
// working population quintiles, excluding non-earners (children, pensioners, unemployed).
// Original KSH quintile data is per-capita (includes entire population), which dilutes
// comparison when user inputs their gross salary. This estimate better aligns with
// actual employee income distribution for more relevant comparisons.
// Methodology: Estimated from employee income statistics and typical income distribution curves
const QUINTILES = (t) => [
  { label: t.stats.q1, range: [0, 350000], grossMonthly: 290000, desc: t.stats.q1Desc },
  { label: t.stats.q2, range: [350001, 500000], grossMonthly: 425000, desc: t.stats.q2Desc },
  { label: t.stats.q3, range: [500001, 650000], grossMonthly: 567700, desc: t.stats.q3Desc }, // KSH median
  { label: t.stats.q4, range: [650001, 900000], grossMonthly: 775000, desc: t.stats.q4Desc },
  { label: t.stats.q5, range: [900001, Infinity], grossMonthly: 1200000, desc: t.stats.q5Desc },
];

// All 23 Budapest districts with median prices/m² from negyzetmeterarak.hu (2024)
const DISTRICTS = [
  { id: 'I', name: 'I. kerület', priceSqm: 1846150, rentSqm: 6000 },
  { id: 'II', name: 'II. kerület', priceSqm: 1811630, rentSqm: 5480 },
  { id: 'III', name: 'III. kerület', priceSqm: 1490980, rentSqm: 5000 },
  { id: 'IV', name: 'IV. kerület', priceSqm: 1216670, rentSqm: 4760 },
  { id: 'V', name: 'V. kerület (Belváros)', priceSqm: 2030360, rentSqm: 6360 },
  { id: 'VI', name: 'VI. kerület', priceSqm: 1604570, rentSqm: 5970 },
  { id: 'VII', name: 'VII. kerület', priceSqm: 1515470, rentSqm: 5560 },
  { id: 'VIII', name: 'VIII. kerület (Józsefváros)', priceSqm: 1355560, rentSqm: 5700 },
  { id: 'IX', name: 'IX. kerület', priceSqm: 1612860, rentSqm: 5640 },
  { id: 'X', name: 'X. kerület', priceSqm: 1105320, rentSqm: 4470 },
  { id: 'XI', name: 'XI. kerület (Újbuda)', priceSqm: 1694170, rentSqm: 5380 },
  { id: 'XII', name: 'XII. kerület', priceSqm: 1873750, rentSqm: 5180 },
  { id: 'XIII', name: 'XIII. kerület (Angyalföld)', priceSqm: 1641850, rentSqm: 5490 },
  { id: 'XIV', name: 'XIV. kerület', priceSqm: 1404690, rentSqm: 4820 },
  { id: 'XV', name: 'XV. kerület', priceSqm: 1185630, rentSqm: 4470 },
  { id: 'XVI', name: 'XVI. kerület', priceSqm: 1177290, rentSqm: 4460 },
  { id: 'XVII', name: 'XVII. kerület', priceSqm: 1147970, rentSqm: 4020 },
  { id: 'XVIII', name: 'XVIII. kerület (Pestszentlőrinc)', priceSqm: 1116070, rentSqm: 4870 },
  { id: 'XIX', name: 'XIX. kerület', priceSqm: 1353940, rentSqm: 4840 },
  { id: 'XX', name: 'XX. kerület', priceSqm: 1055900, rentSqm: 4210 },
  { id: 'XXI', name: 'XXI. kerület', priceSqm: 1045460, rentSqm: 4090 },
  { id: 'XXII', name: 'XXII. kerület', priceSqm: 1269490, rentSqm: 3910 },
  { id: 'XXIII', name: 'XXIII. kerület', priceSqm: 1214700, rentSqm: 3850 },
];

const LANGUAGES = [
  { code: 'hu', label: 'HU' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
  { code: 'ru', label: 'RU' },
  { code: 'zh', label: 'ZH' },
  { code: 'tr', label: 'TR' },
];

// Hungarian number formatting with dot separator
const formatHU = (num) => {
  if (num === null || num === undefined) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function App() {
  const [lang, setLang] = useState('hu');
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState('income');

  // State for Income
  const [grossIncome, setGrossIncome] = useState(400000);
  const [userCalcSZJA, setUserCalcSZJA] = useState('');
  const [userCalcTB, setUserCalcTB] = useState('');
  const [incomeValidated, setIncomeValidated] = useState({ szja: false, tb: false });
  const [showIncomeResult, setShowIncomeResult] = useState(false);

  // State for Hourly Wage Calculator
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [hourlyWage, setHourlyWage] = useState(0);
  const [calculationMode, setCalculationMode] = useState('fromGross'); // 'fromGross' or 'fromHourly'

  // Simulator State
  const [simState, setSimState] = useState({
    date: new Date(),
    balance: 0,
    happiness: 50,
    history: [],
    isPlaying: false,
    speed: 2000,
    weather: { id: 'sunny', icon: '☀️', moodMod: 5 }
  });




  useEffect(() => {
    if (userCalcSZJA !== '' && userCalcTB !== '') {
      setShowIncomeResult(true);
    }
  }, [userCalcSZJA, userCalcTB]);

  // State for Quintile Game
  const [quintileGuess, setQuintileGuess] = useState(null);
  const [showQuintileResult, setShowQuintileResult] = useState(false);

  // State for Expenses
  const [expenses, setExpenses] = useState([
    { id: 'rent', label: t.expenses.rent, value: 150000 },
    { id: 'utilities', label: t.expenses.utilities, value: 35000 },
    { id: 'food', label: t.expenses.food, value: 80000 },
    { id: 'transport', label: t.expenses.transport, value: 9500 },
    { id: 'subscriptions', label: t.expenses.subscriptions, value: 5000 },
  ]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseValue, setNewExpenseValue] = useState('');

  // Update expense labels when language changes
  useEffect(() => {
    setExpenses(prev => prev.map(e => {
      if (['rent', 'utilities', 'food', 'transport', 'subscriptions'].includes(e.id)) {
        return { ...e, label: t.expenses[e.id] };
      }
      return e;
    }));
  }, [lang]);

  const handleAddExpense = () => {
    if (newExpenseName && newExpenseValue) {
      setExpenses([...expenses, {
        id: Date.now().toString(),
        label: newExpenseName,
        value: Number(newExpenseValue)
      }]);
      setNewExpenseName('');
      setNewExpenseValue('');
    }
  };

  const handleRemoveExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const updateExpense = (id, val) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, value: Number(val) } : e));
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.value, 0);

  // State for Loan
  const [loanDetails, setLoanDetails] = useState({
    amount: 20000000,
    years: 20,
    rate: 3 // Fixed 3%
  });
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[1]); // Default XIII
  const [homeSize, setHomeSize] = useState(72); // Default 72 sqm
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // State for Inflation
  const [inflationRate, setInflationRate] = useState(4.5);

  // State for Investment
  const [initialSavings, setInitialSavings] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [investYears, setInvestYears] = useState(10);
  const [disasterMsg, setDisasterMsg] = useState('');
  const [bankruptcy, setBankruptcy] = useState(false);
  const [disasterHistory, setDisasterHistory] = useState([]);

  // --- Calculations ---
  const realSZJA = Math.round(grossIncome * REF_DATA.tax_SZJA);
  const realTB = Math.round(grossIncome * REF_DATA.tax_TB);
  const realNet = grossIncome - realSZJA - realTB;
  const employerCost = Math.round(grossIncome * 1.13);

  // Simulator Logic
  const tick = () => {
    setSimState(prev => {
      const nextDate = new Date(prev.date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Weather change (20% chance)
      let nextWeather = prev.weather;
      if (Math.random() < 0.2) {
        nextWeather = getRandomWeather();
      }

      // Daily Event
      const roll = Math.floor(Math.random() * 20) + 1;
      const event = getRandomEvent(roll);

      // Financials
      // event.cost is positive for bad events (cost), negative for good events (gain)
      // So we subtract event.cost from balance.
      let dailyChange = event.cost ? -event.cost : 0;

      // Daily Expenses (Total / 30)
      const dailyExpenses = totalExpenses / 30;
      dailyChange -= dailyExpenses;

      // Salary (1st of month - Start with Net Income)
      if (nextDate.getDate() === 1) {
        dailyChange += realNet;
      }

      // Happiness
      let nextHappiness = prev.happiness + (event.mood || 0) + (nextWeather.moodMod || 0);
      nextHappiness = Math.max(0, Math.min(100, nextHappiness));

      const newEntry = {
        date: nextDate,
        event: event,
        weather: nextWeather,
        change: dailyChange,
        balance: prev.balance + dailyChange,
        happiness: nextHappiness
      };

      return {
        ...prev,
        date: nextDate,
        balance: prev.balance + dailyChange,
        happiness: nextHappiness,
        weather: nextWeather,
        history: [newEntry, ...prev.history].slice(0, 50) // Keep last 50
      };
    });
  };

  useEffect(() => {
    let interval;
    if (simState.isPlaying) {
      interval = setInterval(tick, simState.speed);
    }
    return () => clearInterval(interval);
  }, [simState.isPlaying, simState.speed, realNet, totalExpenses]);

  // Hourly wage calculations (assuming ~174 work hours per month for 40h/week)
  const monthlyWorkHours = (hoursPerWeek * 52) / 12;
  const calculatedHourlyWage = Math.round(grossIncome / monthlyWorkHours);

  // Calculate gross from hourly wage
  const grossFromHourly = Math.round(hourlyWage * monthlyWorkHours);
  const remainingMoney = realNet - totalExpenses;

  // Sync monthly savings with remaining money initially
  useEffect(() => {
    if (remainingMoney > 0) {
      setMonthlySavings(remainingMoney);
    }
  }, [remainingMoney]);

  const currentQuintile = QUINTILES(t).find(q => realNet >= q.range[0] && realNet <= q.range[1]);

  const calculateLoanPayment = (rate, amount = loanDetails.amount) => {
    const r = rate / 100 / 12;
    const n = loanDetails.years * 12;
    return Math.round(amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  };

  // Split loan calculation: supported (max 50M @ 3%) + market (remainder @ 7.24%)
  const supportedAmount = Math.min(loanDetails.amount, REF_DATA.supportedLoanMax);
  const marketAmount = Math.max(0, loanDetails.amount - REF_DATA.supportedLoanMax);

  const monthlyPayment3Pct = calculateLoanPayment(REF_DATA.supportedLoanRate * 100, supportedAmount);
  const monthlyPaymentMarketPortion = marketAmount > 0 ? calculateLoanPayment(REF_DATA.marketLoanRate * 100, marketAmount) : 0;
  const monthlyPaymentTotal = monthlyPayment3Pct + monthlyPaymentMarketPortion;
  const monthlyPaymentMarketOnly = calculateLoanPayment(REF_DATA.marketLoanRate * 100, loanDetails.amount); // if all was market
  const isSplitLoan = loanDetails.amount > REF_DATA.supportedLoanMax;

  // Loan payment vs income ratio warnings
  const loanPaymentRatio = (isSplitLoan ? monthlyPaymentTotal : monthlyPayment3Pct) / realNet;
  const hasModerateWarning = loanPaymentRatio > 0.30; // >30% of net income
  const hasCriticalWarning = loanPaymentRatio > 0.50; // >50% of net income

  // Recalculate estimated price and rent based on home size
  const estimatedHomePrice = Math.round(selectedDistrict.priceSqm * homeSize);
  const estimatedRent = Math.round(selectedDistrict.rentSqm * homeSize); // Using rentSqm/m² * home size

  const addToExpenses = (name, amount) => {
    setExpenses(prev => [...prev, { id: Date.now().toString(), label: name, value: amount }]);
    setFeedbackMsg(`"${name}" ${t.loan.addedFeedback}`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Investment Calculations
  const calculateInvestment = (rate, inflation = 4.5) => {
    let data = [];
    let currentAmount = initialSavings;
    let totalInvested = initialSavings;
    let realRate = (1 + rate / 100) / (1 + inflation / 100) - 1; // Real return rate

    for (let i = 0; i <= investYears; i++) {
      // Apply disasters
      const yearDisasters = disasterHistory.filter(d => d.year === i);
      let yearLoss = yearDisasters.reduce((acc, d) => acc + d.cost, 0);

      if (i > 0) {
        currentAmount = currentAmount * (1 + rate / 100) + (monthlySavings * 12);
        totalInvested += (monthlySavings * 12);
        currentAmount -= yearLoss;
      } else {
        currentAmount -= yearLoss;
      }

      // Bankruptcy check
      if (currentAmount < 0) {
        // Try to take loan (max 50% of income)
        const maxLoan = realNet * 0.5 * 12; // 1 year of max loan payments
        if (Math.abs(currentAmount) > maxLoan) {
          // Bankruptcy
        }
      }

      data.push({
        year: i,
        value: Math.round(currentAmount),
        invested: Math.round(totalInvested)
      });
    }
    return data;
  };

  const rollDisaster = () => {
    const events = t.investment.disaster.events;
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const cost = Math.round(Math.random() * 300000) + 50000; // 50k - 350k

    // Add to current year (simplified: just deduct from current savings state for visualization)
    setInitialSavings(prev => prev - cost);
    setDisasterMsg(`${randomEvent}: -${cost.toLocaleString()} Ft`);
    setTimeout(() => setDisasterMsg(''), 4000);

    if (initialSavings - cost < -500000) { // Hard limit for bankruptcy demo
      setBankruptcy(true);
    }
  };

  const handleResetInvestment = () => {
    setBankruptcy(false);
    setDisasterMsg('');
    setDisasterHistory([]);
    setInitialSavings(0);
    setMonthlySavings(0);
    setInvestYears(10);
  };

  const investmentData = [
    { name: t.investment.scenarios.pillow, rate: 0, color: '#8884d8' },
    { name: t.investment.scenarios.bond, rate: 7, color: '#82ca9d' },
    { name: t.investment.scenarios.sp500, rate: 12.54, color: '#ffc658' },
  ].map(scenario => {
    const data = calculateInvestment(scenario.rate);
    return { ...scenario, data };
  });

  // Merge data for chart
  const mergedChartData = [];
  for (let i = 0; i <= investYears; i++) {
    let point = { year: i };
    investmentData.forEach(s => {
      point[s.name] = s.data[i].value;
    });
    mergedChartData.push(point);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{t.title}</h1>
            <p className="text-indigo-200 text-sm mt-1">{t.subtitle}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${lang === l.code ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-indigo-200 hover:bg-indigo-500'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button onClick={() => setActiveTab('income')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${activeTab === 'income' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <Calculator size={18} /> {t.tabs.income}
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <TrendingUp size={18} /> {t.tabs.stats}
          </button>
          <button onClick={() => setActiveTab('expenses')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${activeTab === 'expenses' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <PieIcon size={18} /> {t.tabs.expenses}
          </button>
          <button onClick={() => setActiveTab('loan')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${activeTab === 'loan' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <Home size={18} /> {t.tabs.loan}
          </button>
          <button onClick={() => setActiveTab('inflation')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${activeTab === 'inflation' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <TrendingUp size={18} className="rotate-180" /> {t.tabs.inflation}
          </button>
          <button onClick={() => setActiveTab('simulator')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${activeTab === 'simulator' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <Dice5 size={18} /> {t.simulator.title}
          </button>
          <button onClick={() => setActiveTab('investment')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${activeTab === 'investment' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <Coins size={18} /> {t.tabs.investment}
          </button>
          <button onClick={() => setActiveTab('about')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${activeTab === 'about' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <Info size={18} /> {t.tabs.about}
          </button>
        </div>

        {/* --- INCOME TAB --- */}
        {activeTab === 'income' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ... (Existing Income Tab Content) ... */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md text-sm text-blue-800">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> {t.income.introTitle}</h3>
              <p className="italic mb-2">{t.income.introText1}</p>
              <p><strong>{t.income.introText2.split(':')[0]}:</strong>{t.income.introText2.split(':')[1]}</p>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-md text-sm text-indigo-800">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> {t.income.grossNetTitle}</h3>
              <p>
                <strong>{t.income.grossLabel}</strong> {t.income.grossDesc}
                <br />
                <strong>{t.income.netLabel}</strong> {t.income.netDesc}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-xl font-bold mb-6 text-indigo-700 border-b pb-2">{t.income.taskTitle}</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.income.inputLabel}</label>
                  <input
                    type="number"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(Number(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">{t.income.inputHint}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t.income.szjaLabel}</label>
                    <p className="text-xs text-slate-400 mb-2">{t.income.szjaFormula}</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder={t.income.calcPlaceholder}
                        value={userCalcSZJA}
                        onChange={(e) => setUserCalcSZJA(e.target.value)}
                        className={`w-full p-2 border rounded ${incomeValidated.szja ? 'border-green-500 bg-green-50' : ''}`}
                      />
                      <button
                        onClick={() => setIncomeValidated({ ...incomeValidated, szja: Number(userCalcSZJA) === realSZJA })}
                        className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700 transition-colors"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t.income.tbLabel}</label>
                    <p className="text-xs text-slate-400 mb-2">{t.income.tbFormula}</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder={t.income.calcPlaceholder}
                        value={userCalcTB}
                        onChange={(e) => setUserCalcTB(e.target.value)}
                        className={`w-full p-2 border rounded ${incomeValidated.tb ? 'border-green-500 bg-green-50' : ''}`}
                      />
                      <button
                        onClick={() => setIncomeValidated({ ...incomeValidated, tb: Number(userCalcTB) === realTB })}
                        className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700 transition-colors"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col justify-center">
                <h2 className="text-xl font-bold mb-6 text-indigo-700 border-b pb-2">{t.income.resultTitle}</h2>

                {!showIncomeResult ? (
                  <div className="text-center text-slate-500 py-10">
                    <p className="mb-2">{t.income.resultPending1}</p>
                    <p className="text-sm">{t.income.resultPending2}</p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>{t.income.gross}</span>
                      <span className="font-mono">{grossIncome.toLocaleString()} Ft</span>
                    </div>
                    <div className="flex justify-between items-center text-red-500">
                      <span>{t.income.szja}</span>
                      <span className="font-mono">-{realSZJA.toLocaleString()} Ft</span>
                    </div>
                    <div className="flex justify-between items-center text-red-500">
                      <span>{t.income.tb}</span>
                      <span className="font-mono">-{realTB.toLocaleString()} Ft</span>
                    </div>

                    <div className="h-px bg-slate-300 my-4"></div>

                    <div className="flex justify-between items-center text-2xl font-bold text-green-700 p-4 bg-green-50 rounded-lg border border-green-200">
                      <span>{t.income.net}</span>
                      <span>{realNet.toLocaleString()} Ft</span>
                    </div>

                    <div className="mt-6 text-xs text-slate-400">
                      <p>{t.income.otherCosts}</p>
                      <div className="flex justify-between">
                        <span>{t.income.szocho}</span>
                        <span>{Math.round(grossIncome * 0.13).toLocaleString()} Ft</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-1">
                        <span>{t.income.totalCost}</span>
                        <span>{employerCost.toLocaleString()} Ft</span>
                      </div>
                    </div>

                    {/* Hourly Wage Calculator */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="font-semibold text-indigo-700 mb-4">⏱️ {t.income.hourlyWageCalc}</h3>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-600 mb-2">{t.income.hoursPerWeek}</label>
                        <input
                          type="number"
                          min="1"
                          max="80"
                          value={hoursPerWeek}
                          onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                          className="w-full p-2 border rounded"
                        />
                        <p className="text-xs text-slate-400 mt-1">{t.income.workHoursPerMonth}: {Math.round(monthlyWorkHours)} {t.income.hours}</p>
                      </div>

                      {calculationMode === 'fromGross' ? (
                        <>
                          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                            <p className="text-sm text-slate-600 mb-2">{t.income.yourHourlyWage}:</p>
                            <p className="text-3xl font-bold text-emerald-700">{formatHU(calculatedHourlyWage)} Ft/óra</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {formatHU(grossIncome)} Ft ÷ {Math.round(monthlyWorkHours)} óra/hó
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setCalculationMode('fromHourly');
                              setHourlyWage(calculatedHourlyWage);
                            }}
                            className="mt-3 w-full text-sm bg-indigo-100 text-indigo-700 px-4 py-2 rounded hover:bg-indigo-200 transition-colors">
                            ↔️ {t.income.switchToHourlyInput}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-slate-600 mb-2">{t.income.enterHourlyWage}:</label>
                            <input
                              type="number"
                              value={hourlyWage}
                              onChange={(e) => setHourlyWage(Number(e.target.value))}
                              className="w-full p-2 border rounded"
                              placeholder="pl. 2500"
                            />
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-slate-600 mb-2">{t.income.calculatedGross}:</p>
                            <p className="text-3xl font-bold text-blue-700">{formatHU(grossFromHourly)} Ft/hó</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {formatHU(hourlyWage)} Ft/óra × {Math.round(monthlyWorkHours)} óra/hó
                            </p>
                          </div>
                          <button
                            onClick={() => setGrossIncome(grossFromHourly)}
                            className="mt-3 w-full text-sm bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors">
                            ✓ {t.income.applyGrossIncome}
                          </button>
                          <button
                            onClick={() => setCalculationMode('fromGross')}
                            className="mt-2 w-full text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded hover:bg-slate-200 transition-colors">
                            ↔️ {t.income.switchToGrossInput}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- STATS TAB --- */}
        {activeTab === 'stats' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-indigo-800">{t.stats.title}</h2>
              {/* Quintile Methodology Explanation */}
              <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-4 text-left max-w-3xl mx-auto">
                <p className="text-sm font-semibold text-amber-900 mb-2">📊 {t.stats.methodologyTitle}</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {t.stats.methodologyExplanation}
                </p>
                <ul className="text-xs text-amber-700 mt-2 space-y-1 list-disc list-inside">
                  <li>{t.stats.methodologyPoint1}</li>
                  <li>{t.stats.methodologyPoint2}</li>
                  <li>{t.stats.methodologyPoint3}</li>
                </ul>
                <p className="text-xs text-amber-600 mt-3 italic">
                  {t.stats.methodologySource}
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">{t.stats.chartTitle}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: t.stats.you, value: grossIncome, fill: '#8884d8' },
                      { name: t.stats.median, value: REF_DATA.medianGross, fill: '#82ca9d' },
                      { name: t.stats.average, value: REF_DATA.avgGross, fill: '#ffc658' },
                      { name: t.stats.bpAverage, value: REF_DATA.avgGrossBP, fill: '#ff8042' },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} Ft`} />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <p><strong>{t.stats.natAvg}</strong> {REF_DATA.avgGross.toLocaleString()} Ft <span className="text-xs text-slate-400">(KSH)</span></p>
                  <p><strong>{t.stats.bpAvg}</strong> {REF_DATA.avgGrossBP.toLocaleString()} Ft</p>
                  <p><strong>{t.stats.natMed}</strong> {REF_DATA.medianGross.toLocaleString()} Ft</p>
                </div>
                <div className="mt-4 text-xs text-slate-400 italic">
                  {t.sources.disclaimer} <br />
                  <a href="https://www.ksh.hu/stadat_files/jov/hu/jov0055.html" target="_blank" className="underline hover:text-indigo-500">{t.sources.ksh}</a>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-2">{t.stats.quintileTitle}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {t.stats.quintileDesc}
                </p>

                {!showQuintileResult ? (
                  <div className="text-center py-8">
                    <h4 className="font-bold text-lg mb-4">{t.stats.guessTitle}</h4>
                    <p className="mb-6 text-slate-600">{t.stats.guessDesc}</p>
                    <div className="space-y-2">
                      {QUINTILES(t).map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setQuintileGuess(idx);
                            setShowQuintileResult(true);
                          }}
                          className="w-full p-3 rounded border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-500 transition-all text-left font-semibold text-indigo-900"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 animate-in fade-in duration-500">
                    {QUINTILES(t).map((q, idx) => {
                      const isActive = q === currentQuintile;
                      const isGuessed = quintileGuess === idx;
                      return (
                        <div key={idx} className={`p-3 rounded border transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-500'} ${isGuessed && !isActive ? 'border-orange-400 border-2' : ''}`}>
                          <div className="flex justify-between items-center font-bold">
                            <span>{q.label}</span>
                            <span className="text-xs font-mono opacity-80">{q.range[0].toLocaleString()} - {q.range[1] > 1000000 ? '∞' : q.range[1].toLocaleString()} Ft</span>
                          </div>
                          <p className={`text-xs mt-1 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{q.desc}</p>
                          {isActive && <div className="mt-2 text-xs font-bold uppercase tracking-wider">{t.stats.youAreHere}</div>}
                          {isGuessed && !isActive && <div className="mt-2 text-xs font-bold uppercase tracking-wider text-orange-500">{t.stats.youGuessed}</div>}
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setShowQuintileResult(false)}
                      className="mt-4 w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
                    >
                      {t.stats.retry}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- EXPENSES TAB --- */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-indigo-800">{t.expenses.title}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-md space-y-4">
                <h3 className="font-bold text-gray-700 border-b pb-2">{t.expenses.fillTitle}</h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {expenses.map((item) => (
                    <div key={item.id} className="relative group">
                      <label className="block text-sm font-medium text-slate-600">{item.label}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => updateExpense(item.id, e.target.value)}
                          className="w-full p-2 border rounded mt-1"
                        />
                        {['rent', 'utilities', 'food', 'transport', 'subscriptions'].indexOf(item.id) === -1 && (
                          <button
                            onClick={() => handleRemoveExpense(item.id)}
                            className="mt-1 p-2 text-red-500 hover:bg-red-50 rounded"
                            title="Törlés"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t mt-4">
                  <h4 className="text-sm font-bold text-indigo-600 mb-2">{t.expenses.addTitle}</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder={t.expenses.namePlaceholder}
                      value={newExpenseName}
                      onChange={(e) => setNewExpenseName(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder={t.expenses.amountPlaceholder}
                        value={newExpenseValue}
                        onChange={(e) => setNewExpenseValue(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      />
                      <button
                        onClick={handleAddExpense}
                        className="bg-indigo-600 text-white px-3 rounded hover:bg-indigo-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="font-bold text-gray-700 mb-4">{t.expenses.balanceTitle}</h3>
                  <div className="flex items-center justify-around flex-wrap gap-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-500">{t.expenses.netIncome}</p>
                      <p className="text-2xl font-bold text-green-600">{realNet.toLocaleString()} Ft</p>
                    </div>
                    <div className="text-2xl text-slate-300">-</div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500">{t.expenses.totalExpenses}</p>
                      <p className="text-2xl font-bold text-red-500">
                        {totalExpenses.toLocaleString()} Ft
                      </p>
                    </div>
                    <div className="text-2xl text-slate-300">=</div>
                    <div className="text-center p-3 bg-slate-100 rounded-lg">
                      <p className="text-sm text-slate-500">{t.expenses.remaining}</p>
                      <p className={`text-2xl font-bold ${realNet - totalExpenses > 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                        {(realNet - totalExpenses).toLocaleString()} Ft
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenses}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="label"
                      >
                        {expenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `${val.toLocaleString()} Ft`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- LOAN TAB --- */}
        {activeTab === 'loan' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-indigo-800">{t.loan.title}</h2>
              <p className="text-slate-600 max-w-2xl mx-auto mt-2">{t.loan.desc}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
                <h3 className="font-bold text-gray-700 border-b pb-2">{t.loan.calcTitle}</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t.loan.amountLabel}</label>
                  <input
                    type="range"
                    min="1000000"
                    max="80000000"
                    step="1000000"
                    value={loanDetails.amount}
                    onChange={(e) => setLoanDetails({ ...loanDetails, amount: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-right font-mono font-bold text-indigo-600">{loanDetails.amount.toLocaleString()} Ft</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t.loan.yearsLabel}</label>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={loanDetails.years}
                    onChange={(e) => setLoanDetails({ ...loanDetails, years: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-right font-mono font-bold text-indigo-600">{loanDetails.years} év</div>
                </div>

                <div className="bg-slate-100 p-3 rounded text-xs text-slate-500 font-mono">
                  {t.loan.formulaBox}
                </div>

                {/* Loan Amount Warning (>50M) */}
                {isSplitLoan && (
                  <div className="bg-orange-50 border border-orange-300 p-3 rounded-lg text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-600">⚠️</span>
                      <div className="text-orange-800">
                        <p className="font-semibold">{t.loan.splitLoanWarning}</p>
                        <p className="mt-1 text-orange-700">{t.loan.splitLoanExplanation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Income Ratio Warnings */}
                {hasCriticalWarning && (
                  <div className="bg-red-50 border-2 border-red-400 p-3 rounded-lg text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 text-base">🛑</span>
                      <div className="text-red-800">
                        <p className="font-bold">{t.loan.criticalWarning}</p>
                        <p className="mt-1">{t.loan.criticalWarningDesc} ({Math.round(loanPaymentRatio * 100)}%)</p>
                        <p className="mt-1 text-red-600 italic">{t.loan.warningSource}</p>
                      </div>
                    </div>
                  </div>
                )}
                {!hasCriticalWarning && hasModerateWarning && (
                  <div className="bg-yellow-50 border border-yellow-400 p-3 rounded-lg text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600">⚠️</span>
                      <div className="text-yellow-800">
                        <p className="font-semibold">{t.loan.moderateWarning}</p>
                        <p className="mt-1">{t.loan.moderateWarningDesc} ({Math.round(loanPaymentRatio * 100)}%)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* District Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.loan.districtTitle}
                  </label>
                  <select
                    value={selectedDistrict.id}
                    onChange={(e) => setSelectedDistrict(DISTRICTS.find(d => d.id === e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {DISTRICTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  {/* Home Size Slider */}
                  <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                      <span>{t.loan.homeSizeLabel || "Lakás mérete"}</span>
                      <span className="font-bold text-indigo-700">{homeSize} m²</span>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="1"
                      value={homeSize}
                      onChange={(e) => setHomeSize(Number(e.target.value))}
                      className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>20 m²</span>
                      <span>200 m²</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                      <p className="text-xs text-indigo-500 uppercase font-bold">{t.loan.priceSqm}</p>
                      <p className="font-mono font-bold text-indigo-900">{formatHU(selectedDistrict.priceSqm)} Ft</p>
                      <div className="mt-2 pt-2 border-t border-indigo-200">
                        <p className="text-xs text-indigo-500 uppercase font-bold">{t.loan.estPrice || "Becsült Ár"}</p>
                        <p className="font-mono font-bold text-indigo-900 text-lg">{formatHU(estimatedHomePrice)} Ft</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
                      <p className="text-xs text-emerald-500 uppercase font-bold">{t.loan.rentSqm}</p>
                      <p className="font-mono font-bold text-emerald-900">{formatHU(selectedDistrict.rentSqm)} Ft</p>
                      <div className="mt-2 pt-2 border-t border-emerald-200">
                        <p className="text-xs text-emerald-500 uppercase font-bold">{t.loan.estRent || "Becsült Bérleti Díj"}</p>
                        <p className="font-mono font-bold text-emerald-900 text-lg">{formatHU(estimatedRent)} Ft</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => addToExpenses(`Albérlet (${selectedDistrict.id}. ker, ${homeSize}m²)`, estimatedRent)}
                    className="text-xs bg-white border border-indigo-300 text-indigo-700 px-3 py-2 rounded hover:bg-indigo-50 transition-colors"
                  >
                    {t.loan.addRentBtn}
                  </button>
                </div>
                <div className="mt-2 text-xs text-slate-400 italic">
                  {t.sources.nm}
                </div>
              </div>

              {/* Supported Loan (3%) Card */}
              <div className="p-4 rounded-lg bg-emerald-100 border-2 border-emerald-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl">{t.loan.supported}</div>
                <h4 className="font-bold text-emerald-800">{isSplitLoan ? t.loan.splitLoanTitle : t.loan.stateLoan}</h4>
                {isSplitLoan && (
                  <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded mb-2 border border-orange-300">
                    ⚠️ {t.loan.splitLoanWarning}
                  </div>
                )}
                <div className="text-3xl font-extrabold text-emerald-900 my-2">
                  {isSplitLoan ? monthlyPaymentTotal.toLocaleString() : monthlyPayment3Pct.toLocaleString()} Ft
                  <span className="text-sm font-normal text-emerald-700">{t.loan.perMonth}</span>
                </div>
                {isSplitLoan && (
                  <div className="text-xs text-slate-700 space-y-1 mb-2">
                    <div>3% {t.loan.portion}: {monthlyPayment3Pct.toLocaleString()} Ft ({supportedAmount.toLocaleString()} Ft)</div>
                    <div>7.24% {t.loan.portion}: {monthlyPaymentMarketPortion.toLocaleString()} Ft ({marketAmount.toLocaleString()} Ft)</div>
                  </div>
                )}
                <p className="text-xs text-emerald-700">
                  {t.loan.totalRepay} {((isSplitLoan ? monthlyPaymentTotal : monthlyPayment3Pct) * loanDetails.years * 12).toLocaleString()} Ft
                </p>
                <button
                  onClick={() => addToExpenses(
                    isSplitLoan ? `Lakáshitel (vegyes 3%+7.24%)` : 'Lakáshitel (3%)',
                    isSplitLoan ? monthlyPaymentTotal : monthlyPayment3Pct
                  )}
                  className="mt-2 w-full text-xs bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700 transition-colors">
                  {t.loan.addLoanBtn}
                </button>
              </div>

              {/* Market Loan Card (Full amount @ 7.24%) */}
              <div className="p-4 rounded-lg bg-slate-100 border border-slate-300 relative opacity-80 hover:opacity-100 transition-opacity">
                <div className="absolute top-0 right-0 bg-slate-500 text-white text-xs px-2 py-1 rounded-bl">{t.loan.market}</div>
                <h4 className="font-bold text-slate-700">{t.loan.marketLoanOnly}</h4>
                <div className="text-3xl font-bold text-slate-600 my-2">
                  {monthlyPaymentMarketOnly.toLocaleString()} Ft <span className="text-sm font-normal text-slate-500">{t.loan.perMonth}</span>
                </div>
                <p className="text-xs text-slate-500">{t.loan.totalRepay} {(monthlyPaymentMarketOnly * loanDetails.years * 12).toLocaleString()} Ft</p>
                <div className="mt-1 text-xs text-slate-400 italic">{t.sources.bankmonitor}</div>
                <button
                  onClick={() => addToExpenses('Lakáshitel (piaci 7.24%)', monthlyPaymentMarketOnly)}
                  className="mt-2 w-full text-xs bg-slate-400 text-white px-3 py-2 rounded hover:bg-slate-500 transition-colors">
                  {t.loan.addLoanBtn}
                </button>
              </div>

              <div className="text-center text-red-500 font-bold text-sm">
                {t.loan.diff} +{(monthlyPaymentMarketOnly - (isSplitLoan ? monthlyPaymentTotal : monthlyPayment3Pct)).toLocaleString()} Ft
              </div>

              {feedbackMsg && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2">
                    <Check size={20} />
                    {feedbackMsg}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- INFLATION TAB --- */}
        {activeTab === 'inflation' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-indigo-800">{t.inflation.title}</h2>
              <div className="max-w-2xl mx-auto mt-4 text-left bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500 text-sm text-orange-900">
                <p className="mb-2"><strong>1.</strong> {t.inflation.desc1}</p>
                <p><strong>2.</strong> {t.inflation.desc2}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="font-bold text-gray-700 mb-4">{t.inflation.simTitle}</h3>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.inflation.rateLabel}</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                    <div className="text-right font-mono font-bold text-orange-600 text-xl">{inflationRate}%</div>
                    <p className="text-xs text-slate-400 mt-1">{t.inflation.estimate}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-slate-700">{t.inflation.purchasingPower}</h4>
                    {[1, 3, 5, 10].map(year => {
                      const futureValue = realNet / Math.pow(1 + inflationRate / 100, year);
                      const loss = realNet - futureValue;
                      return (
                        <div key={year} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                          <span className="font-medium text-slate-600">{year} {t.inflation.year}</span>
                          <div className="text-right">
                            <div className="font-bold text-slate-800">{Math.round(futureValue).toLocaleString()} Ft</div>
                            <div className="text-xs text-red-500">(-{Math.round(loss).toLocaleString()} Ft)</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-indigo-900 text-white p-8 rounded-xl shadow-xl flex flex-col justify-center items-center text-center">
                  <TrendingUp size={64} className="text-orange-400 mb-6" />
                  <h3 className="text-1xl font-bold mb-4">{t.inflation.lesson}</h3>
                  <p className="text-lg leading-relaxed opacity-90">
                    "{t.inflation.lessonText}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
        }

        {/* --- INVESTMENT TAB --- */}
        {
          activeTab === 'simulator' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header / Status Bar */}
              <div className="bg-white p-6 rounded-xl shadow-md grid grid-cols-2 md:grid-cols-4 gap-4 items-center sticky top-0 z-10 border-b-4 border-indigo-100">
                <div className="text-center">
                  <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">{t.simulator.day}</p>
                  <p className="text-2xl font-bold text-indigo-700">{simState.date.toLocaleDateString(lang === 'hu' ? 'hu-HU' : 'en-US')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">{t.simulator.balance}</p>
                  <p className={`text-2xl font-bold ${simState.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatHU(simState.balance)} Ft
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">{t.simulator.happiness}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{simState.happiness > 70 ? '😄' : simState.happiness > 30 ? '😐' : '😢'}</span>
                    <div className="w-24 h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${simState.happiness > 70 ? 'bg-emerald-500' : simState.happiness > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${simState.happiness}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Időjárás</p>
                  <p className="text-3xl">{simState.weather.icon}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white p-4 rounded-xl shadow-md flex justify-center space-x-4 items-center">
                <button
                  onClick={() => setSimState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                  className={`px-6 py-3 rounded-full font-bold text-white shadow-lg transition-transform active:scale-95 ${simState.isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {simState.isPlaying ? `⏸ ${t.simulator.pause}` : `▶️ ${t.simulator.play}`}
                </button>

                <button
                  onClick={tick}
                  disabled={simState.isPlaying}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⏭ {t.simulator.step}
                </button>

                <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
                  <span className="text-xs font-bold text-slate-500">{t.simulator.speed}:</span>
                  <button
                    onClick={() => setSimState(prev => ({ ...prev, speed: 2000 }))}
                    className={`px-2 py-1 text-xs rounded ${simState.speed === 2000 ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}
                  >1x</button>
                  <button
                    onClick={() => setSimState(prev => ({ ...prev, speed: 400 }))}
                    className={`px-2 py-1 text-xs rounded ${simState.speed === 400 ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}
                  >5x</button>
                </div>
              </div>

              {/* Diary Feed */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                  📖 {t.simulator.diary}
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {simState.history.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 italic">
                      Kezdd el a szimulációt a Start gombbal!
                    </div>
                  ) : (
                    simState.history.map((entry, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-slate-100">
                          {entry.event.icon}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {entry.date.toLocaleDateString(lang === 'hu' ? 'hu-HU' : 'en-US')} • {entry.weather.icon}
                            </span>
                            <span className={`font-mono font-bold ${entry.change > 0 ? 'text-emerald-600' : entry.change < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                              {entry.change > 0 ? '+' : ''}{entry.change !== 0 ? formatHU(entry.change) : ''} Ft
                            </span>
                          </div>
                          <p className="font-semibold text-slate-700 mt-1">
                            {t.simulator.events[entry.event.id] || entry.event.id}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {entry.event.category === 'criticalFail' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">CRITICAL FAIL (1)</span>}
                            {entry.event.category === 'criticalSuccess' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">CRITICAL SUCCESS (20)</span>}
                            {entry.event.mood !== 0 && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${entry.event.mood > 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {entry.event.mood > 0 ? '+' : ''}{entry.event.mood} Mood
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        }

        {
          activeTab === 'investment' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-indigo-800">{t.investment.title}</h2>
                <p className="text-slate-600 max-w-2xl mx-auto mt-2">{t.investment.subtitle}</p>
              </div>

              {bankruptcy && (
                <div className="mb-6">
                  <div className="bg-red-600 text-white p-4 rounded-xl shadow-xl text-center font-bold text-xl animate-pulse mb-4">
                    <AlertTriangle className="inline-block mr-2" /> {t.investment.disaster.bankruptcy}
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={handleResetInvestment}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
                    >
                      <RefreshCw size={20} /> {lang === 'hu' ? 'Újrakezd' : 'Reset'}
                    </button>
                  </div>
                </div>
              )}

              {disasterMsg && (
                <div className="fixed top-24 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl z-50 animate-bounce">
                  <div className="flex items-center gap-2">
                    <Dice5 size={24} />
                    <span className="font-bold text-lg">{disasterMsg}</span>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">{t.investment.labels.initialAmount}</h3>
                    <button
                      onClick={rollDisaster}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                      disabled={bankruptcy}
                    >
                      <Dice5 size={14} /> {t.investment.disaster.btn}
                    </button>
                  </div>
                  <input
                    type="number"
                    value={initialSavings}
                    onChange={(e) => setInitialSavings(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                    disabled={bankruptcy}
                  />

                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">{t.investment.labels.monthlySavings}</h3>
                    <input
                      type="number"
                      value={monthlySavings}
                      onChange={(e) => setMonthlySavings(Number(e.target.value))}
                      className="w-full p-2 border rounded"
                      disabled={bankruptcy}
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">{t.investment.labels.duration}</h3>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={investYears}
                      onChange={(e) => setInvestYears(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="text-right font-mono font-bold text-indigo-600">{investYears} év</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mergedChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: 'Év', position: 'insideBottomRight', offset: -5 }} />
                      <YAxis tickFormatter={(val) => `${val / 1000000}M`} />
                      <Tooltip formatter={(val) => `${Math.round(val).toLocaleString()} Ft`} />
                      <Legend />
                      <Line type="monotone" dataKey={t.investment.scenarios.pillow} stroke="#8884d8" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey={t.investment.scenarios.bond} stroke="#82ca9d" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey={t.investment.scenarios.sp500} stroke="#ffc658" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Explanations */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-slate-100 p-4 rounded-lg border-t-4 border-slate-400">
                  <h4 className="font-bold text-slate-700 mb-2">{t.investment.scenarios.pillow}</h4>
                  <p className="text-sm text-slate-600">{t.investment.descriptions.pillow}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-t-4 border-green-500">
                  <h4 className="font-bold text-green-800 mb-2">{t.investment.scenarios.bond}</h4>
                  <p className="text-sm text-green-700">{t.investment.descriptions.bond}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border-t-4 border-yellow-500">
                  <h4 className="font-bold text-yellow-800 mb-2">{t.investment.scenarios.sp500}</h4>
                  <p className="text-sm text-yellow-700">{t.investment.descriptions.sp500}</p>
                </div>
              </div>
            </div>
          )}

        {/* --- ABOUT TAB --- */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-indigo-800">{t.about.title}</h2>
              <p className="text-slate-600 mt-2 max-w-2xl mx-auto">{t.about.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                <h3 className="font-bold text-lg text-indigo-700 flex items-center gap-2">
                  <Info className="w-5 h-5" /> {t.about.usage}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t.about.usage}
                </p>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-4">
                  <h4 className="font-semibold text-indigo-800 mb-2">{t.about.resources}</h4>
                  <a
                    href="https://ghoul3.notion.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                  >
                    <Globe size={16} /> {t.about.linkText}
                  </a>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                <h3 className="font-bold text-lg text-slate-700">{t.about.sources}</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> {t.sources.ksh}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> {t.sources.nm}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> {t.sources.bankmonitor}
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Disclaimer</p>
                      <p>{t.about.disclaimer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
