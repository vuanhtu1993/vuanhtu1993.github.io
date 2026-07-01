import React, { useState } from 'react';
import Layout from '@theme/Layout';
import OntologyGraph from '@site/src/components/OntologyGraph/OntologyGraph';
import BrowserOnly from '@docusaurus/BrowserOnly';

const AVAILABLE_DOMAINS = [
  { id: 'azure-ai-agent', label: 'Azure AI Agent', icon: '🤖' },
  { id: 'nestjs-framework', label: 'NestJS Framework', icon: '🐈' }
];

export default function OntologyPage() {
  const [currentDomain, setCurrentDomain] = useState(AVAILABLE_DOMAINS[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Layout title="Knowledge Ontology" description="Interactive knowledge graph explorer">
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <strong style={{ fontSize: '1.05em', whiteSpace: 'nowrap' }}>Knowledge Domain:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {AVAILABLE_DOMAINS.map(d => {
                const isActive = currentDomain === d.id;
                return (
                  <div 
                    key={d.id}
                    onClick={() => setCurrentDomain(d.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${isActive ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)'}`,
                      background: 'var(--ifm-background-color)',
                      color: isActive ? 'var(--ifm-color-primary)' : 'var(--ifm-font-color-base)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                      userSelect: 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.2em' }}>{d.icon}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.95em' }}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1em' }}>🔍</span>
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '6px',
                background: 'var(--ifm-color-emphasis-100)',
                color: 'var(--ifm-font-color-base)',
                width: '260px',
                fontSize: '0.95rem'
              }}
            />
          </div>

        </div>
      </div>
      <BrowserOnly fallback={<div>Loading Graph...</div>}>
        {() => <OntologyGraph domain={currentDomain} searchTerm={searchTerm} />}
      </BrowserOnly>
    </Layout>
  );
}
