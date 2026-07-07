import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#b8892b', '#35624a', '#a83e2c', '#6f6a5c', '#8f6a1f', '#4a7a68', '#c2a15c', '#7d4a3a', '#5c6f4a', '#9b7a3a'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const currency = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Dashboard = () => {
  const { user, updateBudget } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState(user?.monthlyBudget || '');
  const [editingBudget, setEditingBudget] = useState(false);

  const loadSummary = async () => {
    setLoading(true);
    const { data } = await api.get('/expenses/stats/summary');
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const now = new Date();
  const currentMonthTotal =
    summary?.byMonth.find((m) => m.year === now.getFullYear() && m.month === now.getMonth() + 1)
      ?.total || 0;

  const budget = user?.monthlyBudget || 0;
  const overBudget = budget > 0 && currentMonthTotal > budget;
  const remaining = budget - currentMonthTotal;

  const handleBudgetSave = async () => {
    await updateBudget(parseFloat(budgetInput) || 0);
    setEditingBudget(false);
  };

  const monthChartData = (summary?.byMonth || []).map((m) => ({
    label: `${MONTH_NAMES[m.month - 1]} '${String(m.year).slice(2)}`,
    total: m.total,
  }));

  if (loading) return <p className="page-subtitle">Loading your ledger…</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">A running total of where it's all gone.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Total spent (all time)</p>
          <p className="stat-value">{currency(summary?.total || 0)}</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">This month</p>
          <p className="stat-value">{currency(currentMonthTotal)}</p>
          {budget > 0 && (
            <span className={`stamp ${overBudget ? 'over-budget' : 'on-budget'}`}>
              {overBudget ? 'Over budget' : 'On budget'}
            </span>
          )}
        </div>

        <div className="stat-card">
          <p className="stat-label">Monthly budget</p>
          {editingBudget ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                style={{
                  width: 100,
                  padding: '6px 8px',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                }}
              />
              <button className="btn primary small" onClick={handleBudgetSave}>
                Save
              </button>
            </div>
          ) : (
            <p className="stat-value" style={{ cursor: 'pointer' }} onClick={() => setEditingBudget(true)}>
              {budget > 0 ? currency(budget) : 'Set a budget'}
            </p>
          )}
          {budget > 0 && !editingBudget && (
            <p className="page-subtitle" style={{ marginTop: 6 }}>
              {remaining >= 0 ? `${currency(remaining)} left` : `${currency(Math.abs(remaining))} over`}
            </p>
          )}
        </div>

        <div className="stat-card">
          <p className="stat-label">Transactions logged</p>
          <p className="stat-value">{summary?.count || 0}</p>
        </div>
      </div>

      <div className="two-col">
        <div className="sheet chart-sheet">
          <h3 className="chart-title">Spending by category</h3>
          {summary?.byCategory?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={summary.byCategory}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {summary.byCategory.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => currency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <h3>Nothing logged yet</h3>
              <p>Add your first expense to see the breakdown.</p>
            </div>
          )}
        </div>

        <div className="sheet chart-sheet">
          <h3 className="chart-title">Last 12 months</h3>
          {monthChartData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => currency(value)} />
                <Bar dataKey="total" fill="var(--brass, #b8892b)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <h3>No history yet</h3>
              <p>Your monthly trend will show up here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
