export const getEmbedCode = (sweepstakesId: string) => {
  return `<!-- Sweepstakes Widget Embed Code -->
<div id="sweepstakes-widget" data-sweepstakes-id="${sweepstakesId}"></div>
<script src="https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js"></script>`;
};