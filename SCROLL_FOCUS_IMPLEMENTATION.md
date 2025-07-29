# Scroll-Based Focus Implementation: Lessons Learned

## Overview

This document explains the implementation of the scroll-based hero/donation form focus system in the StudentePlein donation portal. The system automatically focuses the donation form when users scroll down and refocuses the hero section when they scroll back up.

## The Challenge

We needed to create a smooth, responsive interface that:
1. **Focuses the donation form** when users scroll down far enough
2. **Refocuses the hero section** when users scroll back up
3. **Works consistently** across different screen sizes (laptops, desktops, large screens)
4. **Doesn't fight against user intent** or create jarring experiences
5. **Handles manual focus** (button clicks) properly
6. **Avoids infinite loops** and performance issues

## Key Problems We Encountered

### 1. **Infinite Loops in useEffect**
**Problem**: The scroll handler was recreating on every state change, causing maximum update depth errors.

**Solution**: Used `useCallback` with refs to track state without creating dependencies:
```typescript
const isDonationFocusedRef = useRef(isDonationFocused)
const manuallyFocusedRef = useRef(manuallyFocused)

const handleScroll = useCallback(() => {
  // Use isDonationFocusedRef.current instead of isDonationFocused
}, []) // Empty dependency array prevents recreation
```

### 2. **Inconsistent Behavior Across Screen Sizes**
**Problem**: Fixed pixel thresholds (like 500px) worked on some screens but not others.

**Initial attempts**: Complex viewport calculations and responsive thresholds.

**Final solution**: Calculate thresholds based on the actual position of the donation form:
```typescript
const focusThreshold = stableDonationTop - 500  // 500px before form
const unfocusThreshold = stableDonationTop - 600 // 600px before form
```

### 3. **Transform-Related Position Issues**
**Problem**: When the donation form got focused, CSS transforms (scale, positioning) changed its `getBoundingClientRect()` values, causing thresholds to jump around and create flickering.

**Critical insight**: The position was changing from ~802px (normal) to ~1041px (transformed), making thresholds unstable.

**Solution**: Calculate and store the "stable" position only when the form is in its normal, untransformed state:
```typescript
// Only calculate when form is NOT focused (not transformed)
if (!isDonationFocusedRef.current && stableDonationPositionRef.current === null) {
  const donationRect = donationElement.getBoundingClientRect()
  stableDonationPositionRef.current = scrollY + donationRect.top
}
```

### 4. **Manual vs Automatic Focus Conflicts**
**Problem**: When users clicked the "Skenk nou" button, the automatic scroll logic would immediately unfocus it again.

**Solution**: Added a manual focus flag that prevents automatic unfocusing:
```typescript
const [manuallyFocused, setManuallyFocused] = useState(false)

// In button handler
const handleScrollToDonation = () => {
  setManuallyFocused(true)
  setIsDonationFocused(true)
}

// In scroll handler - respect manual focus
if (!isDonationFocusedRef.current && !manuallyFocusedRef.current && scrollY > focusThreshold) {
  setIsDonationFocused(true)
}
```

### 5. **Automatic ScrollIntoView Interference**
**Problem**: When the donation form auto-focused, it would automatically call `scrollIntoView()`, which fought against users trying to scroll back up.

**Solution**: Removed automatic scrolling for natural focus, kept it only for manual button clicks and added proper centering.

## Final Implementation

### Core Logic
```typescript
const handleScroll = useCallback(() => {
  const scrollY = window.scrollY
  const donationElement = donationSectionRef.current
  
  if (!donationElement) return
  
  // Calculate stable position only when form is NOT focused
  if (!isDonationFocusedRef.current && stableDonationPositionRef.current === null) {
    const donationRect = donationElement.getBoundingClientRect()
    stableDonationPositionRef.current = scrollY + donationRect.top
  }
  
  const stableDonationTop = stableDonationPositionRef.current
  if (stableDonationTop === null) return
  
  const focusThreshold = stableDonationTop - 500
  const unfocusThreshold = stableDonationTop - 600
  
  // Focus when scrolled past threshold (but not if manually focused)
  if (!isDonationFocusedRef.current && !manuallyFocusedRef.current && scrollY > focusThreshold) {
    setIsDonationFocused(true)
    // Center the form
    setTimeout(() => {
      donationElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
  } 
  // Unfocus when scrolled back up
  else if (isDonationFocusedRef.current && scrollY < unfocusThreshold) {
    setIsDonationFocused(false)
    setManuallyFocused(false)
    stableDonationPositionRef.current = null // Reset for recalculation
  }
}, [])
```

### State Management
```typescript
const [isDonationFocused, setIsDonationFocused] = useState(false)
const [manuallyFocused, setManuallyFocused] = useState(false)

// Refs to avoid useEffect dependencies
const isDonationFocusedRef = useRef(isDonationFocused)
const manuallyFocusedRef = useRef(manuallyFocused)
const stableDonationPositionRef = useRef<number | null>(null)

// Update refs when state changes
useEffect(() => {
  isDonationFocusedRef.current = isDonationFocused
}, [isDonationFocused])

useEffect(() => {
  manuallyFocusedRef.current = manuallyFocused
}, [manuallyFocused])
```

