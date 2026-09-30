import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Lightbox({ destination, index, onChange, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onChange((index + 1) % destination.gallery.length);
      if (event.key === 'ArrowLeft') onChange((index - 1 + destination.gallery.length) % destination.gallery.length);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [destination.gallery.length, index, onChange, onClose]);
  return <div className="lightbox-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="lightbox" role="dialog" aria-modal="true" aria-label={`${destination.name} photo gallery`}><button className="lightbox-close icon-button" type="button" onClick={onClose} aria-label="Close gallery"><X /></button><button className="lightbox-arrow lightbox-prev" type="button" onClick={() => onChange((index - 1 + destination.gallery.length) % destination.gallery.length)} aria-label="Previous photo"><ChevronLeft /></button><img src={destination.gallery[index]} alt={`${destination.name} photo ${index + 1}`} /><button className="lightbox-arrow lightbox-next" type="button" onClick={() => onChange((index + 1) % destination.gallery.length)} aria-label="Next photo"><ChevronRight /></button><div className="lightbox-caption"><strong>{destination.name}</strong><span>{index + 1} / {destination.gallery.length}</span></div></section></div>;
}