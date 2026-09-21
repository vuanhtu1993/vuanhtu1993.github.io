import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useLocation, useHistory } from '@docusaurus/router';
import RoadmapHub from '@site/src/components/RoadmapHub/RoadmapHub';
import RoadmapDetail from '@site/src/components/RoadmapDetail/RoadmapDetail';
import styles from './RoadmapPage.module.css';

function RoadmapApp() {
  const location = useLocation();
  const history = useHistory();

  // Đọc query param ?slug=...
  const searchParams = new URLSearchParams(location.search);
  const currentSlug = searchParams.get('slug');

  const handleSelectRoadmap = (slug) => {
    history.push(`/roadmap?slug=${encodeURIComponent(slug)}`);
  };

  const handleBackToHub = () => {
    history.push('/roadmap');
  };

  if (currentSlug) {
    return <RoadmapDetail slug={currentSlug} onBack={handleBackToHub} />;
  }

  return <RoadmapHub onSelectRoadmap={handleSelectRoadmap} />;
}

export default function RoadmapPage() {
  return (
    <Layout
      title="Developer Roadmaps"
      description="Bản đồ và lộ trình phát triển kỹ thuật phần mềm toàn diện, học tuần tự theo từng chặng (Phased Milestones)."
    >
      <BrowserOnly fallback={<div className={styles.loadingFallback}>Đang nạp lộ trình...</div>}>
        {() => <RoadmapApp />}
      </BrowserOnly>
    </Layout>
  );
}
