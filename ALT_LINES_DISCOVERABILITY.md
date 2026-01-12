# Making Alternative Lines More Discoverable - Brainstorming Ideas

## Problem
Users don't realize that clicking on the spread/total (e.g., "45.5") opens a modal to adjust it and see alternative lines. We need to make this functionality more obvious.

---

## Visual Indicator Approaches

### 1. **Icon Badge/Indicator**
**What it looks like:**
- Add a small icon (chevron down, settings gear, or "lines" icon) next to or inside the spread/total number
- Could be: `45.5 ⌄` or `45.5 ⚙` or `45.5 📊`

**Pros:**
- Universal symbol for "more options" or "adjustable"
- Doesn't take up much space
- Familiar pattern (like dropdown arrows)

**Cons:**
- Might be too subtle for some users
- Icon meaning might not be immediately clear

**Implementation:**
- Small icon positioned to the right or bottom-right of the number
- Could animate on hover (pulse, bounce, or rotate)

---

### 2. **"Alt Lines" Badge or Label**
**What it looks like:**
- Text label like "Alt Lines" or "More Lines" next to the number
- Could be: `45.5 [Alt Lines]` or `45.5 (More Options)`

**Pros:**
- Very explicit - users know what they're getting
- No ambiguity about functionality

**Cons:**
- Takes up more space
- Might clutter the interface
- Could feel redundant if users already know

**Variations:**
- Small pill/badge style: `45.5` with a small badge saying "6 lines"
- Count indicator: `45.5 (6 alt lines)`

---

### 3. **Underline or Dotted Underline**
**What it looks like:**
- Make the number look like a link: `45.5` (underlined or dotted underline)
- Similar to how clickable links are styled

**Pros:**
- Universal web convention - users know underlined = clickable
- Minimal visual change
- Clean and unobtrusive

**Cons:**
- Might be confused with actual links
- Could blend in if not styled distinctly

**Enhancement:**
- Add hover effect (color change, underline animation)
- Use a different color (blue, purple) to indicate interactivity

---

### 4. **Highlighted/Colored Background**
**What it looks like:**
- Give the number a subtle background color or border
- Could be: light blue background, or a colored border around the number

**Pros:**
- Makes the element stand out visually
- Clearly indicates it's different from other numbers
- Can use brand colors

**Cons:**
- Might be too prominent/distracting
- Could clash with existing design
- May look like it's already selected/active

**Variations:**
- Subtle gradient background
- Pulsing border animation
- Glow effect on hover

---

### 5. **Button-Style Treatment**
**What it looks like:**
- Make the entire spread/total look like a button
- Rounded corners, padding, background color, shadow

**Pros:**
- Very obvious that it's clickable
- Follows standard UI patterns
- Clear call-to-action

**Cons:**
- More dramatic visual change
- Might look too "button-like" if you want it to feel like data
- Takes up more space

**Variations:**
- Pill-shaped button
- Outlined button style (border, no fill)
- Ghost button (transparent with hover fill)

---

## Interactive/Animation Approaches

### 6. **Hover Effects**
**What it looks like:**
- When user hovers over the number, show clear feedback:
  - Background color change
  - Scale up slightly
  - Show tooltip: "Click to see alternative lines"
  - Icon appears on hover

**Pros:**
- Discoverable through exploration
- Doesn't clutter the interface when not needed
- Provides immediate feedback

**Cons:**
- Only works on desktop (not mobile)
- Users need to discover it by accident
- Might miss it if they don't hover

**Enhancement:**
- Combine with other visual indicators
- Add a subtle animation that draws attention

---

### 7. **Pulse or Breathing Animation**
**What it looks like:**
- Subtle pulsing animation on the number
- Draws attention without being annoying

**Pros:**
- Eye-catching
- Indicates interactivity
- Modern feel

**Cons:**
- Can be distracting if too strong
- Might feel "busy"
- Some users find animations annoying

**Best Practice:**
- Very subtle (slow pulse, small scale change)
- Only animate on first load or when modal is available
- Stop after user interacts

---

### 8. **Tooltip on Hover**
**What it looks like:**
- When hovering, show a tooltip: "Click to adjust line" or "View alternative lines"

**Pros:**
- Explicit instruction
- Doesn't clutter the interface
- Helpful for new users

**Cons:**
- Only visible on hover
- Mobile users won't see it
- Requires user to discover it

**Enhancement:**
- Show on first visit only
- Make it dismissible
- Include a count: "6 alternative lines available"

---

## Text/Content Approaches

### 9. **Helper Text Below**
**What it looks like:**
- Small text below the spread/total: "Click to adjust" or "Tap for more lines"

**Pros:**
- Very clear instruction
- Always visible
- No ambiguity

**Cons:**
- Takes up vertical space
- Might feel like unnecessary instruction for experienced users
- Could clutter the interface

**Variations:**
- Show only on first visit
- Make it dismissible
- Smaller, lighter text

---

### 10. **Count Indicator**
**What it looks like:**
- Show how many alternative lines are available: `45.5 (6 lines)`

**Pros:**
- Informative - tells users what they'll get
- Creates curiosity ("what are the other 5 lines?")
- Value proposition

