import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar" style={{ justifyContent: 'flex-end' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'right' }}>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{user?.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>
              {user?.role}
            </p>
          </div>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={16} className="text-secondary" />
          </div>
        </div>

        <button 
          onClick={logout} 
          className="btn btn-secondary" 
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', gap: '0.35rem' }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
