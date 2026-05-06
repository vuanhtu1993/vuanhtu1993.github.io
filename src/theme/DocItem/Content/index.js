import React, { useRef } from 'react';
import Content from '@theme-original/DocItem/Content';
import { useReactToPrint } from 'react-to-print';

export default function ContentWrapper(props) {
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef });

  return (
    <div className="print-pdf-wrapper">
      <button 
        onClick={handlePrint}
        className="print-pdf-button"
        title="Xuất PDF"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>Xuất PDF</span>
      </button>
      <div ref={contentRef} className="print-content">
        <Content {...props} />
      </div>
    </div>
  );
}
