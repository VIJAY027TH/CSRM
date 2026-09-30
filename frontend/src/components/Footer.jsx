import React from 'react';

export const Footer = () => {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '16px 24px',
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      borderTop: '1px solid var(--border)',
      backgroundColor: 'var(--bg-card)',
      marginTop: 'auto'
    }}>
      Campus Smart Resource Management System (CSRM) &copy; {new Date().getFullYear()} &bull; Academic Enterprise Edition
    </footer>
  );
};
