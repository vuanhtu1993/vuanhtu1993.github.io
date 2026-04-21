import React, { useState } from 'react';

const Term = ({ children, definition }) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <span 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
      onClick={() => setShowPopup(!showPopup)}
    >
      <strong style={{ cursor: 'pointer', borderBottom: '2px dashed #ff9900', color: '#ff9900' }}>
        {children}
      </strong>
      
      {showPopup && (
        <span style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          padding: '12px',
          backgroundColor: '#333',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '0.9rem',
          width: 'max-content',
          maxWidth: '300px',
          whiteSpace: 'normal',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          lineHeight: '1.4'
        }}>
          {definition}
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-6px',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: '#333 transparent transparent transparent'
          }} />
        </span>
      )}
    </span>
  );
};

export default Term;
