import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calculator, DollarSign, Home, TrendingUp, AlertCircle, Check, X, Info } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// --- Reference Data (2024/2025 Estimates based on KSH) ---
const REF_DATA = {
  minWage2025: 290800, // Estimated Min Wage
  avgGross: 637200,    // KSH 2024 July/Oct Data
  medianGross: 529000, // KSH 2024 Data
  tax_SZJA: 0.15,
  tax_TB: 0.185,
  tax_SZOCHO: 0.13,
};

// --- Quintile Estimates (Net Income) ---
const QUINTILES = [
  { label: '1. Alsó 20% (Legszegényebbek)', range: [0, 250000], desc: 'Nehéz anyagi körülmények, gyakran létminimum alatt.' },
  { label: '2. Második 20%', range: [250001, 320000], desc: 'Átlag alatti jövedelem, szűkös megélhetés.' },
  { label: '3. Középső 20% (A Medián)', range: [320001, 420000], desc: 'A magyar társadalom "közepe".' },
  { label: '4. Negyedik 20%', range: [420001, 550000], desc: 'Átlag feletti életszínvonal, van lehetőség megtakarításra.' },
  { label: '5. Felső 20% (Leggazdagabbak)', range: [550001, 9999999], desc: 'Kiemelkedő jövedelem, magas vásárlóerő.' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('income');

  // State for Income
  const [grossIncome, setGrossIncome] = useState(400000);
  const [userCalcSZJA, setUserCalcSZJA] = useState('');
  const [userCalcTB, setUserCalcTB] = useState('');
  const [incomeValidated, setIncomeValidated] = useState({ szja: false, tb: false });

  // State for Expenses
  const [expenses, setExpenses] = useState({
    rent: 150000,
    utilities: 35000,
    food: 80000,
    transport: 9500, // BKK pass equivalent
    subscriptions: 5000,
    savings: 0
  });

  // State for Loan
  const [loanDetails, setLoanDetails] = useState({
    amount: 20000000,
    years: 20,
    rate: 3 // Fixed 3%
  });

  // State for Inflation
  const [inflationRate, setInflationRate] = useState(4.5);

  // --- Calculations ---
  const realSZJA = Math.round(grossIncome * REF_DATA.tax_SZJA);
  const realTB = Math.round(grossIncome * REF_DATA.tax_TB);
  const realNet = grossIncome - realSZJA - realTB;
  const employerCost = Math.round(grossIncome * (1 + REF_DATA.tax_SZOCHO));

  // Determine Quintile
  const currentQuintile = QUINTILES.find(q => realNet >= q.range[0] && realNet <= q.range[1]) || QUINTILES[4];

  // Validation Logic
  const checkCalculation = (type, value) => {
    const numVal = parseInt(value.replace(/\s/g, '')) || 0;
    const target = type === 'szja' ? realSZJA : realTB;
    // Allow small margin of error for rounding
    const isValid = Math.abs(numVal - target) <= 50;
    setIncomeValidated(prev => ({ ...prev, [type]: isValid }));
  };

  // Loan Calculation (Annuity)
  const calculateLoanPayment = (rate) => {
    const r = rate / 100 / 12;
    const n = loanDetails.years * 12;
    return Math.round(loanDetails.amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  };

  const monthlyPayment3Pct = calculateLoanPayment(3);
  const monthlyPaymentMarket = calculateLoanPayment(7.5); // Comparison rate

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calculator className="w-8 h-8" />
              A Nagy Kiszámoló
            </h1>
            <p className="opacity-90 mt-1 text-indigo-100">Pénzügyi tudatosság feladatlap 9-10. évfolyam számára</p>
          </div>
          <div className="flex gap-2 bg-indigo-800/50 p-1 rounded-lg flex-wrap">
            {[
              { id: 'income', icon: DollarSign, label: 'Bevétel & Adó' },
              { id: 'stats', icon: TrendingUp, label: 'Hol állsz?' },
              { id: 'expenses', icon: X, label: 'Kiadások' },
              { id: 'loan', icon: Home, label: 'Lakás & Hitel' },
              { id: 'inflation', icon: AlertCircle, label: 'Infláció' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${activeTab === tab.id
                    ? 'bg-white text-indigo-700 font-bold shadow'
                    : 'text-indigo-100 hover:bg-indigo-600'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">

        {/* --- TAB 1: INCOME CHALLENGE --- */}
        {activeTab === 'income' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Intro Text from Worksheet */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md text-sm text-blue-800">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Tudtad? Átlag vs. Medián</h3>
              <p className="italic mb-2">
                "Amikor a magyar átlagfizetésről beszélünk, akkor azt mondjuk, hogy összeadjuk mindenki fizetését és elosztjuk a fizetést kapók számával.
                Ezzel azonban az a probléma, hogy mi van akkor, ha van sok szegény és néhány gazdag, akinek a fizetése felrántja az átlagot?"
              </p>
              <p>
                <strong>A Medián:</strong> Ha sorba állítunk minden dolgozót fizetés szerint, a medián a pontosan középen álló ember fizetése. Ez jobban mutatja a valóságot.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-xl font-bold mb-4 text-indigo-700 border-b pb-2">1. Feladat: A Te Fizetésed</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Írd be a havi BRUTTÓ béred (Ft):</label>
                  <input
                    type="number"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(Number(e.target.value))}
                    className="w-full text-2xl font-bold p-3 border-2 border-indigo-100 rounded-lg focus:border-indigo-500 focus:outline-none text-indigo-900"
                  />
                  <p className="text-xs text-slate-400 mt-1">Használj egy reális összeget, vagy a 2025-ös minimálbért (290.800 Ft).</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      SZJA Számítás (15%)
                      <span className="block text-xs font-normal text-slate-500">Képlet: Bruttó × 0.15</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Számold ki!"
                        value={userCalcSZJA}
                        onChange={(e) => setUserCalcSZJA(e.target.value)}
                        className={`w-full p-2 border rounded ${incomeValidated.szja ? 'bg-green-50 border-green-500' : 'border-slate-300'}`}
                      />
                      <button
                        onClick={() => checkCalculation('szja', userCalcSZJA)}
                        className={`px-4 py-2 rounded text-white font-bold transition-colors ${incomeValidated.szja ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                      >
                        {incomeValidated.szja ? <Check size={18} /> : '?'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      TB Járulék Számítás (18.5%)
                      <span className="block text-xs font-normal text-slate-500">Képlet: Bruttó × 0.185</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Számold ki!"
                        value={userCalcTB}
                        onChange={(e) => setUserCalcTB(e.target.value)}
                        className={`w-full p-2 border rounded ${incomeValidated.tb ? 'bg-green-50 border-green-500' : 'border-slate-300'}`}
                      />
                      <button
                        onClick={() => checkCalculation('tb', userCalcTB)}
                        className={`px-4 py-2 rounded text-white font-bold transition-colors ${incomeValidated.tb ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                      >
                        {incomeValidated.tb ? <Check size={18} /> : '?'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Result Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col justify-center">
                <h2 className="text-xl font-bold mb-6 text-indigo-700 border-b pb-2">Eredmény</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Bruttó bér:</span>
                    <span className="font-mono">{grossIncome.toLocaleString()} Ft</span>
                  </div>
                  <div className="flex justify-between items-center text-red-500">
                    <span>- SZJA (15%):</span>
                    <span className="font-mono">-{realSZJA.toLocaleString()} Ft</span>
                  </div>
                  <div className="flex justify-between items-center text-red-500">
                    <span>- TB Járulék (18.5%):</span>
                    <span className="font-mono">-{realTB.toLocaleString()} Ft</span>
                  </div>

                  <div className="h-px bg-slate-300 my-4"></div>

                  <div className="flex justify-between items-center text-2xl font-bold text-green-700 p-4 bg-green-50 rounded-lg border border-green-200">
                    <span>NETTÓ BÉR:</span>
                    <span>{realNet.toLocaleString()} Ft</span>
                  </div>

                  <div className="mt-6 text-xs text-slate-400">
                    <p>Egyéb terhek (amit a munkáltató fizet utánad):</p>
                    <div className="flex justify-between">
                      <span>Szociális hozzájárulási adó (13%):</span>
                      <span>{Math.round(grossIncome * 0.13).toLocaleString()} Ft</span>
                    </div>
                    <div className="flex justify-between font-semibold mt-1">
                      <span>Teljes bérköltség:</span>
                      <span>{employerCost.toLocaleString()} Ft</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: STATS & QUINTILES --- */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-800">Hol helyezkedsz el a létrán?</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold mb-4 text-indigo-600">Összehasonlítás az Országos Átlaggal</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Te (Bruttó)', value: grossIncome, fill: '#8884d8' },
                      { name: 'Medián (Bruttó)', value: REF_DATA.medianGross, fill: '#82ca9d' },
                      { name: 'Átlag (Bruttó)', value: REF_DATA.avgGross, fill: '#ffc658' },
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
                  <p><strong>Nemzeti Átlag (2024):</strong> {REF_DATA.avgGross.toLocaleString()} Ft <span className="text-xs text-slate-400">(KSH Gyorstájékoztató)</span></p>
                  <p><strong>Nemzeti Medián (2024):</strong> {REF_DATA.medianGross.toLocaleString()} Ft</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold mb-4 text-indigo-600">Jövedelmi Ötödök (Társadalmi Létra)</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Magyarországon az adózás egykulcsos (nincsenek adósávok), de a társadalom jövedelmi sávokra (ötödökre) bontható.
                </p>

                <div className="space-y-2">
                  {QUINTILES.map((q, idx) => {
                    const isActive = q === currentQuintile;
                    return (
                      <div key={idx} className={`p-3 rounded border transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-500'}`}>
                        <div className="flex justify-between items-center font-bold">
                          <span>{q.label}</span>
                          <span className="text-xs font-mono opacity-80">{q.range[0].toLocaleString()} - {q.range[1] > 1000000 ? '∞' : q.range[1].toLocaleString()} Ft (Nettó)</span>
                        </div>
                        <p className={`text-xs mt-1 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{q.desc}</p>
                        {isActive && <div className="mt-2 text-xs font-bold uppercase tracking-wider">itt vagy te</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: EXPENSES --- */}
        {activeTab === 'expenses' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Mennyiből élsz meg?</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-md space-y-4">
                <h3 className="font-bold text-gray-700 border-b pb-2">Töltsd ki a kiadásaidat!</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-600">Lakhatás (Albérlet / Hitel)</label>
                  <input type="number" value={expenses.rent} onChange={(e) => setExpenses({ ...expenses, rent: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Rezsi (Víz, Gáz, Áram)</label>
                  <input type="number" value={expenses.utilities} onChange={(e) => setExpenses({ ...expenses, utilities: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Élelmiszer & Háztartás</label>
                  <input type="number" value={expenses.food} onChange={(e) => setExpenses({ ...expenses, food: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Közlekedés (Bérlet / Benzin)</label>
                  <input type="number" value={expenses.transport} onChange={(e) => setExpenses({ ...expenses, transport: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Előfizetések (Net, Spotify, stb.)</label>
                  <input type="number" value={expenses.subscriptions} onChange={(e) => setExpenses({ ...expenses, subscriptions: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="font-bold text-gray-700 mb-4">Havi Egyenleged</h3>
                  <div className="flex items-center justify-around flex-wrap gap-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Nettó Bevételeid</p>
                      <p className="text-2xl font-bold text-green-600">{realNet.toLocaleString()} Ft</p>
                    </div>
                    <div className="text-2xl text-slate-300">-</div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Összes Kiadás</p>
                      <p className="text-2xl font-bold text-red-500">
                        {(Object.values(expenses).reduce((a, b) => a + b, 0)).toLocaleString()} Ft
                      </p>
                    </div>
                    <div className="text-2xl text-slate-300">=</div>
                    <div className="text-center p-3 bg-slate-100 rounded-lg">
                      <p className="text-sm text-slate-500">Maradék (Megtakarítás)</p>
                      <p className={`text-2xl font-bold ${realNet - Object.values(expenses).reduce((a, b) => a + b, 0) > 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                        {(realNet - Object.values(expenses).reduce((a, b) => a + b, 0)).toLocaleString()} Ft
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Lakhatás', value: expenses.rent },
                          { name: 'Rezsi', value: expenses.utilities },
                          { name: 'Étel', value: expenses.food },
                          { name: 'Utazás', value: expenses.transport },
                          { name: 'Egyéb', value: expenses.subscriptions },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
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

        {/* --- TAB 4: LOAN --- */}
        {activeTab === 'loan' && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-slate-800">Saját lakás? A 3%-os hitel csodája</h2>
            <p className="text-slate-600 mb-6">A fiataloknak szóló állami támogatások (pl. CSOK Plusz, Otthon Start programok) gyakran fix 3%-os kamatot kínálnak. Nézd meg, mekkora a különbség a piaci hitelekhez képest!</p>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-emerald-600 p-4 text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Home className="w-5 h-5" /> Hitelkalkulátor
                </h3>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Felvett összeg (Hitelösszeg)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range" min="5000000" max="50000000" step="1000000"
                        value={loanDetails.amount}
                        onChange={(e) => setLoanDetails({ ...loanDetails, amount: Number(e.target.value) })}
                        className="flex-grow accent-emerald-600"
                      />
                      <span className="font-mono font-bold w-32 text-right">{(loanDetails.amount / 1000000).toFixed(0)} M Ft</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600">Futamidő (Év)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range" min="10" max="30" step="1"
                        value={loanDetails.years}
                        onChange={(e) => setLoanDetails({ ...loanDetails, years: Number(e.target.value) })}
                        className="flex-grow accent-emerald-600"
                      />
                      <span className="font-mono font-bold w-32 text-right">{loanDetails.years} Év</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg text-sm text-emerald-800 border border-emerald-200">
                    <strong>A képlet, amit használunk:</strong><br />
                    <em className="font-serif">Törlesztő = P × (r(1+r)^n) / ((1+r)^n - 1)</em> <br />
                    Ahol r = havi kamat, n = hónapok száma.
                  </div>
                </div>

                <div className="space-y-6">
                  {/* The Comparison */}
                  <div className="p-4 rounded-lg bg-emerald-100 border-2 border-emerald-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl">Támogatott</div>
                    <h4 className="font-bold text-emerald-800">Állami 3%-os Hitel</h4>
                    <div className="text-3xl font-extrabold text-emerald-900 my-2">
                      {monthlyPayment3Pct.toLocaleString()} Ft <span className="text-sm font-normal text-emerald-700">/ hó</span>
                    </div>
                    <p className="text-xs text-emerald-700">Teljes visszafizetés: {(monthlyPayment3Pct * loanDetails.years * 12).toLocaleString()} Ft</p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-100 border border-slate-300 relative opacity-80 hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 right-0 bg-slate-500 text-white text-xs px-2 py-1 rounded-bl">Piaci (7.5%)</div>
                    <h4 className="font-bold text-slate-700">Hagyományos Piaci Hitel</h4>
                    <div className="text-3xl font-bold text-slate-600 my-2">
                      {monthlyPaymentMarket.toLocaleString()} Ft <span className="text-sm font-normal text-slate-500">/ hó</span>
                    </div>
                    <p className="text-xs text-slate-500">Teljes visszafizetés: {(monthlyPaymentMarket * loanDetails.years * 12).toLocaleString()} Ft</p>
                  </div>

                  <div className="text-center text-red-500 font-bold text-sm">
                    Különbség havonta: +{(monthlyPaymentMarket - monthlyPayment3Pct).toLocaleString()} Ft
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: INFLATION --- */}
        {activeTab === 'inflation' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Mennyit ér a pénzed jövőre? (Infláció)</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-slate-600 text-justify">
                  Az infláció azt jelenti, hogy a pénzed értéke romlik. Ha 10%-os az infláció, akkor ami tavaly 100 Ft volt, az idén 110 Ft-ba kerül. Vagy fordítva: a 100 forintod ma már csak 90-et ér vásárlóerőben.
                  <br /><br />
                  A KSH ezt a "fogyasztói kosár" alapján méri, amiben benne van minden: kenyér, benzin, rezsi.
                </p>

                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-500">
                  <h3 className="font-bold text-lg mb-4">Infláció Szimulátor</h3>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Várható éves infláció (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-full text-xl font-bold p-2 border-2 border-orange-200 rounded text-orange-800 focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-xs text-slate-400 mt-2">Jelenlegi becslés (2024-25): ~3.5 - 4.5%</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">A Nettó Fizetésed ({realNet.toLocaleString()} Ft) Vásárlóereje</h3>

                <div className="space-y-4">
                  {[1, 3, 5, 10].map((year) => {
                    // Future Value Calculation: PV = FV / (1+r)^n
                    // But here we want to show how much TODAY's money is worth in FUTURE goods terms, which is effectively reducing the value.
                    // Value = Amount / (1 + rate/100)^year
                    const val = realNet / Math.pow(1 + inflationRate / 100, year);
                    return (
                      <div key={year} className="flex items-center gap-4">
                        <div className="w-16 font-bold text-slate-500">{year} év múlva</div>
                        <div className="flex-grow bg-slate-100 rounded-full h-4 overflow-hidden relative">
                          <div
                            className="bg-orange-400 h-full rounded-full absolute top-0 left-0 transition-all duration-1000"
                            style={{ width: `${(val / realNet) * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-24 text-right font-mono text-sm font-bold text-slate-700">
                          {Math.round(val).toLocaleString()} Ft
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 p-4 bg-orange-50 text-orange-800 text-sm rounded">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  <strong>Tanulság:</strong> Ha a fizetésed nem nő legalább {inflationRate}%-kal évente, akkor valójában csökken a fizetésed értéke!
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
