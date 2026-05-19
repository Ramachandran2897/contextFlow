import type { PromptTemplate } from '../shared/types/index';

/**
 * Built-in prompt templates that are always available.
 * Users can add custom templates on top of these.
 */
export const BUILT_IN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'typescript-strict',
    name: 'TypeScript Strict',
    content: 'Use TypeScript strict mode. Avoid any types. Use explicit return types.',
    category: 'language',
    isBuiltIn: true,
  },
  {
    id: 'react-best-practices',
    name: 'React Best Practices',
    content:
      'Use functional components. Use React.memo for expensive renders. Avoid inline functions in JSX. Use useCallback and useMemo appropriately.',
    category: 'framework',
    isBuiltIn: true,
  },
  {
    id: 'react-query',
    name: 'React Query',
    content:
      'Use React Query (TanStack Query) for server state management. Define query keys as constants. Use proper error and loading states.',
    category: 'data-fetching',
    isBuiltIn: true,
  },
  {
    id: 'zustand-state',
    name: 'Zustand State',
    content:
      'Use Zustand for client state management. Keep stores small and focused. Use selectors for performance.',
    category: 'state-management',
    isBuiltIn: true,
  },
  {
    id: 'no-inline-styles',
    name: 'No Inline Styles',
    content:
      'Avoid inline styles. Use Tailwind CSS classes or styled-components. Keep styling consistent with the design system.',
    category: 'styling',
    isBuiltIn: true,
  },
  {
    id: 'atomic-design',
    name: 'Atomic Design',
    content:
      'Follow atomic design pattern: atoms (basic elements), molecules (simple groups), organisms (complex sections), templates (page layouts), pages (instances).',
    category: 'architecture',
    isBuiltIn: true,
  },
  {
    id: 'clean-architecture',
    name: 'Clean Architecture',
    content:
      'Follow clean architecture: domain layer (entities, use cases), application layer (services), infrastructure layer (APIs, storage), presentation layer (UI).',
    category: 'architecture',
    isBuiltIn: true,
  },
  {
    id: 'error-handling',
    name: 'Error Handling',
    content:
      'Implement proper error handling. Use try-catch blocks. Show user-friendly error messages. Log errors with context. Never swallow errors silently.',
    category: 'quality',
    isBuiltIn: true,
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    content:
      'Ensure accessibility compliance. Use semantic HTML. Add ARIA labels. Support keyboard navigation. Maintain proper color contrast.',
    category: 'quality',
    isBuiltIn: true,
  },
  {
    id: 'performance',
    name: 'Performance',
    content:
      'Optimize for performance. Use lazy loading for routes and heavy components. Implement code splitting. Minimize bundle size. Use proper caching strategies.',
    category: 'quality',
    isBuiltIn: true,
  },
];
