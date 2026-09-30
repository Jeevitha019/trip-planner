import { NavLink, Outlet } from 'react-router-dom';
import { Compass, Heart, LayoutDashboard, Map, Moon, Plus, Sun, TentTree } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext.jsx';
import ToastRegion from './ToastRegion.jsx';

const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/destinations', label: 'Explore', icon: Compass },
  { to: '/trips', label: 'My trips', icon: Map },
];

export default function AppLayout() {
  const { preferences, toggleTheme, wishlist } = usePlanner();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/" aria-label="Dream Trip Planner home"><span className="brand-mark"><TentTree size={23} /></span><span>dream<span className="brand-light">trip</span><small>YOUR TRAVEL JOURNAL</small></span></NavLink>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="nav-caption saved-caption">YOUR SPACE</div>
        <NavLink to="/destinations?view=saved" className="nav-link"><Heart size={18} /><span>Wishlist</span>{wishlist.length > 0 && <span className="nav-count">{wishlist.length}</span>}</NavLink>
        <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-spark">✦</span><strong>Somewhere new<br />is calling.</strong><NavLink to="/destinations">Find your next trip <Plus size={13} /></NavLink></div><div className="profile-row"><span className="avatar">J</span><span>Journey maker<small>Personal workspace</small></span></div></div>
      </aside>
      <div className="app-main">
        <header className="topbar"><div className="breadcrumb"><span>WORKSPACE</span><span className="breadcrumb-slash">/</span><strong>Dream Trip Planner</strong></div><div className="topbar-actions"><span className="saved-count"><Heart size={15} /> {wishlist.length} saved</span><button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${preferences.theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle theme">{preferences.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button><NavLink className="button button-primary top-create" to="/trips?new=1"><Plus size={16} /> Plan a trip</NavLink></div></header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer">© 2026 Dream Trip Planner <span>Made for the miles ahead.</span></footer>
      </div>
      <ToastRegion />
    </div>
  );
}