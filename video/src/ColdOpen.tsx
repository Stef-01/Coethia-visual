import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {loadFont as loadSans} from '@remotion/google-fonts/LibreFranklin';
import {loadFont as loadMono} from '@remotion/google-fonts/IBMPlexMono';
import {
  ALARM, INK, LINE, MONO, MUTE, PAPER, SANS, SERIF,
  E_ENTER, E_EXIT, E_MOVE, E_VALUE,
  T_BASE, T_ENTER, T_QUICK, T_SWEEP, S_ROW, S_BEAT,
  mix, tween,
} from './tokens';

/* the returned family names are kept because measureText needs the resolved
   family, not the CSS stack */
const SANS_FAMILY = loadSans().fontFamily;
loadMono();

/**
 * A cold open for "Faster Than the Rumour".
 *
 * Two decisions worth stating, because both were the second answer rather than
 * the first.
 *
 * THERE IS NO PERSON IN THE ROOM, and there is not one at any point. The scene
 * this is built from is titled "What Was in the Room After She Left It", and the
 * obvious staging is a small figure walking out through the door. That would be a
 * misrepresentation: the six-year-old in Lubbock did not walk out of the room,
 * she died in the hospital. The page uses the empty room to explain a property of
 * the virus -- it stays infectious in a room "a case walked through ninety
 * minutes ago" -- and the emptiness is not a frame around the subject, it IS the
 * subject. So the room is empty from frame zero and the only thing in it is what
 * is still suspended in the air.
 *
 * NOTHING THINS OUT OVER THE TWO HOURS. Animating the particles decaying would be
 * the natural instinct -- it gives the clock something to do and reads as
 * "progress" -- and it inverts the argument. The point of the two-hour figure is
 * that the air does NOT clear on any timescale a person in the room could act on.
 * The particles hold, undiminished, for the whole sweep. The clock is the only
 * thing that moves, which is precisely the complaint.
 *
 * Every colour, curve and duration is imported from tokens.ts, which is copied
 * from the page. Nothing here invents a value.
 */

const W = 1920;
const H = 1080;

/* the room, in stage coordinates */
const RX = 250, RY = 250, RW = 1000, RH = 590;

/* seeded, because Remotion re-renders frames out of order and caches them; an
   unseeded Math.random would make each frame's dust a different cloud. Same LCG
   the page uses, so the grain has the same character. */
function suspended(n: number) {
  let s = 20260825;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  return Array.from({length: n}, () => ({
    x: RX + 26 + rnd() * (RW - 52),
    y: RY + 26 + rnd() * (RH - 52),
    r: 1.6 + rnd() * 2.6,
    /* drift measured in stage units per second, deliberately tiny: the air in a
       closed room is close to still, and fast-moving motes would read as smoke */
    vx: (rnd() - 0.5) * 7,
    vy: (rnd() - 0.5) * 5,
    phase: rnd() * Math.PI * 2,
    op: 0.22 + rnd() * 0.4,
  }));
}
const DUST = suspended(120);

const arcPath = (cx: number, cy: number, r: number, deg: number) => {
  if (deg <= 0.01) return '';
  const d = Math.min(deg, 359.99);
  const a = ((d - 90) * Math.PI) / 180;
  return [
    'M', cx, cy - r,
    'A', r, r, 0, d > 180 ? 1 : 0, 1,
    cx + r * Math.cos(a), cy + r * Math.sin(a),
  ].join(' ');
};

