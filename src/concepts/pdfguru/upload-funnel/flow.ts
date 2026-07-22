import type { Flow } from '../../../app/concepts';

const flow: Flow = {
  start: 'select-file',
  pages: [
    { slug: 'select-file', title: 'Select file', next: 'processing' },
    { slug: 'processing', title: 'Processing', next: 'done' },
    { slug: 'done', title: 'Done' },
  ],
};

export default flow;
