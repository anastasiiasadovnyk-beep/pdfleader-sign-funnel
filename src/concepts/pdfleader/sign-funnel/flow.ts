import type { Flow } from '../../../app/concepts';

/**
 * One flow for both signature types — the thank-you page and the dashboard
 * adapt to the choice made in the editor rather than branching into separate
 * flows (see lib/signatureChoice.ts).
 */
const flow: Flow = {
  start: 'editor',
  pages: [
    { slug: 'editor', title: 'Editor — sign the document', next: 'thank-you' },
    { slug: 'thank-you', title: 'Thank you — download', next: 'dashboard' },
    { slug: 'dashboard', title: 'Dashboard — my documents' },
  ],
};

export default flow;