**Cons:**
- Takes up space
- Number might change frequently
- Could be confusing if count is 0

**Variations:**
- `45.5 +6` (compact)
- Badge style: `45.5` with a small `6` badge
- Only show if count > 1

---

## Progressive Disclosure Approaches

### 11. **Preview of Alternative Lines**
**What it looks like:**
- Show 1-2 alternative lines next to the main line
- Example: `45.5` with small text showing `44.5, 46.5` below or to the side

**Pros:**
- Shows value immediately
- Creates curiosity to see more
- No clicking required to see some options

**Cons:**
- Takes up significant space
- Might clutter the interface
- Could be overwhelming

**Variations:**
- Show only on hover
- Collapsible section
- Show only if there are popular alternatives

---

### 12. **"View All Lines" Link/Button**
**What it looks like:**
- Separate button/link near the spread: "View all lines" or "Adjust line"

**Pros:**
- Very explicit
- Clear call-to-action
- Doesn't require clicking the number itself

**Cons:**
- Takes up space
- Might be redundant if the number is also clickable
- Could create confusion about which to click

**Variations:**
- Small text link
- Icon button
- Only show if alternatives exist

---

## Combination Approaches (Recommended)

### 13. **Icon + Hover Tooltip + Underline**
**What it looks like:**
- Number with small chevron icon
- Underlined (like a link)
- Tooltip on hover: "Click to see 6 alternative lines"

**Why it works:**
- Multiple signals reinforce the message
- Works for different user types (visual, text-based)
- Discoverable through exploration

---

### 14. **Button Style + Count Badge**
**What it looks like:**
- Make the number look like a button
- Add a small badge showing count: `[45.5] (6)`

**Why it works:**
- Very obvious it's clickable
- Shows value (how many alternatives)
- Modern, app-like feel

---

### 15. **Colored Background + Icon + Helper Text (First Visit Only)**
**What it looks like:**
- Subtle colored background on the number
- Small icon next to it
- Helper text below (only on first visit): "Tap to adjust line"

**Why it works:**
- Teaches users on first visit
- Doesn't clutter for returning users
- Multiple visual cues

---

## Mobile-Specific Considerations

### 16. **Larger Touch Target**
**What it looks like:**
- Make the entire area around the number larger and more tappable
- Add padding to increase touch target size

**Why it matters:**
- Mobile users need larger targets
- Easier to tap = more likely to discover
- Better UX overall

---

### 17. **Swipe Indicator**
**What it looks like:**
- Show a small swipe icon or animation
- Indicates the number can be interacted with

**Why it works:**
- Mobile-native pattern
- Familiar gesture
- Clear interaction model

---

## Testing Recommendations

### A/B Test Ideas:
1. **Icon vs. No Icon** - Does adding an icon increase clicks?
2. **Button Style vs. Link Style** - Which feels more natural?
3. **Count Badge vs. No Count** - Does showing "6 lines" increase engagement?
4. **Tooltip vs. No Tooltip** - Does explicit instruction help?

### Metrics to Track:
- Click-through rate on the spread/total
- Time to first modal open
- User feedback on discoverability
- Mobile vs. desktop behavior

---

## Recommended Solution (Based on Best Practices)

### **Primary Recommendation: Icon + Underline + Hover Tooltip**

**Implementation:**
```
45.5 ⌄
```
- Number is underlined (link style)
- Small chevron icon to the right
- Hover shows tooltip: "Click to see alternative lines"
- Hover also changes color slightly

**Why this works:**
- Multiple visual cues (underline = clickable, icon = more options)
- Doesn't take up much space
- Familiar web patterns
- Works on both desktop and mobile
- Tooltip provides instruction without cluttering

### **Alternative: Button Style with Count Badge**

**Implementation:**
```
[45.5] (6)
```
- Number in a button/pill shape
- Small badge showing count of alternative lines
- Clear hover state

**Why this works:**
- Very obvious it's interactive
- Shows value immediately
- Modern, app-like feel
- Creates curiosity about the other lines

---

## Quick Wins (Easy to Implement)

1. **Add underline** - 5 minutes, high impact
2. **Add hover color change** - 5 minutes, high impact
3. **Add small icon** - 10 minutes, medium-high impact
4. **Add tooltip** - 15 minutes, medium impact
5. **Make it look like a button** - 20 minutes, high impact

---

## Questions to Consider

1. **How many alternative lines are typically available?**
   - If many (5+), showing count might be valuable
   - If few (1-2), might not need count

2. **Is this a primary action or secondary?**
   - Primary = more prominent (button style)
   - Secondary = more subtle (icon + underline)

3. **What's the user's mental model?**
   - Do they expect to click numbers to adjust them?
   - Or do they expect a separate button?

4. **Mobile vs. Desktop usage?**
   - Mobile might need larger touch targets
   - Desktop can rely more on hover states

5. **First-time vs. returning users?**
   - First-time might need more guidance
   - Returning users might prefer less clutter

---

## Next Steps

1. **Choose 2-3 approaches** to prototype
2. **Create mockups** of each approach
3. **Get user feedback** on which feels most obvious
4. **A/B test** the top choice vs. current design
5. **Iterate** based on data