## Key Principles We Learned

### 1. **Simplicity Over Complexity**
- Started with complex viewport calculations and screen size detection
- Final solution uses simple scroll position thresholds with hysteresis
- **Lesson**: Simple, predictable logic is more reliable than complex responsive calculations

### 2. **State Stability is Critical**
- CSS transforms can change element measurements unpredictably
- Calculate positions when elements are in their "normal" state
- **Lesson**: Always consider how visual effects impact your measurements

### 3. **User Intent Must Be Respected**
- Don't fight against user scrolling with automatic positioning
- Provide clear, predictable thresholds for state changes
- **Lesson**: The interface should feel responsive to user actions, not autonomous

### 4. **Performance Considerations**
- Use `useCallback` with stable dependencies to prevent unnecessary re-renders
- Use refs to access current state without creating effect dependencies
- **Lesson**: React's useEffect dependency system requires careful handling for scroll events

### 5. **Hysteresis Prevents Flickering**
- Use different thresholds for activating vs deactivating (600px vs 500px)
- This prevents rapid state changes when scrolling near the threshold
- **Lesson**: Add buffer zones to make interfaces feel stable

## Testing Across Screen Sizes

The implementation works consistently across:
- **14-inch laptops**: Form focuses ~302px down, unfocuses ~202px up
- **Desktop monitors**: Same thresholds, adapted to actual form position
- **Large screens (33+ inches)**: No more auto-focus on page load, proper threshold calculation

## Files Modified

- `app/page.tsx`: Main implementation in the DonationPortal component
- `app/globals.css`: CSS transitions and transform classes

## Future Considerations

1. **Debouncing**: Could add debouncing for very rapid scroll events
2. **Reduced Motion**: Respect `prefers-reduced-motion` for accessibility
3. **Touch Devices**: Consider different thresholds for mobile/touch scrolling
4. **Analytics**: Track user interaction patterns with the focus system

## Mobile Implementation Challenges

### Current Mobile Paradigm
We implemented a completely different approach for mobile devices:
- **Full-screen overlay**: Form uses `fixed inset-0` positioning when focused
- **No automatic scrolling**: Mobile doesn't use `scrollIntoView()` to prevent interference
- **Responsive components**: Progress indicators, spacing, and layout adapt to mobile
- **Flex-based layout**: Uses `flex flex-col justify-between` for space distribution

### Ongoing Mobile Issues

#### 1. **Form Centering Problem**
**Issue**: When the donation form gains focus on mobile, it doesn't center properly on the page. Content appears misaligned and may be cut off at the bottom.

**Current approach**:
```typescript
// Container positioning
className="fixed inset-0 sm:relative ... flex flex-col z-50"

// Content alignment attempts
className="h-full p-4 ... justify-start"
className="w-full ... flex-1 flex flex-col justify-between"
```

**Problem**: The combination of `fixed inset-0`, `justify-start`, and `justify-between` doesn't achieve proper centering. The form appears at an awkward position on the screen.

#### 2. **Content Overflow on Small Screens**
**Issue**: On smaller mobile devices, form content (especially the "Next Step" button) gets cut off at the bottom of the viewport.

**Attempted solutions**:
- Reduced margins and padding
- Made progress indicators more compact
- Added `overflow-y-auto` to content areas
- Used `flex-1` for space distribution

**Remaining challenge**: Finding the right balance between fitting content and maintaining usability.

#### 3. **Inconsistent Mobile Experience**
**Issue**: The mobile experience varies across different device sizes and orientations, with some devices showing proper centering while others don't.

**Root cause**: Mobile viewport calculations and CSS positioning behave differently across devices, especially with `fixed` positioning and viewport units.

### Potential Solutions to Explore

1. **True Viewport Centering**: Use `100vh`/`100vw` with flexbox centering instead of `inset-0`
2. **Dynamic Height Calculation**: Calculate available viewport height and adjust form content accordingly
3. **Modal-like Approach**: Implement as a proper modal overlay with consistent centering
4. **Responsive Scaling**: Scale form content based on available screen space
5. **Alternative Layout**: Consider a slide-up drawer approach instead of full-screen overlay

### Technical Considerations

- **Viewport Units**: `100vh` vs `100svh` vs `inset-0` behavior differences
- **Mobile Browser UI**: Address bar and bottom navigation affecting viewport calculations
- **Safe Areas**: iOS and Android safe area considerations
- **Keyboard Interaction**: Form behavior when mobile keyboard appears

## Conclusion

The desktop implementation successfully solved the transform-measurement and infinite loop challenges through stable position calculation and proper React patterns. However, the mobile implementation reveals that different devices require fundamentally different approaches to achieve consistent, user-friendly experiences.

The key learnings include:
1. **Desktop/Mobile Paradigm Split**: Different screen sizes need completely different interaction patterns
2. **CSS Positioning Complexity**: `fixed` positioning on mobile has unique challenges across devices
3. **Viewport Calculation Issues**: Mobile viewport calculations are inconsistent and device-dependent
4. **Content Scaling Needs**: Mobile forms need dynamic content scaling, not just layout changes

The mobile centering challenge remains the primary technical hurdle, requiring a deeper investigation into mobile-specific CSS positioning and viewport handling strategies.