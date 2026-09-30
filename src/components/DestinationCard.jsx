import { ArrowUpRight, Heart, Images, MapPin, Plus } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext.jsx';

export default function DestinationCard({ destination, onOpenGallery, onPlan }) {
  const { wishlist, dispatch, notify } = usePlanner();
  const isSaved = wishlist.includes(destination.id);
  function toggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    dispatch({ type: 'TOGGLE_WISHLIST', destinationId: destination.id });
    notify(isSaved ? 'Removed from your wishlist.' : `${destination.name} saved to your wishlist.`);
  }
  return (
    <article className="destination-card">
      <button className="destination-photo" type="button" onClick={() => onOpenGallery(destination)} aria-label={`View ${destination.name} photos`}><img src={destination.image} alt={`${destination.name} travel view`} loading="lazy" /><span className="photo-count"><Images size={13} /> {destination.gallery.length}</span><span className="card-photo-overlay">View photos <ArrowUpRight size={15} /></span></button>
      <button className={`favorite-button${isSaved ? ' is-favorite' : ''}`} type="button" onClick={toggleFavorite} aria-label={isSaved ? `Remove ${destination.name} from wishlist` : `Add ${destination.name} to wishlist`} aria-pressed={isSaved}><Heart size={17} fill={isSaved ? 'currentColor' : 'none'} /></button>
      <div className="destination-copy"><div className="destination-meta"><span>{destination.category}</span><span><MapPin size={12} /> {destination.country}</span></div><h3>{destination.name}</h3><p>{destination.description}</p><div className="destination-foot"><span className="starting-price">from <strong>₹{destination.dailyCost.toLocaleString('en-IN')}</strong><small> / day</small></span><button type="button" className="text-button" onClick={() => onPlan(destination)}><Plus size={14} /> Plan trip</button></div></div>
    </article>
  );
}