import React from 'react';
import { toast } from 'sonner';
import { getEmbedCode } from '@/utils/widgetUtils';

export function useEmbedCode() {
  const [copied, setCopied] = React.useState(false);
  const [selectedSweepstakesId, setSelectedSweepstakesId] = React.useState('');

  const handleCopyCode = async () => {
    const code = getEmbedCode(selectedSweepstakesId);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Embed code copied to clipboard');
  };

  return {
    copied,
    selectedSweepstakesId,
    setSelectedSweepstakesId,
    handleCopyCode
  };
}