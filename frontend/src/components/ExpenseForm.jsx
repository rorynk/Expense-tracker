import React, { useState } from 'react';

const CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Education',
  'Travel',
  'Other',
];

const toDateInputValue = (date) => {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().slice(0, 10);
};

const ExpenseForm = ({ initial, onSubmit, onCancel, submitLabel = 'Add expense' }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [category, setCategory] = useState(initial?.category || 'Food');
  const [date, setDate] = useState(toDateInputValue(initial?.date));
  const [notes, setNotes] = useState(initial?.notes || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Give this expense a title');
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return setError('Amount must be greater than 0');

    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), amount: parsedAmount, category, date, notes });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Groceries at the market"
          autoFocus
        />
      </div>

      <div className="field">
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="date">Date</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything worth remembering about this one"
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
