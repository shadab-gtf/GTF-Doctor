# GTF Inspector Report

Generated: 2026-06-09T13:54:21.678Z

## Project

- Name: bad-project-demo
- Framework: Next.js 15.0.0
- Components: 4
- Pages: 2
- Routes: 1

## Overall Score

75 / 100

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

---

## Accessibility

Score: 80 / 100

### Missing image alt text

- Severity: Medium
- Issue: An img element does not include an alt attribute.
- Impact: Screen reader users cannot understand the purpose of the image.
- File: app/components/ProductCard.tsx:1
- Recommendation: Add meaningful alt text or alt="" for decorative images.

### Input missing accessible label

- Severity: Medium
- Issue: An input lacks an id, aria-label, or aria-labelledby attribute.
- Impact: Assistive technology may announce the control without useful context.
- File: app/components/ProductCard.tsx:1
- Recommendation: Connect the input to a visible label or add an ARIA label.

### Empty button

- Severity: High
- Issue: A button renders without readable text or accessible naming.
- Impact: Keyboard and screen reader users cannot identify the action.
- File: app/components/ProductCard.tsx:1
- Recommendation: Add visible text, aria-label, or an accessible icon label.

---

## Performance

Score: 70 / 100

### Raw img element in Next.js UI

- Severity: High
- Issue: The component uses img instead of next/image.
- Impact: Image optimization, responsive sizing, and CLS prevention can be missed.
- File: app/components/ProductCard.tsx:1
- Recommendation: Use next/image with explicit width, height, and sizes.

### Client component may be unnecessary

- Severity: High
- Issue: The file is marked use client but no interaction, browser API, or animation usage was detected.
- Impact: Unneeded client rendering increases JavaScript shipped to users.
- File: app/components/RuntimePanel.tsx:1
- Recommendation: Convert this file to a Server Component if no client-only behavior exists.

### Client component may be unnecessary

- Severity: High
- Issue: The file is marked use client but no interaction, browser API, or animation usage was detected.
- Impact: Unneeded client rendering increases JavaScript shipped to users.
- File: app/page.tsx:1
- Recommendation: Convert this file to a Server Component if no client-only behavior exists.

---

## Memory Health

Score: 80 / 100

### Event listener cleanup missing

- Severity: High
- Issue: An event listener is registered without a matching removeEventListener call.
- Impact: Listeners can stay alive after unmount and cause memory leaks or duplicate behavior.
- File: app/components/MemoryPanel.tsx:3
- Recommendation: Return a cleanup function that removes every listener registered by the effect.

### Interval cleanup missing

- Severity: High
- Issue: setInterval is used without clearInterval.
- Impact: Intervals can continue running after a component is gone, wasting CPU and memory.
- File: app/components/MemoryPanel.tsx:3
- Recommendation: Store the interval id and call clearInterval from effect cleanup.

---

## React Diagnostics

Score: 90 / 100

### List item key not detected

- Severity: High
- Issue: A mapped JSX list appears to render without a key prop.
- Impact: React reconciliation can become unstable and cause incorrect UI updates.
- File: app/components/ProductCard.tsx:1
- Recommendation: Add a stable key from data identity, not the array index when avoidable.

---

## Runtime Insights

Score: 90 / 100

### Unguarded JSON.parse

- Severity: Medium
- Issue: JSON.parse is called without a nearby try/catch.
- Impact: Invalid persisted or API data can crash the rendering path.
- File: app/components/RuntimePanel.tsx:2
- Recommendation: Wrap parsing in a safe parser and return a typed fallback.

### Fetch error handling not detected

- Severity: Medium
- Issue: A fetch call appears without explicit error handling.
- Impact: Network failures can become uncaught runtime errors or blank UI states.
- File: app/components/RuntimePanel.tsx:2
- Recommendation: Handle failed responses and network errors with typed fallbacks.

---

## Component Health

Score: 90 / 100

### Data fetching inside component

- Severity: High
- Issue: A reusable component appears to fetch data directly.
- Impact: This creates duplicate fetching and weakens page-to-section-to-UI data flow.
- File: app/components/RuntimePanel.tsx:2
- Recommendation: Move data loading into the page or lib/api and pass typed props down.

---

## Page Health

Score: 82 / 100

### Page is a client component

- Severity: Critical
- Issue: A route page is marked with use client.
- Impact: This weakens server-first rendering and can increase JavaScript shipped to users.
- File: app/page.tsx:1
- Recommendation: Keep pages server-only and move interaction into child client components.

---

## Skeleton Coverage

Score: 0 / 100

### Missing skeleton for AnimatedHero

- Severity: High
- Issue: AnimatedHero does not have a matching AnimatedHeroSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/AnimatedHero.tsx:1
- Recommendation: Create AnimatedHeroSkeleton with layout-matched placeholders.

### Missing skeleton for MemoryPanel

- Severity: High
- Issue: MemoryPanel does not have a matching MemoryPanelSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/MemoryPanel.tsx:1
- Recommendation: Create MemoryPanelSkeleton with layout-matched placeholders.

### Missing skeleton for ProductCard

- Severity: High
- Issue: ProductCard does not have a matching ProductCardSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/ProductCard.tsx:1
- Recommendation: Create ProductCardSkeleton with layout-matched placeholders.

### Missing skeleton for RuntimePanel

- Severity: High
- Issue: RuntimePanel does not have a matching RuntimePanelSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/RuntimePanel.tsx:1
- Recommendation: Create RuntimePanelSkeleton with layout-matched placeholders.

---

## Next.js

Score: 82 / 100

### Client directive in page

- Severity: Critical
- Issue: A Next.js page is marked with use client.
- Impact: The route loses server-first rendering benefits and can increase bundle size.
- File: app/page.tsx:1
- Recommendation: Move interactive UI into a child client component and keep the page server-only.

---

## GSAP

Score: 90 / 100

### Missing GSAP cleanup

- Severity: High
- Issue: GSAP animation code does not appear to call ctx.revert() or use gsap.context().
- Impact: Animations and ScrollTriggers can leak across route transitions.
- File: app/components/AnimatedHero.tsx:4
- Recommendation: Wrap animations in gsap.context() and return ctx.revert() from the effect.

---

## Engineering Score

Score: 85 / 100

### Build script missing

- Severity: High
- Issue: package.json does not define a build script.
- Impact: The project is harder to validate consistently before release.
- File: Project level
- Recommendation: Add a deterministic build script and run it in CI.

### Test script missing

- Severity: Medium
- Issue: package.json does not define a test script.
- Impact: Regression confidence is lower and adoption is harder to trust.
- File: Project level
- Recommendation: Add unit or integration tests for critical frontend behavior.

## Estimated Impact

- Potential Lighthouse Gain: +30
- Potential Accessibility Gain: +9
- Potential Bundle Reduction: -750KB
- Estimated Developer Fix Time: 273 Minutes
- Developer Review Time Saved: 173 Minutes

## Top Priorities

1. Add centralized metadata in app/layout.tsx and route-specific metadata where needed.
2. Keep pages server-only and move interaction into child client components.
3. Move interactive UI into a child client component and keep the page server-only.
4. Add route metadata or confirm the inherited layout metadata is sufficient.
