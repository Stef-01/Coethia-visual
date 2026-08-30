import {Composition} from 'remotion';
import {TokenProbe} from './TokenProbe';

/**
 * The composition is sized and timed from the tokens it is testing, not from
 * Remotion's defaults. 30fps because the page's durations are multiples of ~33ms
 * at that rate, so a token lands on a whole frame and a ported value is exact
 * rather than rounded.
 *
 * 5s of frames: the longest thing on screen is the key sweep at T_SWEEP*2 =
 * 2800ms, and the staggered entrances need about 1.2s. 150 frames covers both
 * with room to see the settled state, which is the frame the audit measures.
 */
export const MyComposition = () => (
  <Composition
    id="TokenProbe"
    component={TokenProbe}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={900}
  />
);
