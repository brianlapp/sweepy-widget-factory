import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function EmbedPage() {
  const { id } = useParams<{ id: string }>();

  const { data: activeVersion } = useQuery({
    queryKey: ['widget-version', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('widget_versions')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!id) return;

    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    };

    // Create and append the widget container
    const container = document.createElement('div');
    container.id = 'root';
    if (id) {
      container.setAttribute('data-sweepstakes-id', id);
    }
    document.body.appendChild(container);

    // Load the widget script with version
    const script = document.createElement('script');
    const version = activeVersion?.version || Date.now().toString();
    script.src = `https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js?v=${version}`;
    script.async = true;
    script.onload = () => {
      console.log('[Widget] Script loaded, initializing...');
      if (window.initializeWidget) {
        window.initializeWidget(id);
      }
    };
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
  }, [id, activeVersion]);

  if (!id) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Sweepstakes ID not provided</AlertDescription>
      </Alert>
    );
  }

  return <div className="p-4" />;
}