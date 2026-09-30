import { useEffect, useState } from 'react';
import { ArrowLeft, CloudSun, ExternalLink, MapPin, Pencil, Sun, Thermometer, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { destinations, findDestination } from '../destinations.js';
import { usePlanner } from '../context/PlannerContext.jsx';
import ActivityBoard from '../components/ActivityBoard.jsx';
import ExpenseTracker from '../components/ExpenseTracker.jsx';
import TripForm from '../components/TripForm.jsx';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

function TripWeather({ destination }) {
  const [weather, setWeather] = useState({ status: 'loading', value: null });
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ latitude: destination.latitude, longitude: destination.longitude, current: 'temperature_2m,weather_code', timezone: 'auto' });
    fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Weather unavailable'); return response.json(); })
      .then((data) => setWeather({ status: 'ready', value: data.current }))
      .catch((error) => { if (error.name !== 'AbortError') setWeather({ status: 'error', value: null }); });
    return () => controller.abort();
  }, [destination.latitude, destination.longitude]);

  const description = weather.value?.weather_code < 3 ? 'Clear skies' : weather.value?.weather_code < 50 ? 'Partly cloudy' : weather.value?.weather_code < 70 ? 'Rain nearby' : 'Weather update';
  return <section className="info-panel weather-panel"><div className="panel-title"><span className="panel-icon sun-panel-icon"><CloudSun size={18} /></span><div><span className="eyebrow">RIGHT NOW</span><h3>Weather in {destination.name}</h3></div></div>{weather.status === 'loading' ? <div className="loading-line"><i /> Checking local forecast</div> : weather.status === 'ready' ? <div className="weather-reading"><Sun size={24} /><strong>{Math.round(weather.value.temperature_2m)}°</strong><span>{description}<small>Live via Open-Meteo</small></span></div> : <div className="weather-fallback"><Thermometer size={16} /> Forecast is unavailable right now.</div>}</section>;
}

function MapPanel({ destination }) {
  const delta = 0.12;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${destination.longitude - delta}%2C${destination.latitude - delta}%2C${destination.longitude + delta}%2C${destination.latitude + delta}&layer=mapnik&marker=${destination.latitude}%2C${destination.longitude}`;
  return <section className="map-panel"><div className="map-heading"><div><span className="eyebrow">GET YOUR BEARINGS</span><h3><MapPin size={16} /> {destination.name}</h3></div><a href={`https://www.openstreetmap.org/?mlat=${destination.latitude}&mlon=${destination.longitude}#map=12/${destination.latitude}/${destination.longitude}`} target="_blank" rel="noreferrer" aria-label={`Open ${destination.name} in OpenStreetMap`}><ExternalLink size={16} /></a></div><iframe title={`Map of ${destination.name}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></section>;
}

export default function TripDetailPage({ trip }) {
  const { dispatch, notify } = usePlanner();
  const [editing, setEditing] = useState(false);
  const destination = findDestination(trip);
  const spent = trip.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const completed = trip.activities.filter((activity) => activity.done).length;
  const progress = trip.activities.length ? Math.round(completed / trip.activities.length * 100) : 0;
  const budgetPercent = trip.budget ? Math.min(100, Math.round(spent / trip.budget * 100)) : 0;

  return <div className="page-stack trip-detail-page">
    <Link className="back-link" to="/trips"><ArrowLeft size={15} /> All trips</Link>
    <section className="trip-cover"><img src={destination.image} alt={`${destination.name} destination`} /><div className="trip-cover-shade" /><div className="trip-cover-copy"><span className="eyebrow">{destination.category} · {destination.country}</span><h1>{trip.title}</h1><p><MapPin size={15} /> {destination.name}{trip.startDate && <> <span>·</span> {new Date(`${trip.startDate}T12:00:00`).toLocaleDateString('en', { dateStyle: 'medium' })}{trip.endDate && ` — ${new Date(`${trip.endDate}T12:00:00`).toLocaleDateString('en', { dateStyle: 'medium' })}`}</>}</p></div><button type="button" className="button button-light edit-trip-button" onClick={() => setEditing(true)}><Pencil size={14} /> Edit trip</button></section>

    <section className="trip-overview-strip"><div className="overview-progress"><span className="eyebrow">ITINERARY PROGRESS</span><div><strong>{progress}%</strong><span>{completed} of {trip.activities.length} plans checked off</span></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div></div><div className="overview-budget"><span className="eyebrow">TRIP BUDGET</span><div><strong>{money(spent)}</strong><span>of {trip.budget ? money(trip.budget) : 'no limit set'}</span></div><div className="progress-track"><i className={budgetPercent >= 90 ? 'over-budget' : ''} style={{ width: `${budgetPercent}%` }} /></div></div><div className="overview-destination"><span className="eyebrow">DESTINATION</span><strong>{destination.name}</strong><span>{destination.country}</span></div></section>

    <div className="trip-detail-grid"><div className="trip-primary-column"><ActivityBoard trip={trip} /><ExpenseTracker trip={trip} /><div className="budget-tip"><Wallet size={18} /><span><strong>{trip.budget ? `${Math.max(0, trip.budget - spent).toLocaleString('en-IN')} INR left in your trip budget` : 'Set a budget to keep spending in view'}</strong><small>{trip.budget ? `You've used ${budgetPercent}% of your planned budget.` : 'Edit trip details to add a spending limit.'}</small></span><button type="button" className="text-button" onClick={() => setEditing(true)}>Adjust <Pencil size={13} /></button></div></div><aside className="trip-side-column"><TripWeather destination={destination} /><MapPanel destination={destination} /><section className="destination-note"><span className="eyebrow">A NOTE ABOUT {destination.name.toUpperCase()}</span><p>{destination.description}</p><div className="note-coordinate"><MapPin size={14} /> {destination.latitude.toFixed(3)}°, {destination.longitude.toFixed(3)}°</div></section></aside></div>
    {editing && <TripForm trip={trip} onClose={() => setEditing(false)} />}
  </div>;
}