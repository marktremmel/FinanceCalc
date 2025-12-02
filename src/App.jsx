import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { Calculator, TrendingUp, Home, PieChart as PieIcon, Info, Check, X, Globe, Coins, Dice5, AlertTriangle } from 'lucide-react';
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
          <button onClick={() => setActiveTab('investment')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${activeTab === 'investment' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <Coins size={18} /> {t.tabs.investment}
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
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-bold text-indigo-800 mb-2">{t.loan.districtTitle}</h4>
                  <select
                    value={selectedDistrict.id}
                    onChange={(e) => setSelectedDistrict(DISTRICTS.find(d => d.id === e.target.value))}
                    className="w-full p-2 border rounded mb-4"
                  >
                    {DISTRICTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  {/* Home Size Slider */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.loan.homeSizeLabel}</label>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      step="1"
                      value={homeSize}
                      onChange={(e) => setHomeSize(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                    <div className="text-right font-mono font-bold text-indigo-600">{homeSize} m²</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">{t.loan.priceSqm}</p>
                      <p className="font-bold text-indigo-700">{selectedDistrict.priceSqm.toLocaleString()} Ft/m²</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t.loan.rentSqm}</p>
                      <p className="font-bold text-indigo-700">{selectedDistrict.rentSqm.toLocaleString()} Ft/m²</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t.loan.estPrice}</p>
                      <p className="font-bold text-indigo-700">{estimatedHomePrice.toLocaleString()} Ft</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t.loan.estRent}</p>
                      <p className="font-bold text-indigo-700">{estimatedRent.toLocaleString()} Ft/hó</p>
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
              <div className="space-y-4">
                <p className="text-slate-600 text-justify">
                  Az infláció azt jelenti, hogy a pénzed értéke romlik. Ha 10%-os az infláció, akkor ami tavaly 100 Ft volt, az idén 110 Ft-ba kerül. Vagy fordítva: a 100 forintod ma már csak 90-et ér vásárlóerőben.
                  <br /><br />
                  A KSH ezt a "fogyasztói kosár" alapján méri, amiben benne van minden: kenyér, benzin, rezsi.
                </p>
              </div>
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
                  <h3 className="text-2xl font-bold mb-4">{t.inflation.lesson}</h3>
                  <p className="text-lg leading-relaxed opacity-90">
                    "{t.inflation.lessonText}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- INVESTMENT TAB --- */}
        {activeTab === 'investment' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-indigo-800">{t.investment.title}</h2>
              <p className="text-slate-600 max-w-2xl mx-auto mt-2">{t.investment.subtitle}</p>
            </div>

            {bankruptcy && (
              <div className="bg-red-600 text-white p-4 rounded-xl shadow-xl text-center font-bold text-xl animate-pulse mb-6">
                <AlertTriangle className="inline-block mr-2" /> {t.investment.disaster.bankruptcy}
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

      </main>
    </div>
  );
}
