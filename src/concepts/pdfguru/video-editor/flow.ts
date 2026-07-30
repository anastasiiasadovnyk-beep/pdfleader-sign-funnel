import type { Flow } from '../../../app/concepts';

const flow: Flow = {
  start: 'landing',
  pages: [
    { slug: 'landing', title: 'Landing', next: 'editor' },
    { slug: 'editor', title: 'Editor', next: 'processing' },
    { slug: 'processing', title: 'Processing', next: 'email' },
    { slug: 'email', title: 'Email' },
  ],
};

export default flow;
