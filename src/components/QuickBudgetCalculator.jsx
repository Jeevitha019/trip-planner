import { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { budgetOptions } from '../destinations.js';

export default function QuickBudgetCalculator() {
  const [destinationId, setDestinationId] = useState(budgetOptions[0].id);
  const [days, setDays] = useState('');
  const [estimate, setEstimate] = useState(null);
  const selected = budgetOptions.find((option) => option.id === destinationId) ?? budgetOptions[0];

  function calculate(event) {
    event.preventDefault();
    const duration = Number(days);
    if (!Number.isInteger(duration) || duration < 1) return;
    setEstimate(selected.cost * duration);
  }

  return <section className="quick-budget-panel"><div className="quick-budget-heading"><span className="quick-budget-icon"><Calculator size={18} /></span><div><span className="eyebrow">A LITTLE NUMBER CRUNCHING</span><h2>Quick budget check</h2><p>A rough daily estimate to get you started.</p></div></div><form className="quick-budget-form" onSubmit={calculate}><label htmlFor="quick-destination">Destination<select id="quick-destination" value={destinationId} onChange={(event) => { setDestinationId(event.target.value); setEstimate(null); }}>{budgetOptions.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}</select></label><label htmlFor="quick-days">Days<input id="quick-days" type="number" min="1" step="1" value={days} onChange={(event) => setDays(event.target.value)} placeholder="5" required /></label><button className="button button-primary" type="submit">Estimate</button></form><div className="quick-budget-result" aria-live="polite">{estimate === null ? <span>Estimate uses destination's average daily spend.</span> : <><span>ESTIMATED TRIP TOTAL</span><strong>₹{estimate.toLocaleString('en-IN')}</strong><Link to={`/trips?new=1&destination=${destinationId}`}>Build this trip <ArrowRight size={14} /></Link></>}</div></section>;
}