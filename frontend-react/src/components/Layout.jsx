import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, History, Network, Building2, LogOut, Leaf } from 'lucide-react';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'System overview and environmental rankings' },
  '/trading': { title: 'Trade Credits', subtitle: 'Buy and sell carbon credits between companies' },
  '/history': { title: 'Trade History', subtitle: 'Chronological log of all transactions' },
  '/network': { title: 'Network Graph', subtitle: 'Directed graph of trading relationships' },
  '/companies': { title: 'Company Management', subtitle: 'Register and manage companies in the Hash Table' },
};

export default function Layout({ user, onLogout }) {
  const location = useLocation();
  const currentPage = pageTitles[location.pathname] || { title: 'EcoTrade', subtitle: '' };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trading', label: 'Trade Credits', icon: ArrowRightLeft },
    { to: '/history', label: 'Trade History', icon: History },
    { to: '/network', label: 'Network Graph', icon: Network },
  ];
  if (user.role === 'admin') links.push({ to: '/companies', label: 'Companies', icon: Building2 });

  const initials = user.role === 'admin' ? 'AD' : user.id?.slice(0, 2).toUpperCase();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon"><Leaf size={20} /></div>
          <div>
            <div className="sidebar-title">EcoTrade</div>
            <div className="sidebar-subtitle">Carbon Credit System</div>
          </div>
        </div>

        <div className="nav-section-label">Navigation</div>
        <div className="nav-links">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-chip" onClick={onLogout} title="Click to Logout">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user.role === 'admin' ? 'Administrator' : user.id}</div>
              <div className="user-role">{user.role === 'admin' ? 'Full Access' : 'Company View'}</div>
            </div>
            <LogOut size={15} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <h2>{currentPage.title}</h2>
            <p>{currentPage.subtitle}</p>
          </div>
          <div className="header-right">
            <span className="header-badge">
              {user.role === 'admin' ? 'Administrator' : `Company: ${user.id}`}
            </span>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <div className="page-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
