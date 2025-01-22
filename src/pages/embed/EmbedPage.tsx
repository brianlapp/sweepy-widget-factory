import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export function EmbedPage() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    };

    // Create and append the widget container
    const container = document.createElement('div');
    container.id = 'sweepstakes-widget';
    if (id) {
      container.setAttribute('data-sweepstakes-id', id);
    }
    document.body.appendChild(container);

    // Load the widget script
    const script = document.createElement('script');
    script.src = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Set up height observer
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    // Cleanup
    return () => {
      observer.disconnect();
      container.remove();
      script.remove();
    };
  }, [id]);

  if (!id) {
    return <div className="p-4">Sweepstakes ID not provided</div>;
  }

  return <div className="p-4" />;
}