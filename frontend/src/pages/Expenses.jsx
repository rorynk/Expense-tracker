import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import Modal from '../components/Modal';

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

const currency = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadExpenses = async (page = 1) => {
    setLoading(true);
    const { data } = await api.get('/expenses', {
      params: { page, limit: 10, ...(category ? { category } : {}) },
    });
    setExpenses(data.expenses);
    setPagination(data.pagination);
    setLoading(false);
  };

  useEffect(() => {
    loadExpenses(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleCreate = async (payload) => {
    await api.post('/expenses', payload);
    setShowForm(false);
    loadExpenses(1);
  };

  const handleUpdate = async (payload) => {
    await api.put(`/expenses/${editing._id}`, payload);
    setEditing(null);
    loadExpenses(pagination.page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return;
    await api.delete(`/expenses/${id}`);
    loadExpenses(pagination.page);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Every entry in the ledger, most recent first.</p>
        </div>
        <button className="btn primary" onClick={() => setShowForm(true)}>
          + Add expense
        </button>
      </div>

      <div className="toolbar">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="sheet">
        {loading ? (
          <p className="page-subtitle">Loading…</p>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <h3>No expenses here</h3>
            <p>Add one, or clear your filter.</p>
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{formatDate(exp.date)}</td>
                  <td>{exp.title}</td>
                  <td>
                    <span className="category-tag">{exp.category}</span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{exp.notes}</td>
                  <td className="amount" style={{ textAlign: 'right' }}>
                    {currency(exp.amount)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => setEditing(exp)}>Edit</button>
                      <button onClick={() => handleDelete(exp._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn ghost small"
              disabled={pagination.page <= 1}
              onClick={() => loadExpenses(pagination.page - 1)}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="btn ghost small"
              disabled={pagination.page >= pagination.pages}
              onClick={() => loadExpenses(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Add expense" onClose={() => setShowForm(false)}>
          <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit expense" onClose={() => setEditing(null)}>
          <ExpenseForm
            initial={editing}
            submitLabel="Save changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Expenses;
