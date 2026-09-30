import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownWideNarrow, Search, SlidersHorizontal, X } from 'lucide-react';
import { categories, destinations } from '../destinations.js';
import DestinationCard from '../components/DestinationCard.jsx';
import Lightbox from '../components/Lightbox.jsx';
import TripForm from '../components/TripForm.jsx';
import { usePlanner } from '../context/PlannerContext.jsx';

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const { wishlist } = usePlanner();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All places');
  const [sort, setSort] = useState('recommended');
  const [gallery, setGallery] = useState(null);
  const [tripDestination, setTripDestination] = useState(null);
  const showSaved = params.get('view') === 'saved';

  const visibleDestinations = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const filtered = destinations.filter((destination) => {
      const matchesCategory = category === 'All places' || destination.category === category;
      const matchesSaved = !showSaved || wishlist.includes(destination.id);
      const matchesSearch = !normalized || `${destination.name} ${destination.country} ${destination.category} ${destination.description}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesSaved && matchesSearch;
    });
    if (sort === 'price-low') filtered.sort((a, b) => a.dailyCost - b.dailyCost);
    if (sort === 'price-high') filtered.sort((a, b) => b.dailyCost - a.dailyCost);
    if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [category, search, showSaved, sort, wishlist]);

  function openPlan(destination) {
    setTripDestination(destination);
    setParams({}, { replace: true });
  }

  return <div className="page-stack">
    <section className="page-title-row"><div><span className="eyebrow">THE WORLD, OPEN</span><h1>{showSaved ? 'Places you love' : 'Find your somewhere'}</h1><p>{showSaved ? 'Your shortlist for the next time wanderlust strikes.' : 'A few places to get those daydreams moving.'}</p></div><span className="result-total"><strong>{visibleDestinations.length.toString().padStart(2, '0')}</strong> PLACES</span></section>
    <section className="explore-tools" aria-label="Destination filters"><div className="search-field"><Search size={17} /><input type="search" placeholder="Search places, countries..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search destinations" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</div><div className="sort-field"><ArrowDownWideNarrow size={16} /><label htmlFor="sort">Sort</label><select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name A–Z</option></select></div></section>
    <div className="category-tabs" role="group" aria-label="Destination categories">{categories.map((item) => <button key={item} type="button" className={`category-tab${category === item ? ' selected' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
    {visibleDestinations.length ? <div className="destination-grid">{visibleDestinations.map((destination) => <DestinationCard key={destination.id} destination={destination} onOpenGallery={(selected) => setGallery({ destination: selected, index: 0 })} onPlan={openPlan} />)}</div> : <div className="empty-state"><span className="empty-icon"><SlidersHorizontal size={21} /></span><h2>Nothing on this map yet</h2><p>{showSaved ? 'Save a destination with the heart button and it will live here.' : 'Try a different search or open up the filters.'}</p><button className="button button-outline" type="button" onClick={() => { setCategory('All places'); setSearch(''); if (showSaved) setParams({}, { replace: true }); }}>Clear filters</button></div>}
    {gallery && <Lightbox destination={gallery.destination} index={gallery.index} onChange={(index) => setGallery((current) => ({ ...current, index }))} onClose={() => setGallery(null)} />}
    {tripDestination && <TripForm initialDestination={tripDestination} onClose={() => setTripDestination(null)} />}
  </div>;
}