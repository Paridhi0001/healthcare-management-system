import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Sidebar = ({ tabs, activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand logo container */}
      <div style={{ padding: '0.5rem 0.5rem 2rem 0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Console Panel
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
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <button 
          onClick={logout} 
          className="nav-link" 
          style={{ color: 'var(--error-color)', display: 'flex', gap: '0.75rem' }}
        >
          <LogOut size={18} />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
