export interface SweepstakesWidgetProps {
  sweepstakesId: string;
  title?: string;
  imageUrl?: string;
  disclaimer?: string;
  thankYouHeadline?: string;
  thankYouImageUrl?: string;
  trackingUrl?: string;
  onReady?: () => void;
}