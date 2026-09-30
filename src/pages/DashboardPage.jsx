import { useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Compass, Heart, Map, Plus, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { destinations, findDestination } from '../destinations.js';
import { usePlanner } from '../context/PlannerContext.jsx';
import DestinationCard from '../components/DestinationCard.jsx';
import Lightbox from '../components/Lightbox.jsx';
import QuickBudgetCalculator from '../components/QuickBudgetCalculator.jsx';
import TripForm from '../components/TripForm.jsx';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function DashboardPage() {
  const { trips, wishlist } = usePlanner();
  const [gallery, setGallery] = useState(null);
  const [tripDestination, setTripDestination] = useState(null);
  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budget || 0), 0);
  const totalSpent = trips.reduce((sum, trip) => sum + trip.expenses.reduce((spent, expense) => spent + Number(expense.amount || 0), 0), 0);
  const nextTrip = [...trips].filter((trip) => trip.startDate).sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const savedPlaces = destinations.filter((destination) => wishlist.includes(destination.id));

  return (
    <div className="page-stack">
      <section className="dashboard-hero">
        <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" alt="Palm trees beside a tropical coastline" />
        <div className="dashboard-hero-shade" />
        <div className="dashboard-hero-copy"><span className="hero-kicker">YOUR NEXT CHAPTER STARTS HERE</span><h1>Make room for<br />somewhere new.</h1><p>Good trips start with a little daydreaming.</p><Link className="button button-light" to="/destinations">Explore destinations <ArrowRight size={16} /></Link></div>
        <span className="hero-index">01 <i /> 11 PLACES TO GO</span>
      </section>

      <section className="welcome-row"><div><span className="eyebrow">YOUR TRAVEL JOURNAL</span><h2>Good morning, journey maker <span>✦</span></h2><p>Your ideas, plans and little details, all in one place.</p></div><Link className="button button-primary" to="/trips?new=1"><Plus size={16} /> Create a trip</Link></section>

      <section className="stat-grid" aria-label="Travel summary">
        <article className="stat-card"><span className="stat-icon blue-icon"><Map size={18} /></span><span className="stat-label">Trips planned</span><strong>{trips.length}</strong><small>{trips.length ? 'Every great story has a first day.' : 'Your next story starts here.'}</small></article>
        <article className="stat-card"><span className="stat-icon coral-icon"><Heart size={18} /></span><span className="stat-label">Saved places</span><strong>{wishlist.length}</strong><small>{wishlist.length ? 'Little sparks for later.' : 'Keep the places that stay with you.'}</small></article>
        <article className="stat-card"><span className="stat-icon green-icon"><Wallet size={18} /></span><span className="stat-label">Planned budget</span><strong>{money(totalBudget)}</strong><small>{money(totalSpent)} tracked across your trips</small></article>
      </section>

      <QuickBudgetCalculator />

      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">ON THE HORIZON</span><h2>Your trips</h2></div><Link className="inline-link" to="/trips">All trips <ArrowUpRight size={15} /></Link></div>
        {trips.length ? <div className="trip-preview-grid">{trips.slice(0, 3).map((trip) => { const destination = findDestination(trip); const done = trip.activities.filter((activity) => activity.done).length; const progress = trip.activities.length ? Math.round(done / trip.activities.length * 100) : 0; return <Link className="trip-preview" to={`/trips/${trip.id}`} key={trip.id}><img src={destination.image} alt="" /><div className="trip-preview-copy"><span>{trip.startDate ? new Date(`${trip.startDate}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'DATES TO DREAM UP'}</span><strong>{trip.title}</strong><small>{destination.name} · {progress}% explored</small><div className="mini-progress"><i style={{ width: `${progress}%` }} /></div></div><ArrowUpRight className="preview-arrow" size={17} /></Link>; })}</div> : <div className="empty-inline"><span className="empty-icon"><CalendarDays size={20} /></span><div><strong>No trips on the calendar yet</strong><p>Start with a place you can't stop thinking about.</p></div><Link className="button button-outline" to="/trips?new=1">Plan a trip <ArrowRight size={15} /></Link></div>}
      </section>

      {nextTrip && <section className="next-trip-note"><div className="note-icon"><CalendarDays size={18} /></div><div><span className="eyebrow">UP NEXT</span><strong>{nextTrip.title} is getting closer</strong><small>{new Date(`${nextTrip.startDate}T12:00:00`).toLocaleDateString('en', { dateStyle: 'long' })}</small></div><Link to={`/trips/${nextTrip.id}`} className="inline-link">View itinerary <ArrowRight size={15} /></Link></section>}

      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">A GOOD PLACE TO BEGIN</span><h2>Somewhere calling</h2></div><Link className="inline-link" to="/destinations">Browse all <ArrowUpRight size={15} /></Link></div><div className="destination-grid dashboard-destinations">{(savedPlaces.length ? savedPlaces : destinations.slice(1, 4)).map((destination) => <DestinationCard key={destination.id} destination={destination} onOpenGallery={(selected) => setGallery({ destination: selected, index: 0 })} onPlan={setTripDestination} />)}</div></section>
      <div className="dashboard-endnote"><Compass size={15} /> The best plans leave room for a little wandering.</div>
      {gallery && <Lightbox destination={gallery.destination} index={gallery.index} onChange={(index) => setGallery((current) => ({ ...current, index }))} onClose={() => setGallery(null)} />}
      {tripDestination && <TripForm initialDestination={tripDestination} onClose={() => setTripDestination(null)} />}
    </div>
  );
}