import React from 'react';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(27, 29, 26, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  padding: 20,
};

const boxStyle = {
  background: 'var(--paper-raised)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '26px 28px',
  width: '100%',
  maxWidth: 440,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const Modal = ({ title, onClose, children }) => (
  <div style={overlayStyle} onClick={onClose}>
    <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
      <h3 className="page-title" style={{ fontSize: 20, marginBottom: 18 }}>
        {title}
      </h3>
      {children}
    </div>
  </div>
);

export default Modal;
