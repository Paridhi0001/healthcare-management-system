import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Activity, Heart } from 'lucide-react';

const Sidebar = ({ tabs, activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand logo container */}
      <div style={{ padding: '0.5rem 0.5rem 1.5rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
          <Activity size={32} style={{ color: '#ffffff' }} />
          <Heart size={14} style={{ color: '#ef4444', fill: '#ef4444', position: 'absolute', top: 0, right: 0 }} />
        </div>
        <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Medi<span style={{ color: '#60a5fa' }}>Sync</span>
        </span>
      </div>

      {/* Tabs list navigation */}
      <nav style={{ flexGrow: 1 }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            >
              {Icon && <Icon size={18} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer log out shortcut */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '1rem' }}>
        <button 
          onClick={logout} 
          className="nav-link" 
          style={{ color: '#f87171', display: 'flex', gap: '0.75rem' }}
        >
          <LogOut size={18} />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
