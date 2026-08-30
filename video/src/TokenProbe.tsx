/**
 * TokenProbe — the motion tokens from faster-than-the-rumour.html, rendered where
 * they can be stepped one frame at a time.
 *
 * This is not decoration. The explainer's timings were authored by guesswork
 * because a scroll-driven page gives you no way to see a single frame: that is why
 * it accumulated 25 distinct durations and 43 staggers, and why 32 entrances were
 * left on an ease-in-out curve that makes an arrival read as lag. The tokens are
 * now a scale; this composition is where the scale gets judged.
 *
 * The values below MUST mirror the page. If they drift, this composition is
 * measuring something the reader never sees.
 *
 *   T_TAP 140  T_QUICK 240  T_BASE 400  T_ENTER 620  CAMERA 900  T_SWEEP 1400
 *   S_TIGHT 14  S_ROW 55  S_BEAT 80
 *   E_ENTER cubic-out   E_EXIT cubic-in   E_MOVE cubic-in-out   E_VALUE cubic-out
 *
 * Budget: delay + (n-1)*stagger + duration <= 1200ms for every entrance.
 * Sweeps are exempt -- the travel is the content, not the arrival of it.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';

const MS = {T_TAP: 140, T_QUICK: 240, T_BASE: 400, T_ENTER: 620, CAMERA: 900, T_SWEEP: 1400,
            T_MOVE_MS: 400} as const;   // T_BASE, named for the move row's intent
const STAGGER = {S_TIGHT: 14, S_ROW: 55, S_BEAT: 80} as const;

// The page's four curves. Remotion's Easing.bezier mirrors the d3 cubic family.
const E_ENTER = Easing.bezier(0.215, 0.61, 0.355, 1);      // cubic-out
const E_EXIT  = Easing.bezier(0.55, 0.055, 0.675, 0.19);   // cubic-in
const E_MOVE  = Easing.bezier(0.645, 0.045, 0.355, 1);     // cubic-in-out

const INK = '#212E36', PAPER = '#F6F1E7', TEAL = '#2E6E68', OCHRE = '#8D5D1C';

/** ms -> frames, at whatever fps the composition runs. */
const useMs = () => {
  const {fps} = useVideoConfig();
  return (ms: number) => (ms / 1000) * fps;
};

/**
 * One staggered entrance, exactly as the page does it: opacity 0 -> 1 on E_ENTER,
 * each item delayed by index * stagger.
 */
