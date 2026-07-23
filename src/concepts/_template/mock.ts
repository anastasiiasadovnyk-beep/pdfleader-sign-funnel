import type { TemplateProps } from './types';

const mock: TemplateProps = { title: 'Template concept' };
export default mock;

// Add a named scenario per state the design has; preview at ?scenario=<name>, verified by the
// fidelity gate. Derive from the base with spread so they stay in sync. Delete if Tier-1 static.
// export const empty: TemplateProps = { ...mock, items: [] };
