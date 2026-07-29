import type { Flow } from '../../../app/concepts';

const flow: Flow = {
  start: 'landing',
  pages: [
    { slug: 'landing', title: 'Landing', next: 'editor' },
    { slug: 'editor', title: 'Editor' },
  ],
};

export default flow;