const StaggeredEntrance: React.FC<{
  label: string; n: number; durationMs: number; staggerMs: number; baseDelayMs?: number;
}> = ({label, n, durationMs, staggerMs, baseDelayMs = 0}) => {
  const frame = useCurrentFrame();
  const ms = useMs();
  const total = baseDelayMs + (n - 1) * staggerMs + durationMs;
  const overBudget = total > 1200;

  return (
    <div style={{marginBottom: 34}}>
      <div style={{font: '500 15px/1.3 monospace', color: overBudget ? '#B8492E' : TEAL,
                   letterSpacing: '.06em', marginBottom: 8}}>
        {label} — {total}ms{overBudget ? '  ⚠ over the 1200ms budget' : ''}
      </div>
      <div style={{display: 'flex', gap: 8}}>
        {Array.from({length: n}, (_, i) => {
          const start = ms(baseDelayMs + i * staggerMs);
          const o = interpolate(frame, [start, start + ms(durationMs)], [0, 1], {
            easing: E_ENTER, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return <div key={i} style={{
            width: 46, height: 46, background: INK, opacity: o,
            borderRadius: 2,   // chrome only. A box may never be the carrier of an idea here.
          }} />;
        })}
      </div>
    </div>
  );
};

/** A sweep: the travel IS the content, so the entrance budget does not apply. */
const Sweep: React.FC<{label: string; degrees: number; durationMs: number}> = ({label, degrees, durationMs}) => {
  const frame = useCurrentFrame();
  const ms = useMs();
  const a = interpolate(frame, [0, ms(durationMs)], [0, degrees], {
    easing: E_ENTER, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{marginBottom: 34}}>
      <div style={{font: '500 15px/1.3 monospace', color: OCHRE, letterSpacing: '.06em', marginBottom: 8}}>
        {label} — {degrees}° over {durationMs}ms (sweep: budget-exempt)
      </div>
      <svg width={120} height={120} viewBox="-60 -60 120 120">
        <g transform={`rotate(${a})`}>
          <rect x={-4} y={-46} width={8} height={52} fill={INK} />
          <circle cx={0} cy={16} r={16} fill="none" stroke={INK} strokeWidth={8} />
        </g>
      </svg>
    </div>
  );
};

/**
 * An exit, on the curve the page never had. E_EXIT accelerates away; before this
 * existed, exits ran on the same in-out curve as everything else, so things did not
 * leave -- they stopped being there. This row is here to be looked at, because that
 * is a judgement no metric makes.
 */
const Exit: React.FC<{label: string; durationMs: number}> = ({label, durationMs}) => {
  const frame = useCurrentFrame();
  const ms = useMs();
  const hold = ms(600);   // hold, so the departure is visible as a departure
  const o = interpolate(frame, [hold, hold + ms(durationMs)], [1, 0], {
    easing: E_EXIT, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{marginBottom: 34}}>
      <div style={{font: '500 15px/1.3 monospace', color: INK, letterSpacing: '.06em', marginBottom: 8}}>
        {label} — {durationMs}ms on E_EXIT
      </div>
      <div style={{width: 46, height: 46, background: INK, opacity: o, borderRadius: 2}} />
    </div>
  );
};

/** A traverse between two positions the object holds at both ends. */
const Move: React.FC<{label: string; durationMs: number}> = ({label, durationMs}) => {
  const frame = useCurrentFrame();
  const ms = useMs();
  const x = interpolate(frame, [0, ms(durationMs)], [0, 340], {
    easing: E_MOVE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{marginBottom: 34}}>
      <div style={{font: '500 15px/1.3 monospace', color: TEAL, letterSpacing: '.06em', marginBottom: 8}}>
        {label} — {durationMs}ms on E_MOVE
      </div>
      <div style={{position: 'relative', height: 46, width: 400}}>
        <div style={{position: 'absolute', left: x, width: 46, height: 46, background: TEAL, borderRadius: 2}} />
      </div>
    </div>
  );
};

export const TokenProbe: React.FC = () => (
  <AbsoluteFill style={{background: PAPER, padding: 56, fontFamily: 'Libre Franklin, system-ui'}}>
    <div style={{font: '700 30px/1.2 Libre Franklin, system-ui', color: INK, marginBottom: 30}}>
      Motion tokens, one frame at a time
    </div>

    {/* The three shapes the page actually uses. */}
    <StaggeredEntrance label="5 major objects · T_ENTER + S_BEAT" n={5}
      durationMs={MS.T_ENTER} staggerMs={STAGGER.S_BEAT} />
    <StaggeredEntrance label="12 rows · T_QUICK + S_ROW" n={12}
      durationMs={MS.T_QUICK} staggerMs={STAGGER.S_ROW} />
    <StaggeredEntrance label="20 cells · T_QUICK + S_TIGHT" n={20}
      durationMs={MS.T_QUICK} staggerMs={STAGGER.S_TIGHT} />

    {/* The three the audit still flags as over budget. */}
    <StaggeredEntrance label="8 objects · T_ENTER + S_BEAT + T_QUICK base" n={8}
      durationMs={MS.T_ENTER} staggerMs={STAGGER.S_BEAT} baseDelayMs={MS.T_QUICK} />

    {/* The two curves the page could never see. */}
    <Exit label="one object leaving" durationMs={MS.T_BASE} />
    <Move label="one object traversing" durationMs={MS.T_MOVE_MS} />

    <Sweep label="the key" degrees={340} durationMs={MS.T_SWEEP * 2} />
  </AbsoluteFill>
);
