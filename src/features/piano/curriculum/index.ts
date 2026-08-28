import {
  DAILY_TEMPLATE,
  DEFAULT_FOCUS_MIX,
  PIANO_DOMAINS,
  PIANO_PHASES,
  PIANO_SKILLS_RAW,
} from "./seed";
import { finalizePianoSkills } from "./finalize-skills";

export { DAILY_TEMPLATE, DEFAULT_FOCUS_MIX, PIANO_DOMAINS, PIANO_PHASES };

export const PIANO_SKILLS = finalizePianoSkills(PIANO_SKILLS_RAW);
