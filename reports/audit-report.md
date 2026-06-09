# GTF Inspector Report

Generated: 2026-06-09T13:14:15.502Z

## Project

- Name: bad-project-demo
- Framework: Next.js 15.0.0
- Components: 2
- Pages: 2
- Routes: 1

## Overall Score

70 / 100

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

Score: 80 / 100

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
- File: app/page.tsx:1
- Recommendation: Convert this file to a Server Component if no client-only behavior exists.

---

## Skeleton Coverage

Score: 0 / 100

### Missing skeleton for AnimatedHero

- Severity: High
- Issue: AnimatedHero does not have a matching AnimatedHeroSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/AnimatedHero.tsx:1
- Recommendation: Create AnimatedHeroSkeleton with layout-matched placeholders.

### Missing skeleton for ProductCard

- Severity: High
- Issue: ProductCard does not have a matching ProductCardSkeleton component.
- Impact: Async rendering can show blank or shifting UI during loading states.
- File: app/components/ProductCard.tsx:1
- Recommendation: Create ProductCardSkeleton with layout-matched placeholders.

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

## Estimated Impact

- Potential Lighthouse Gain: +23
- Potential Accessibility Gain: +9
- Potential Bundle Reduction: -345KB
- Estimated Developer Fix Time: 139 Minutes
- Developer Review Time Saved: 89 Minutes

## Top Priorities

1. Add centralized metadata in app/layout.tsx and route-specific metadata where needed.
2. Move interactive UI into a child client component and keep the page server-only.
3. Add route metadata or confirm the inherited layout metadata is sufficient.
4. Add visible text, aria-label, or an accessible icon label.
