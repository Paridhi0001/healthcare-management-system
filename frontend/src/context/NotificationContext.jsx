import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-sm)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'var(--glass-backdrop)',
          animation: 'slideUp 0.2s ease-out',
          color: 'var(--text-primary)',
          border: '1px solid',
          backgroundColor: 
            notification.type === 'success' ? 'rgba(16, 185, 129, 0.9)' :
            notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' :
            notification.type === 'warning' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(59, 130, 246, 0.9)',
          borderColor: 
            notification.type === 'success' ? 'var(--success-color)' :
            notification.type === 'error' ? 'var(--error-color)' :
            notification.type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)',
        }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            ×
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
