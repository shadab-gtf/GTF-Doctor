# GTF Scale Report

Generated: 2026-06-10T12:54:29.166Z

## Project

- Name: bad-project-demo
- Framework: Next.js 15.0.0
- Components: 4
- Pages: 2
- Routes: 1

## Overall Score

87 / 100

## SEO

Score: 82 / 100

### Missing Metadata

- Severity: Critical
- Issue: No Next.js metadata export was found in the app router.
- Impact: Search previews, titles, descriptions, and social cards can be incomplete or inconsistent.
- File: Project level
- Recommendation: Add centralized metadata in app/layout.tsx and route-specific metadata where needed.

---

## Metadata

Score: 90 / 100

### Route metadata not detected

- Severity: High
- Issue: This page does not export metadata or generateMetadata.
- Impact: Route-level search and social previews may rely on generic defaults.
- File: app/page.tsx:1
- Recommendation: Add route metadata or confirm the inherited layout metadata is sufficient.

```tsx
> 1 | 'use client';
  2 | import { ProductCard } from './components/ProductCard';
  3 | export default function Page() { return <main><h1>Bad Demo</h1><ProductCard /></main>; }
```

---

## Accessibility

Score: 90 / 100

### Empty button

- Severity: High
- Issue: A button renders without readable text or accessible naming.
- Impact: Keyboard and screen reader users cannot identify the action.
- File: app/components/ProductCard.tsx:1
- Recommendation: Add visible text, aria-label, or an accessible icon label.

```tsx
> 1 | export function ProductCard() { const items = ['a', 'b']; return <article><img src="/large.jpg" /><input /><button></button>{items.map((item) => <span>{item}</span>)}</article>; }
  2 | 
```

---

## Performance

Score: 70 / 100

### Raw img element in Next.js UI

- Severity: High
- Issue: The component uses img instead of next/image.
- Impact: Image optimization, responsive sizing, and CLS prevention can be missed.
- File: app/components/ProductCard.tsx:1
- Recommendation: Use next/image with explicit width, height, and sizes.

```tsx
> 1 | export function ProductCard() { const items = ['a', 'b']; return <article><img src="/large.jpg" /><input /><button></button>{items.map((item) => <span>{item}</span>)}</article>; }
  2 | 
```

### Client component may be unnecessary

- Severity: High
- Issue: The file is marked use client but no interaction, browser API, or animation usage was detected.
- Impact: Unneeded client rendering increases JavaScript shipped to users.
- File: app/components/RuntimePanel.tsx:1
- Recommendation: Convert this file to a Server Component if no client-only behavior exists.

```tsx
> 1 | 'use client';
  2 | export function RuntimePanel() { const data = JSON.parse(localStorage.getItem('demo') || '{}'); fetch('/api/demo'); return <pre>{data.title}</pre>; }
  3 | 
```

### Client component may be unnecessary

- Severity: High
- Issue: The file is marked use client but no interaction, browser API, or animation usage was detected.
- Impact: Unneeded client rendering increases JavaScript shipped to users.
- File: app/page.tsx:1
- Recommendation: Convert this file to a Server Component if no client-only behavior exists.

```tsx
> 1 | 'use client';
  2 | import { ProductCard } from './components/ProductCard';
  3 | export default function Page() { return <main><h1>Bad Demo</h1><ProductCard /></main>; }
```

---

## Memory Health

Score: 80 / 100

### Event listener cleanup missing

- Severity: High
- Issue: An event listener is registered without a matching removeEventListener call.
- Impact: Listeners can stay alive after unmount and cause memory leaks or duplicate behavior.
- File: app/components/MemoryPanel.tsx:3
- Recommendation: Return a cleanup function that removes every listener registered by the effect.

```tsx
  1 | 'use client';
  2 | import { useEffect } from 'react';
> 3 | export function MemoryPanel() { useEffect(() => { window.addEventListener('resize', () => null); setInterval(() => null, 1000); }, []); return <section>Memory</section>; }
  4 | 
```

### Interval cleanup missing

- Severity: High
- Issue: setInterval is used without clearInterval.
- Impact: Intervals can continue running after a component is gone, wasting CPU and memory.
- File: app/components/MemoryPanel.tsx:3
- Recommendation: Store the interval id and call clearInterval from effect cleanup.

```tsx
  1 | 'use client';
  2 | import { useEffect } from 'react';
> 3 | export function MemoryPanel() { useEffect(() => { window.addEventListener('resize', () => null); setInterval(() => null, 1000); }, []); return <section>Memory</section>; }
  4 | 
```

---

## React Diagnostics

Score: 90 / 100

### List item key not detected

- Severity: High
- Issue: A mapped JSX list appears to render without a key prop.
- Impact: React reconciliation can become unstable and cause incorrect UI updates.
- File: app/components/ProductCard.tsx:1
- Recommendation: Add a stable key from data identity, not the array index when avoidable.

```tsx
> 1 | export function ProductCard() { const items = ['a', 'b']; return <article><img src="/large.jpg" /><input /><button></button>{items.map((item) => <span>{item}</span>)}</article>; }
  2 | 
```

---

## Runtime Insights

Score: 100 / 100

No issues detected.

---

## Component Health

Score: 90 / 100

### Data fetching inside component

- Severity: High
- Issue: A reusable component appears to fetch data directly.
- Impact: This creates duplicate fetching and weakens page-to-section-to-UI data flow.
- File: app/components/RuntimePanel.tsx:2
- Recommendation: Move data loading into the page or lib/api and pass typed props down.

