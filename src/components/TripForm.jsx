import { useEffect, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { destinations } from '../destinations.js';
import { usePlanner } from '../context/PlannerContext.jsx';

export default function TripForm({ trip, initialDestination, onClose }) {
  const { dispatch, notify, createId } = usePlanner();
  const initialDestinationId = trip?.destinationId
    ?? destinations.find((destination) => destination.name.toLowerCase() === trip?.destination?.toLowerCase())?.id
    ?? initialDestination?.id;
  const initialDestinationName = destinations.find((destination) => destination.id === initialDestinationId)?.name;
  const [title, setTitle] = useState(trip?.title ?? (initialDestinationName ? `${initialDestinationName} getaway` : ''));
  const [destinationId, setDestinationId] = useState(initialDestinationId ?? destinations[0].id);
  const [startDate, setStartDate] = useState(trip?.startDate ?? '');
  const [endDate, setEndDate] = useState(trip?.endDate ?? '');
  const [budget, setBudget] = useState(trip?.budget ? String(trip.budget) : '');
  const [error, setError] = useState('');
  const selected = destinations.find((destination) => destination.id === destinationId) ?? destinations[0];
  useEffect(() => {
    function closeOnEscape(event) { if (event.key === 'Escape') onClose(); }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  function submitTrip(event) {
    event.preventDefault();
    if (endDate && startDate && endDate < startDate) {
      setError('Your return date must come after your departure date.');
      return;
    }
    const data = { title: title.trim(), destinationId, destination: selected.name, startDate, endDate, budget: Number(budget) };
    if (trip) {
      dispatch({ type: 'UPDATE_TRIP', tripId: trip.id, updates: data });
      notify('Trip details updated.');
    } else {
      dispatch({ type: 'CREATE_TRIP', trip: { ...data, id: createId(), activities: [], expenses: [], createdAt: new Date().toISOString() } });
      notify(`${selected.name} is on your trip list.`);
    }
    onClose();
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="trip-form-title"><div className="modal-heading"><span className="eyebrow"><CalendarDays size={14} /> YOUR NEXT CHAPTER</span><button className="icon-button" type="button" onClick={onClose} aria-label="Close form"><X size={19} /></button></div><h2 id="trip-form-title">{trip ? 'Edit your trip' : 'Plan a new trip'}</h2><p className="modal-intro">A few details now. The good stuff comes next.</p><form className="trip-form" onSubmit={submitTrip}><label>Trip name<input required minLength="2" maxLength="56" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. A week in the sun" /></label><label>Destination<select value={destinationId} onChange={(event) => setDestinationId(event.target.value)}>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}</select></label><div className="form-row"><label>Departure<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>Return<input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div><label>Trip budget <span className="input-unit">INR</span><input type="number" min="0" step="500" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Set a comfortable limit" /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">{trip ? 'Save changes' : 'Create trip'}</button></div></form></section></div>;
}