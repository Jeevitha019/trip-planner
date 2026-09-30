import { useState } from 'react';
import { ArrowDownLeft, Plus, Trash2, Wallet } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext.jsx';

const categories = ['Stay', 'Food', 'Transport', 'Activities', 'Shopping', 'Other'];
const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function ExpenseTracker({ trip }) {
  const { dispatch, notify, createId } = usePlanner();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const expenses = trip.expenses ?? [];
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  function addExpense(event) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!title.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    dispatch({ type: 'ADD_EXPENSE', tripId: trip.id, expense: { id: createId(), title: title.trim(), amount: parsedAmount, category, createdAt: new Date().toISOString() } });
    notify('Expense added to your trip.');
    setTitle('');
    setAmount('');
    setAdding(false);
  }

  function removeExpense(expense) {
    dispatch({ type: 'DELETE_EXPENSE', tripId: trip.id, expenseId: expense.id });
    notify('Expense removed.');
  }

  return <section className="feature-panel expense-panel"><div className="feature-heading"><div><span className="eyebrow">KEEP AN EYE ON IT</span><h2><Wallet size={19} /> Expenses</h2><p>{expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} tracked</p></div><div className="expense-total"><span>TOTAL SPENT</span><strong>{money(total)}</strong></div></div>
    {trip.budget > 0 && <div className="expense-budget-row"><span>Budget used</span><span>{money(total)} <i>of</i> {money(trip.budget)}</span></div>}
    {expenses.length > 0 && <div className="expense-list">{expenses.map((expense) => <div className="expense-row" key={expense.id}><span className="expense-mark"><ArrowDownLeft size={15} /></span><span className="expense-name"><strong>{expense.title}</strong><small>{expense.category} · {new Date(expense.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</small></span><strong className="expense-amount">{money(expense.amount)}</strong><button type="button" className="icon-button danger-icon" onClick={() => removeExpense(expense)} aria-label={`Delete ${expense.title}`}><Trash2 size={15} /></button></div>)}</div>}
    {!expenses.length && !adding && <div className="empty-inline expense-empty"><span className="empty-icon"><Wallet size={18} /></span><div><strong>No expenses logged</strong><p>Track the little costs as you go.</p></div></div>}
    {adding && <form className="expense-form" onSubmit={addExpense}><label>Description<input required maxLength="60" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Train tickets" autoFocus /></label><label>Amount (INR)<input required type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" /></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><button type="submit" className="button button-primary button-small">Save expense</button><button type="button" className="icon-button" onClick={() => setAdding(false)} aria-label="Cancel expense"><span aria-hidden="true">×</span></button></form>}
    {!adding && <button type="button" className="add-expense-button" onClick={() => setAdding(true)}><Plus size={15} /> Add an expense</button>}
  </section>;
}