```tsx
  1 | 'use client';
> 2 | export function RuntimePanel() { const data = JSON.parse(localStorage.getItem('demo') || '{}'); fetch('/api/demo'); return <pre>{data.title}</pre>; }
  3 | 
```

---

## Page Health

Score: 82 / 100

### Page is a client component

- Severity: Critical
- Issue: A route page is marked with use client.
- Impact: This weakens server-first rendering and can increase JavaScript shipped to users.
- File: app/page.tsx:1
- Recommendation: Keep pages server-only and move interaction into child client components.

```tsx
> 1 | 'use client';
  2 | import { ProductCard } from './components/ProductCard';
  3 | export default function Page() { return <main><h1>Bad Demo</h1><ProductCard /></main>; }
```

---

## Dependency Graph

Score: 100 / 100

No issues detected.

---

## Skeleton Coverage

Score: 60 / 100

### Missing skeleton for AnimatedHero

- Severity: High
- Issue: AnimatedHero does not have a matching AnimatedHeroSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/AnimatedHero.tsx:1
- Recommendation: Create AnimatedHeroSkeleton with layout-matched placeholders.

```tsx
> 1 | 'use client';
  2 | import gsap from 'gsap';
  3 | import { useEffect } from 'react';
```

### Missing skeleton for MemoryPanel

- Severity: High
- Issue: MemoryPanel does not have a matching MemoryPanelSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/MemoryPanel.tsx:1
- Recommendation: Create MemoryPanelSkeleton with layout-matched placeholders.

```tsx
> 1 | 'use client';
  2 | import { useEffect } from 'react';
  3 | export function MemoryPanel() { useEffect(() => { window.addEventListener('resize', () => null); setInterval(() => null, 1000); }, []); return <section>Memory</section>; }
```

### Missing skeleton for ProductCard

- Severity: High
- Issue: ProductCard does not have a matching ProductCardSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/ProductCard.tsx:1
- Recommendation: Create ProductCardSkeleton with layout-matched placeholders.

```tsx
> 1 | export function ProductCard() { const items = ['a', 'b']; return <article><img src="/large.jpg" /><input /><button></button>{items.map((item) => <span>{item}</span>)}</article>; }
  2 | 
```

### Missing skeleton for RuntimePanel

- Severity: High
- Issue: RuntimePanel does not have a matching RuntimePanelSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/RuntimePanel.tsx:1
- Recommendation: Create RuntimePanelSkeleton with layout-matched placeholders.

```tsx
> 1 | 'use client';
  2 | export function RuntimePanel() { const data = JSON.parse(localStorage.getItem('demo') || '{}'); fetch('/api/demo'); return <pre>{data.title}</pre>; }
  3 | 
```

---

## Next.js

Score: 82 / 100

### Client directive in page

- Severity: Critical
- Issue: A Next.js page is marked with use client.
- Impact: The route loses server-first rendering benefits and can increase bundle size.
- File: app/page.tsx:1
- Recommendation: Move interactive UI into a child client component and keep the page server-only.

```tsx
> 1 | 'use client';
  2 | import { ProductCard } from './components/ProductCard';
  3 | export default function Page() { return <main><h1>Bad Demo</h1><ProductCard /></main>; }
```

---

## GSAP

Score: 90 / 100

### Missing GSAP cleanup

- Severity: High
- Issue: GSAP animation code does not appear to call ctx.revert() or use gsap.context().
- Impact: Animations and ScrollTriggers can leak across route transitions.
- File: app/components/AnimatedHero.tsx:4
- Recommendation: Wrap animations in gsap.context() and return ctx.revert() from the effect.

```tsx
  2 | import gsap from 'gsap';
  3 | import { useEffect } from 'react';
> 4 | export function AnimatedHero() { useEffect(() => { gsap.to('.hero', { opacity: 1 }); }, []); return <section className="hero">Hero</section>; }
  5 | 
```

---

## Engineering Score

Score: 90 / 100

### Build script missing

- Severity: High
- Issue: package.json does not define a build script.
- Impact: The project is harder to validate consistently before release.
- File: Project level
- Recommendation: Add a deterministic build script and run it in CI.

---

## React Code Quality Linter

Score: 100 / 100

No issues detected.

---

## Dead Code Analysis

Score: 100 / 100

No issues detected.

---

## Supply Chain Security

Score: 100 / 100

No issues detected.

---

## React Server Components Advisory

Score: 82 / 100

### Critical RSC Remote Code Execution in Next.js

- Severity: Critical
- Issue: next@15.0.0 bundles the React Server Components runtime affected by the critical remote code execution vulnerability (CVE-2025-55182, CVSS 10.0).
- Impact: An unauthenticated attacker can run arbitrary code on your server by sending a crafted payload to any Server Function or Server Action endpoint.
- File: package.json:1
- Recommendation: Upgrade Next.js to 15.5.18 (or newer). Run 'npm install next@15.5.18'. See https://vercel.com/blog/security-release-react-server-components

---

## React Native Hardening

Score: 100 / 100

No issues detected.

## Estimated Impact

- Potential Lighthouse Gain: +30
- Potential Accessibility Gain: +3
- Potential Bundle Reduction: -675KB
- Estimated Developer Fix Time: 263 Minutes
- Developer Review Time Saved: 145 Minutes

## Top Priorities

1. Add centralized metadata in app/layout.tsx and route-specific metadata where needed.
2. Keep pages server-only and move interaction into child client components.
3. Move interactive UI into a child client component and keep the page server-only.
4. Upgrade Next.js to 15.5.18 (or newer). Run 'npm install next@15.5.18'. See https://vercel.com/blog/security-release-react-server-components
