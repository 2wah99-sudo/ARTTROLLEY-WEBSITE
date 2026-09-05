import { PoemAnimation } from '@/components/ui/3d-animation'

// Unlisted preview route for the PoemAnimation component — not linked from
// nav, not part of the site's page flow. Visit directly at /lab/3d-animation.

const ANIMATION_DATA = {
  poemHTML: `
        <p>The <span>love</span> between Ayla and Leo ignited in the old courtyard, each morning their swords clashed under dawn's glow, faces streaked with <span>dust</span> and sweat; they <span>danced</span> between parries, every laugh a spark of joy against uncertain hearts. She stepped forward with <span>courage</span>, he met her gaze with open warmth, two souls seeking a shared <span>triumph</span> in their vulnerability. When blades slipped and one <span>faltered</span>, the other caught them—forearms brushing, pulses aligned in a daring heartbeat. In failure they found grace; in triumph they discovered unity. Each moment spent <span>daring</span> to trust the other built a bond impervious to fear. At dusk, they sheathed their swords, stepping from the <span>arena</span> hand in hand, knowing love blooms not through perfection, but by <span>daring greatly</span> together.</p>
`,
  backgroundImageUrl:
    'https://cdn.21st.dev/assets/mirror/7c/7cb8f3c46e2fedba57c13eaffd4a9dba0cf070b93190982934a3bb251badefe4.jpg',
  boyImageUrl:
    'https://cdn.21st.dev/assets/mirror/14/146f5061f7c384fbff0ab8a5623c755228729d8ea6b2df0aa3e243f6a191a357.png',
}

export default function ThreeDAnimationLabPage() {
  return (
    <PoemAnimation
      poemHTML={ANIMATION_DATA.poemHTML}
      backgroundImageUrl={ANIMATION_DATA.backgroundImageUrl}
      boyImageUrl={ANIMATION_DATA.boyImageUrl}
    />
  )
}
