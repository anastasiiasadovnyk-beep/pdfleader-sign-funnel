import type { Flow } from '../../../app/concepts';

const flow: Flow = {
  start: 'landing',
  pages: [
    { slug: 'landing', title: 'Landing', next: 'editor' },
    { slug: 'editor', title: 'Editor', next: 'processing' },
    { slug: 'processing', title: 'Processing', next: 'email' },
    { slug: 'email', title: 'Email', next: 'plan' },
    { slug: 'plan', title: 'Select Plan', next: 'payment' },
    { slug: 'payment', title: 'Payment', next: 'thankyou' },
    { slug: 'thankyou', title: 'Thank You', next: 'dashboard' },
    { slug: 'dashboard', title: 'Dashboard' },
  ],
};

export default flow;
