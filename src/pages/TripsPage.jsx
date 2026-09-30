import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Plus, Trash2, Wallet } from 'lucide-react';
import { findDestination } from '../destinations.js';
import { usePlanner } from '../context/PlannerContext.jsx';
import TripForm from '../components/TripForm.jsx';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function TripsPage() {
  const { trips, dispatch, notify } = usePlanner();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingTrip, setEditingTrip] = useState(null);
  const isCreating = searchParams.get('new') === '1';

  function closeForm() {
    setEditingTrip(null);
    setSearchParams({}, { replace: true });
  }

  function deleteTrip(trip) {
    if (!window.confirm(`Delete “${trip.title}” and its itinerary?`)) return;
    dispatch({ type: 'DELETE_TRIP', tripId: trip.id });
    notify('Trip removed.');
  }

  return <div className="page-stack">
    <section className="page-title-row"><div><span className="eyebrow">COLLECTING THE GOOD DAYS</span><h1>My trips</h1><p>Every little detail, ready when you are.</p></div><button className="button button-primary" type="button" onClick={() => setSearchParams({ new: '1' })}><Plus size={16} /> Create a trip</button></section>
    {trips.length ? <div className="trips-list">{trips.map((trip) => { const destination = findDestination(trip); const spent = trip.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0); const completed = trip.activities.filter((activity) => activity.done).length; const progress = trip.activities.length ? Math.round(completed / trip.activities.length * 100) : 0; return <article className="trip-card" key={trip.id}><Link to={`/trips/${trip.id}`} className="trip-card-image"><img src={destination.image} alt={`${destination.name}`} /><span>{destination.category}</span></Link><div className="trip-card-body"><span className="eyebrow">{trip.startDate ? `${new Date(`${trip.startDate}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}${trip.endDate ? ` — ${new Date(`${trip.endDate}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}` : ''}` : 'DATES TO BE DECIDED'}</span><Link to={`/trips/${trip.id}`} className="trip-card-title"><h2>{trip.title}</h2><ArrowRight size={17} /></Link><p className="trip-card-place"><MapPin size={14} /> {destination.name}, {destination.country}</p><div className="trip-card-metrics"><span><CalendarDays size={15} /> {trip.activities.length} plans</span><span><Wallet size={15} /> {money(spent)} spent</span><span>{progress}% itinerary</span></div><div className="trip-progress"><i style={{ width: `${progress}%` }} /></div></div><div className="trip-card-actions"><button type="button" className="icon-button" onClick={() => setEditingTrip(trip)} aria-label={`Edit ${trip.title}`} title="Edit trip"><span className="edit-symbol">✎</span></button><button type="button" className="icon-button danger-icon" onClick={() => deleteTrip(trip)} aria-label={`Delete ${trip.title}`} title="Delete trip"><Trash2 size={17} /></button></div></article>; })}</div> : <section className="empty-state trips-empty"><span className="empty-icon"><MapPin size={22} /></span><h2>Your map is still wide open</h2><p>Create your first trip and start collecting the details that make it yours.</p><button className="button button-primary" type="button" onClick={() => setSearchParams({ new: '1' })}><Plus size={16} /> Create your first trip</button></section>}
    {(isCreating || editingTrip) && <TripForm trip={editingTrip || undefined} initialDestination={searchParams.get('destination') ? { id: searchParams.get('destination') } : undefined} onClose={closeForm} />}
  </div>;
}