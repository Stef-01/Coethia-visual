import {Composition} from 'remotion';
import {TokenProbe} from './TokenProbe';
import {ColdOpen} from './ColdOpen';

/**
 * 30fps because the page's durations are multiples of ~33ms at that rate, so a
 * token lands on a whole frame and a ported value is exact rather than rounded.
 */
export const MyComposition = () => (
  <>
    {/* The deliverable. 750 frames = 25s: room 0-370, figures 370-530,
        thesis and title 530-750. 1080p because it is meant to be watched, not
        diffed. */}
    <Composition
      id="ColdOpen"
      component={ColdOpen}
      durationInFrames={750}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* The instrument. Renders every motion token side by side so a curve can be
        compared against the page rather than described. Kept registered: it is
        how the tokens above get checked when they change. */}
    <Composition
      id="TokenProbe"
      component={TokenProbe}
      durationInFrames={150}
      fps={30}
      width={1280}
      height={900}
    />
  </>
);
