import React from 'react';

const ModernDialog = ({ isOpen, title, message, type = 'alert', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)', textAlign: 'center', fontSize: '1.5rem' }}>{title}</h2>
        <p style={{ margin: 0, color: 'var(--text-light)', textAlign: 'center', fontSize: '1.1rem', lineHeight: '1.5' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          {type === 'confirm' && (
            <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '16px', border: '2px solid #e5e5e5', backgroundColor: 'white', color: 'var(--text-light)', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
              Cancelar
            </button>
          )}
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '16px', border: 'none', backgroundColor: '#1cb0f6', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 0 #1899d6', transition: 'filter 0.2s' }} onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}>
            {type === 'confirm' ? 'Confirmar' : 'OK'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ModernDialog;
