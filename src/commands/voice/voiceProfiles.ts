export interface VoiceProfile {
  /** Display name shown in the Discord command choices */
  name: string;
  /** Filename of the reference audio in data/voices/ (e.g. "liam.wav") */
  fileName: string;
  /** Optional transcript of the reference audio — improves cloning accuracy */
  referenceText?: string;
}

/**
 * Add your friends' voice profiles here.
 *
 * Each entry needs:
 *  - name:      The name shown in the /voice say command dropdown
 *  - fileName:  A 10-20 second audio clip in data/voices/ (WAV or MP3, mono, ≥24kHz, no background noise)
 *  - referenceText: (optional) A transcript of what they say in the clip
 *
 * Example:
 *   { name: "Liam", fileName: "liam.wav", referenceText: "Hey guys..." }
 */
export const VOICE_PROFILES: VoiceProfile[] = [
  // { name: "Liam", fileName: "liam.wav", referenceText: "Hey guys..." },
  {
    name: 'Liam', fileName: 'liam.wav', referenceText: "So, I'm convinced my cat is trying to gaslight me. This morning, I swear I heard him knocking something off the dresser, right? I walk in, and he's just sitting there, looking completely innocent, cleaning his paw like who, me? Meanwhile, a framed photo is lying face down on the floor. But the real kicker? He waited until I was halfway through making my coffee, which is already a struggle because I'm not a functional human before 9am to start aggressively rubbing against my ankles, nearly causing a catastrophic spill. I finally gave him some treats to buy silence, and he immediately stopped, ate one, and then proceeded to ignore me for the next three hours. I think I'm just his personal butler at this point. I need more caffeine."
  },
  {
    name: 'Cory', fileName: 'cory.wav', referenceText: "Shut the fuck up, nah, I lost the first game, then I went back to Gold two, now I'm in Gold one cause I won the second one"
  },
];
