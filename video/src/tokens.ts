/**
 * The page's design tokens, ported once.
 *
 * These are not "similar to" the values in faster-than-the-rumour.html; they are
 * the same numbers, copied from it. The reason to centralise them rather than
 * inline a nice-looking hex per component is that this video's only claim to
 * being an artefact OF the piece rather than a video ABOUT it is that it moves
 * on the piece's own curves at the piece's own speeds. Drift in either makes it
 * a different thing that happens to share a colour scheme.
 *
 * Anything added here must exist in the page. If a value is needed that the page
 * does not have, that is a signal to add it to the page first.
 */

/* ---- palette: verbatim from the page's colour block ---- */
export const INK = '#212E36';
export const PAPER = '#F8F6F1';
export const MUTE = '#666666';
export const ALARM = '#B8492E';
export const RED = '#D53F3B';
export const TEAL = '#7FCCC8';
export const TEAL_D = '#31756F';
export const BLUE = '#C3DCEB';
export const GOLD = '#8D5D1C';
export const ACCENT = '#F37940';
export const LINE = '#DCD5C6';

/* ---- type: the page's three CSS custom properties ---- */
export const SANS = '"Libre Franklin", Helvetica, Arial, sans-serif';
export const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
export const SERIF =
  'Optima, "Gill Sans", "Gill Sans MT", Candara, "Libre Franklin", sans-serif';

/**
 * ---- easings ----
 *
 * Written out rather than mapped onto Remotion's Easing helpers. d3's cubics are
 * exactly these polynomials, and Remotion's `Easing.bezier(...)` approximations
 * of them are close but not equal. Since the whole point is parity with the page,
 * an approximation is the one thing that cannot be allowed: a video whose curves
 * are nearly the page's is worse than useless as a reference, because it looks
 * right while being wrong, and any future comparison inherits the error.
 *
 * Semantics, matching the page's comments:
 *   E_ENTER  arriving      cubicOut  — decelerate into place
 *   E_EXIT   leaving       cubicIn   — accelerate away
 *   E_MOVE   travelling    cubicInOut
 *   E_VALUE  counting      cubicOut
 */
export const E_ENTER = (t: number) => 1 - Math.pow(1 - t, 3);
export const E_EXIT = (t: number) => t * t * t;
export const E_MOVE = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const E_VALUE = E_ENTER;
export const E_LINEAR = (t: number) => t;

/* ---- durations, in milliseconds, as the page declares them ---- */
export const T_TAP = 140;
export const T_QUICK = 240;
export const T_BASE = 400;
export const T_ENTER = 620;
export const T_SWEEP = 1400;

/* ---- stagger steps ---- */
export const S_TIGHT = 14;
export const S_ROW = 55;
export const S_BEAT = 80;

export const FPS = 30;

/** ms -> frames. Not rounded: sub-frame offsets are what make a stagger of 14ms
 *  visible at all at 30fps, where one frame is 33.3ms. Rounding S_TIGHT to a
 *  frame boundary would collapse the whole tight-stagger token to zero. */
export const f = (ms: number) => (ms / 1000) * FPS;

/**
 * The page's own animation primitive, as a value function.
 *
 * frame        current frame
 * startMs      when this element begins, in ms from the sequence start
 * durMs        one of the T_ tokens
 * ease         one of the E_ functions
 * returns      0..1, clamped at both ends
 */
export const tween = (
  frame: number,
  startMs: number,
  durMs: number,
  ease: (t: number) => number = E_ENTER
) => {
  const t = (frame - f(startMs)) / f(durMs);
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return ease(t);
};

/** Linear interpolate, so a tween can drive something other than opacity. */
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
