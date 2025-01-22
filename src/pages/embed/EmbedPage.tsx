import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { WidgetRoot } from '@/widget';

export function EmbedPage() {
  const { id } = useParams<{ id: string }>();

  // Send height updates to parent
  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    };

    // Send initial height
    sendHeight();

    // Set up observer for height changes
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  if (!id) {
    return <div className="p-4">Sweepstakes ID not provided</div>;
  }

  return (
    <div className="p-4">
      <WidgetRoot sweepstakesId={id} />
    </div>
  );
}