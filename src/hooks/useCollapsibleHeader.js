import {useCallback, useRef, useState} from 'react';
import {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// How far the finger must travel in one direction before the bar reacts. Small enough to
// feel immediate, large enough that jitter in a "stationary" finger, or the overshoot at
// the end of a fling, cannot flip the bar back and forth.
const DIRECTION_THRESHOLD = 12;

// Above this offset the bar is allowed to hide. Below it the content is still essentially
// at the top, where hiding reads as a glitch rather than as making room.
const COLLAPSE_MIN_OFFSET = 64;

const TIMING = {duration: 180};

/**
 * Instagram-style hide-on-scroll-down / show-on-scroll-up for a header strip.
 *
 * ANIMATES HEIGHT AND OPACITY, NEVER A TRANSFORM. That is a deliberate constraint, not a
 * stylistic one: this screen previously lost every tap on its search bar and filter chips
 * because a native-driven translateY (RN's own ScrollViewStickyHeader) was applied outside
 * the Fabric ShadowTree, and Android hit-tests against the ShadowTree — so the chips were
 * painted in one place and touchable in another. Animating layout height keeps the painted
 * position and the hit box identical by construction, and because the header is a sibling
 * ABOVE the scroll view rather than an overlay, the list simply grows into the space.
 *
 * ANIMATION SHAPE — one progress value, a pure interpolating style.
 * `withTiming` is called exactly once per direction change, inside the scroll worklet, and
 * `useAnimatedStyle` only multiplies out the result. It must stay this way: an earlier
 * version called withTiming INSIDE useAnimatedStyle, which restarts the animation on every
 * re-evaluation of the style. On device that left the row stuck at ~8% opacity with its
 * height never animating at all — an invisible bar still occupying full height, with the
 * chips laid out at [395]-[430] but unreadable. Never put withTiming in the style worklet.
 *
 * @param {object} [options]
 * @param {number} [options.oneShotOffset] scroll offset at which to fire oneShotCallback.
 * @param {() => void} [options.oneShotCallback] fired AT MOST ONCE per hook instance, on
 *   the JS thread, the first time oneShotOffset is passed. A shared-value latch in the
 *   worklet guarantees the single call — this must never become a per-frame runOnJS, which
 *   is what previously saturated the JS thread and froze touch handling on this screen.
 */
const useCollapsibleHeader = ({oneShotOffset, oneShotCallback} = {}) => {
  // 1 = fully expanded, 0 = fully collapsed. The single source of truth for the animation.
  const progress = useSharedValue(1);
  const collapsed = useSharedValue(0);
  const lastY = useSharedValue(0);
  // Live scroll offset, so expand() can resync direction tracking to where the list
  // actually is rather than assuming the top.
  const currentY = useSharedValue(0);
  const measuredHeight = useSharedValue(0);
  const oneShotFired = useSharedValue(0);

  // React state (not just a shared value) because the animated height must not be applied
  // until the row's natural height is known — otherwise the very first frame would clamp it
  // to 0 and the chips would never be measurable.
  const [isMeasured, setIsMeasured] = useState(false);
  // onLayout keeps firing while the height animates; without this latch those intermediate
  // values would overwrite the natural height with whatever the animation was passing through.
  const measuredOnceRef = useRef(false);

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: event => {
        'worklet';
        const y = event.contentOffset.y;
        currentY.value = y;

        if (
          oneShotCallback &&
          oneShotFired.value === 0 &&
          typeof oneShotOffset === 'number' &&
          y >= oneShotOffset
        ) {
          oneShotFired.value = 1;
          runOnJS(oneShotCallback)();
        }

        const delta = y - lastY.value;

        // Always show at (or bounced above) the top. Without this an interrupted upward
        // fling could leave the bar hidden with nothing left to scroll up into.
        if (y <= COLLAPSE_MIN_OFFSET) {
          lastY.value = y;
          if (collapsed.value !== 0) {
            collapsed.value = 0;
            progress.value = withTiming(1, TIMING);
          }
          return;
        }

        if (Math.abs(delta) < DIRECTION_THRESHOLD) {
          return;
        }

        lastY.value = y;
        const nextCollapsed = delta > 0 ? 1 : 0;
        if (collapsed.value !== nextCollapsed) {
          collapsed.value = nextCollapsed;
          progress.value = withTiming(nextCollapsed === 1 ? 0 : 1, TIMING);
        }
      },
    },
    [oneShotCallback, oneShotOffset],
  );

  // Pure interpolation — no withTiming here, by design (see the block comment above).
  const animatedStyle = useAnimatedStyle(() => ({
    height: measuredHeight.value * progress.value,
    opacity: progress.value,
  }));

  const onContentLayout = useCallback(
    event => {
      const {height} = event.nativeEvent.layout;
      if (measuredOnceRef.current || height <= 0) {
        return;
      }
      measuredOnceRef.current = true;
      measuredHeight.value = height;
      setIsMeasured(true);
    },
    [measuredHeight],
  );

  /**
   * Force the bar back into view. Called on chip selection and pull-to-refresh — either of
   * which could otherwise leave it hidden while the user is looking at fresh content.
   *
   * lastY is resynced to the LIVE offset, not to 0. Zeroing it while the list sat at, say,
   * 800px made the next scroll event compute a delta of +800 and collapse the bar again
   * immediately, in whichever direction the user happened to scroll.
   */
  const expand = useCallback(() => {
    collapsed.value = 0;
    lastY.value = currentY.value;
    progress.value = withTiming(1, TIMING);
  }, [collapsed, currentY, lastY, progress]);

  /**
   * Feed the scroll view's content and viewport heights in. When everything already fits
   * there is no scrolling to make room for — and a short, empty or heavily filtered list is
   * exactly the case where a hidden bar would have no gesture available to bring it back.
   */
  const syncScrollable = useCallback(
    (contentHeight, viewportHeight) => {
      if (viewportHeight > 0 && contentHeight <= viewportHeight) {
        expand();
      }
    },
    [expand],
  );

  return {
    scrollHandler,
    animatedStyle,
    onContentLayout,
    isMeasured,
    expand,
    syncScrollable,
  };
};

export default useCollapsibleHeader;