/* ------------------------------------------------------------------ */
/* the room holds for the first two beats: same space, same air        */
/* ------------------------------------------------------------------ */
const Room: React.FC<{spanFrames: number}> = ({spanFrames}) => {
  const frame = useCurrentFrame();
  const secs = frame / 30;

  /* the structure draws itself in, then holds */
  const build = tween(frame, 120, T_SWEEP, E_ENTER);
  const air = tween(frame, 900, T_SWEEP * 2, E_ENTER);
  const out = 1 - tween(frame, (spanFrames / 30) * 1000 - T_BASE, T_BASE, E_EXIT);

  /* the clock: 0 -> 120 minutes, on the value curve the page counts with */
  const clockIn = tween(frame, 5200, T_ENTER, E_ENTER);
  const swept = tween(frame, 5600, T_SWEEP * 4, E_VALUE);
  const minutes = Math.round(mix(0, 120, swept));

  const CX = 1560, CY = 470, CR = 118;

  return (
    <g opacity={out}>
      {/* floor */}
      <line
        x1={RX - 60} y1={RY + RH} x2={RX + RW + 60} y2={RY + RH}
        stroke={LINE} strokeWidth={2}
        strokeDasharray={RW + 120}
        strokeDashoffset={(1 - build) * (RW + 120)}
      />
      {/* walls, drawn as one open figure with the doorway missing on the right */}
      <path
        d={`M ${RX} ${RY + RH} L ${RX} ${RY} L ${RX + RW} ${RY} L ${RX + RW} ${RY + RH - 190}`}
        fill="none" stroke={LINE} strokeWidth={2}
        strokeDasharray={2000} strokeDashoffset={(1 - build) * 2000}
      />
      {/* The opening, marked at the floor only.
          There was a door here, drawn as a MUTE diagonal swinging out of the wall,
          and it read as a stray dark stick floating in the margin -- it met the
          wall at one end and nothing at the other, and it was the darkest mark on
          the frame in a scene whose subject is the palest. A gap in a wall with a
          threshold under it is already a doorway. Nothing needs to be added to
          say the room was left; the room being empty says it. */}
      <line
        x1={RX + RW - 4} y1={RY + RH} x2={RX + RW + 58} y2={RY + RH}
        stroke={INK} strokeWidth={3} opacity={build * 0.55}
      />

      {/* a bed, because the room is a hospital room and an unmarked box is not one */}
      <g opacity={build * 0.9}>
        <rect x={RX + 118} y={RY + 372} width={330} height={96} rx={8}
              fill="none" stroke={LINE} strokeWidth={2} />
        {/* The raised head panel, which is what distinguishes a hospital bed from
            a table -- without it the object is a flat slab on four legs.

            Drawn as an explicit parallelogram whose base runs ALONG the mattress
            top from x+160 to x+270. The previous version was a <rect> with
            `rotate(-24)` about its bottom-left corner, and I wrote in this comment
            that it therefore could not float because it met the mattress along its
            whole lower edge. That is not what rotation does. A rotation fixes one
            POINT; the rest of the edge swings away from the line it started on.
            The bottom-left corner stayed put and the bottom-right corner lifted 25
            units clear of the mattress, so the panel hung in the air off the
            corner of the bed -- the identical defect to the door diagonal removed
            above, reintroduced in the same commit by the comment that claimed to
            rule it out. Stating the invariant is not the same as having it.

            A quadrilateral with two vertices ON the mattress top cannot lift off
            it, because the contact is in the coordinates rather than in an
            argument about the transform. */}
        <path
          d={`M ${RX + 160} ${RY + 372} L ${RX + 270} ${RY + 372}` +
             ` L ${RX + 228} ${RY + 290} L ${RX + 118} ${RY + 290} Z`}
          fill="none" stroke={LINE} strokeWidth={2}
        />
        {/* pillow: on the mattress top edge, against the panel's base */}
        <rect x={RX + 168} y={RY + 352} width={78} height={22} rx={11}
              fill={LINE} opacity={0.42} />
        {/* to RY+RH, which is the floor. They stopped at RY+512 and the floor is
            at RY+590, so the bed hovered 78 units off the ground. */}
        <line x1={RX + 150} y1={RY + 468} x2={RX + 150} y2={RY + RH} stroke={LINE} strokeWidth={2} />
        <line x1={RX + 416} y1={RY + 468} x2={RX + 416} y2={RY + RH} stroke={LINE} strokeWidth={2} />
      </g>
      {/* a window, so the wall has a scale */}
      <g opacity={build * 0.8}>
        <rect x={RX + 660} y={RY + 88} width={230} height={150} rx={4}
              fill="none" stroke={LINE} strokeWidth={2} />
        <line x1={RX + 775} y1={RY + 88} x2={RX + 775} y2={RY + 238} stroke={LINE} strokeWidth={1.5} />
      </g>

      {/* what is still in it */}
      {DUST.map((p, i) => {
        const wob = Math.sin(secs * 0.55 + p.phase);
        return (
          <circle
            key={i}
            cx={p.x + p.vx * secs + wob * 5}
            cy={p.y + p.vy * secs + Math.cos(secs * 0.42 + p.phase) * 4}
            r={p.r}
            fill={ALARM}
            opacity={p.op * air}
          />
        );
      })}

      {/* the clock */}
      <g opacity={clockIn}>
        <circle cx={CX} cy={CY} r={CR} fill="none" stroke={LINE} strokeWidth={2} />
        {Array.from({length: 12}, (_, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180;
          return (
            <line key={i}
              x1={CX + Math.cos(a) * (CR - 12)} y1={CY + Math.sin(a) * (CR - 12)}
              x2={CX + Math.cos(a) * (CR - 2)} y2={CY + Math.sin(a) * (CR - 2)}
              stroke={LINE} strokeWidth={i % 3 === 0 ? 2.5 : 1.5} />
          );
        })}
        {/* One turn IS the two hours -- so the twelve marks read as ten minutes
            each, and the dial is a 120-minute dial rather than a clock that
            happens to be on screen. The first version made it two revolutions of
            a real clock face, which is more literal and was wrong twice: the
            sweep was `(minutes/120)*720 % 360`, and that expression is zero at
            minutes=60 and again at minutes=120, so the arc blinked out of
            existence at the end of the first hour and at the exact instant the
            two hours completed. The two frames the whole shot exists to deliver
            were the two frames with nothing drawn. */}
        <path d={arcPath(CX, CY, CR - 22, (minutes / 120) * 360)}
              fill="none" stroke={ALARM} strokeWidth={7} strokeLinecap="round" />
        <text x={CX} y={CY + 14} textAnchor="middle"
              fontFamily={MONO} fontSize={54} fontWeight={500} fill={INK}>
          {minutes}
        </text>
        <text x={CX} y={CY + 46} textAnchor="middle"
              fontFamily={MONO} fontSize={19} fill={MUTE} letterSpacing={2}>
          MINUTES
        </text>
        <text x={CX} y={CY + CR + 52} textAnchor="middle"
              fontFamily={MONO} fontSize={18} fill={MUTE} letterSpacing={1.6}
              /* gated on the readout, not on the tween. `swept >= 1` is only
                 true on the final frame or two, because cubicOut approaches 1
                 asymptotically -- the counter reads 120 for roughly a second
                 before the tween formally completes, so the label that is
                 supposed to land WITH the number never appeared with it. */
              opacity={minutes >= 120 ? 1 : 0}>
          STILL INFECTIOUS
        </text>
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
const Caption: React.FC<{
  at: number; lines: string[]; hold: number;
  size?: number; family?: string; colour?: string; weight?: number;
}> = ({at, lines, hold, size = 46, family = SANS, colour = INK, weight = 400}) => {
  const frame = useCurrentFrame();
  const inn = tween(frame, at, T_ENTER, E_ENTER);
  const outt = 1 - tween(frame, at + hold, T_BASE, E_EXIT);
  const op = Math.min(inn, outt);
  if (op <= 0.001) return null;
  return (
    <g opacity={op}>
      {lines.map((l, i) => (
        <text key={i}
          x={250} y={130 + i * (size * 1.34)}
          fontFamily={family} fontSize={size} fontWeight={weight} fill={colour}
          /* rise on entry: the page moves arriving things a short distance on the
             same curve rather than fading them in place */
          transform={`translate(0 ${mix(14, 0, tween(frame, at + i * S_BEAT, T_ENTER, E_ENTER))})`}
        >{l}</text>
      ))}
    </g>
  );
};

/* ------------------------------------------------------------------ */
const Figures: React.FC = () => {
  const frame = useCurrentFrame();
  /* Every one of these has to be a sentence the page already stands behind.
     The third row read "0 -- of those three had been vaccinated", which is a
     stronger claim than the source supports: the page records the two Lubbock
     children as unvaccinated and says only that the third death was "an adult in
     New Mexico", with no status given. Asserting zero across all three invents
     the third data point to square the pattern -- exactly the move this piece is
     an argument against. Replaced with the two the page does document. */
  const rows = [
    ['762', 'confirmed cases'],
    ['3', 'deaths — the first from measles in the US since 2015'],
    ['2', 'were unvaccinated children, in the same Lubbock hospital'],
  ];
  const out = 1 - tween(frame, 4200, T_BASE, E_EXIT);
  const head = tween(frame, 120, T_ENTER, E_ENTER);
  return (
    <g opacity={out}>
      <g opacity={head}>
        <text x={250} y={250} fontFamily={MONO} fontSize={22} fill={MUTE} letterSpacing={2.4}>
          THE WEST TEXAS OUTBREAK · DECLARED OVER 18 AUGUST 2025
        </text>
        <line x1={250} y1={286} x2={250 + head * 1420} y2={286} stroke={INK} strokeWidth={2} />
      </g>
      {rows.map(([n, label], i) => {
        const t = tween(frame, 300 + i * S_ROW * 4, T_ENTER, E_ENTER);
        /* the number counts; the label arrives whole */
        const shown = String(Math.round(mix(0, Number(n), t)));
        return (
          <g key={i} opacity={t}>
            <text x={250} y={380 + i * 152}
                  /* all three in ALARM: teal reads as the good number elsewhere in
                     the palette, and none of these is one */
                  fontFamily={MONO} fontSize={104} fontWeight={500} fill={ALARM}
                  transform={`translate(${mix(-18, 0, t)} 0)`}>{shown}</text>
            <text x={560} y={380 + i * 152}
                  fontFamily={SANS} fontSize={38} fill={INK}>{label}</text>
            <line x1={250} y1={380 + i * 152 + 44} x2={1670} y2={380 + i * 152 + 44}
                  stroke={LINE} strokeWidth={1.5} opacity={t * 0.7} />
          </g>
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
const Thesis: React.FC = () => {
  const frame = useCurrentFrame();
  const struck = ['No distance you can keep.', 'No surface you can wipe.', 'No moment of care you can take.'];

  /**
   * MEASURED, not estimated.
   *
   * The strike was `s.length * 20.5` -- characters times a guessed average
   * advance. That is wrong per line and wrong in a way that shows: "keep." and
   * "take." overshot past the full stop by a visible amount while "wipe." landed
   * about right, because the estimate cannot know that 'l' and 'f' are narrow and
   * 'm' and 'w' are wide. A rule that stops a few units past the end of a
   * sentence does not read as a considered choice, it reads as a rule that missed.
   *
   * measureText resolves the actual advance width for this string in this face at
   * this size. Same instinct as the rest of this repo: the page has a whole
   * fitter rather than a hand-tuned font size, for the same reason.
   */
  const widths = struck.map((line) =>
    measureText({
      text: line,
      fontFamily: SANS_FAMILY,
      fontSize: 44,
      fontWeight: '400',
    }).width
  );

  return (
    <g>
      {struck.map((s, i) => {
        const inn = tween(frame, 200 + i * S_ROW * 5, T_ENTER, E_ENTER);
        /* each is ruled through as the next arrives: the list is being eliminated,
           not accumulated, so the strike is the information */
        const kill = tween(frame, 620 + i * S_ROW * 5, T_QUICK * 2, E_MOVE);
        /* they recede rather than leave -- the eliminated options stay legible
           under the conclusion they lead to. 0.28 residual, the first value, was
           past legible. */
        const fade = 1 - tween(frame, 2500, T_BASE, E_EXIT) * 0.6;
        return (
          <g key={i} opacity={inn * fade}>
            <text x={250} y={300 + i * 86}
                  fontFamily={SANS} fontSize={44} fill={MUTE}>{s}</text>
            <line x1={244} y1={300 + i * 86 - 13}
                  x2={244 + kill * (widths[i] + 12)} y2={300 + i * 86 - 13}
                  stroke={ALARM} strokeWidth={3} />
          </g>
        );
      })}

      {(() => {
        const t = tween(frame, 2700, T_ENTER, E_ENTER);
        return (
          <g opacity={t}>
            <text x={250} y={640} fontFamily={SANS} fontSize={54} fontWeight={600} fill={INK}
                  transform={`translate(0 ${mix(16, 0, t)})`}>
              There is exactly one instrument, and it is coverage.
            </text>
          </g>
        );
      })()}

      {(() => {
        const t = tween(frame, 3900, T_SWEEP, E_ENTER);
        const rule = tween(frame, 3900, T_SWEEP, E_MOVE);
        return (
          <g opacity={t}>
            <line x1={250} y1={790} x2={250 + rule * 1420} y2={790}
                  stroke={INK} strokeWidth={2} />
            <text x={250} y={880} fontFamily={SERIF} fontSize={72} fill={INK}>
              Faster Than the Rumour
            </text>
            <text x={250} y={936} fontFamily={MONO} fontSize={24} fill={MUTE} letterSpacing={2}>
              WHY PUBLIC HEALTH LOST THE FEED
            </text>
          </g>
        );
      })()}
    </g>
  );
};

/* ------------------------------------------------------------------ */
export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  /* one hairline and one standing credit, present for the whole running time, so
     the four beats read as one document rather than four slides */
  const chrome = tween(frame, 60, T_SWEEP, E_ENTER);

  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <g opacity={chrome}>
          <line x1={250} y1={1000} x2={1670} y2={1000} stroke={LINE} strokeWidth={1.5} />
          <text x={250} y={1036} fontFamily={MONO} fontSize={18} fill={MUTE} letterSpacing={1.8}>
            COETHIA
          </text>
          <text x={1670} y={1036} textAnchor="end" fontFamily={MONO} fontSize={18} fill={MUTE}
                letterSpacing={1.4}>
            SOURCES: TEXAS DSHS · CDC
          </text>
        </g>

        {/* layout="none" on all three, and it is load-bearing. Sequence wraps its
            children in an AbsoluteFill -- a <div> -- unless told not to. A <div>
            inside <svg> is not a rendering error, it is simply not an SVG element,
            so the browser parses it and draws nothing. Every beat vanished while
            the page chrome outside the Sequences kept drawing, which is why eight
            probe stills came back with two distinct hashes: frame 40 and
            "everything else", the difference being the chrome's fade still being
            0.9993 rather than 1. */}
        <Sequence layout="none" from={0} durationInFrames={370}>
          <Room spanFrames={370} />
          <Caption at={300} hold={2600}
                   lines={['Lubbock, Texas. February 2025.']}
                   family={MONO} size={34} colour={MUTE} />
          <Caption at={3300} hold={5400} size={44}
                   lines={[
                     'Measles is airborne. The virus stays suspended and',
                     'infectious in a room for up to two hours after the',
                     'person carrying it has gone.',
                   ]} />
        </Sequence>

        <Sequence layout="none" from={370} durationInFrames={160}>
          <Figures />
        </Sequence>

        <Sequence layout="none" from={530} durationInFrames={220}>
          <Thesis />
        </Sequence>
      </svg>
    </AbsoluteFill>
  );
};
