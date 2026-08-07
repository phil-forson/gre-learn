import type { VocabularyLearningContent } from "@/features/vocabulary/types";

/** Seeded GRE learning content for demo/mock provider — marked as development data. */
export const SEED_CONTENT: Record<string, VocabularyLearningContent> = {
  laconic: {
    word: "Laconic",
    normalizedWord: "laconic",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "luh-KON-ik", ipa: "/ləˈkɒnɪk/", confidence: "high" },
    definitions: [
      {
        text: "using very few words; concise to the point of seeming rude or mysterious",
        isPrimary: true,
      },
    ],
    etymology: {
      summary:
        "From Lakōnikos, ‘of Laconia/Sparta,’ whose inhabitants were famed for terse speech.",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "Lacon-",
          type: "root",
          origin: "Greek",
          meaning: "Sparta/Laconia",
          explanation: "Refers to the region whose people spoke sparingly.",
          relatedWords: ["laconicism"],
          confidence: "high",
        },
      ],
    },
    memoryHook: {
      text: "A Spartan warrior answers a long question with one clipped word — laconic.",
      type: "story",
    },
    synonyms: [
      { word: "terse" },
      { word: "succinct" },
      { word: "curt", note: "more brusque" },
    ],
    antonyms: ["verbose", "loquacious"],
    exampleSentences: [
      {
        text: "Her laconic reply — “No.” — ended the negotiation instantly.",
      },
    ],
    wordFamily: ["laconicism", "laconically"],
    usageNotes: "Often implies deliberate brevity with an edge of coolness.",
    confusedWith: [
      {
        word: "pithy",
        distinction: "Pithy emphasizes substance in few words; laconic emphasizes scarcity of words.",
      },
    ],
  },
  obdurate: {
    word: "Obdurate",
    normalizedWord: "obdurate",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "OB-duh-rut", ipa: "/ˈɒbdjʊrət/", confidence: "high" },
    definitions: [
      {
        text: "stubbornly refusing to change one's opinion or course of action; hardened against persuasion",
        isPrimary: true,
      },
    ],
    etymology: {
      summary: "From Latin obdurare ‘to harden,’ from ob- + durare ‘to harden/last.’",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "ob-",
          type: "prefix",
          origin: "Latin",
          meaning: "against / completely",
          explanation: "Intensifying prefix in many Latin derivatives.",
          relatedWords: ["object", "obstruct"],
          confidence: "medium",
        },
        {
          text: "dur",
          type: "root",
          origin: "Latin durare",
          meaning: "hard / last",
          explanation: "Same root as durable and endure.",
          relatedWords: ["durable", "endure", "duration"],
          confidence: "high",
        },
      ],
    },
    memoryHook: {
      text: "Imagine a hard iron door (dura) that stays shut no matter how you knock — obdurate.",
      type: "visual",
    },
    synonyms: [
      { word: "stubborn" },
      { word: "unyielding" },
      { word: "intransigent" },
    ],
    antonyms: ["compliant", "tractable"],
    exampleSentences: [
      {
        text: "Despite hours of negotiation, the obdurate official refused to reconsider the decision.",
      },
    ],
    wordFamily: ["obduracy", "obdurately"],
    usageNotes: "Often moral or emotional hardening, not merely practical firmness.",
    confusedWith: [
      {
        word: "obstinate",
        distinction: "Very close; obdurate can feel more severe or morally hardened.",
      },
    ],
  },
  pellucid: {
    word: "Pellucid",
    normalizedWord: "pellucid",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "puh-LOO-sid", confidence: "high" },
    definitions: [
      {
        text: "transparently clear in style or meaning; allowing maximum passage of light",
        isPrimary: true,
      },
    ],
    etymology: {
      summary: "From Latin pellucidus, from per- ‘through’ + lucidus ‘clear, bright’ (lux, light).",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "per-/pel-",
          type: "prefix",
          origin: "Latin",
          meaning: "through",
          explanation: "Assimilation before l yields pel-.",
          relatedWords: ["pervade", "perfect"],
          confidence: "high",
        },
        {
          text: "lucid",
          type: "root",
          origin: "Latin lux/lucidus",
          meaning: "light / clear",
          explanation: "Shared with lucid and translucent.",
          relatedWords: ["lucid", "translucent", "elucidate"],
          confidence: "high",
        },
      ],
    },
    memoryHook: {
      text: "A pool so clear you can see pebbles through it — pellucid prose feels the same.",
      type: "visual",
    },
    synonyms: [{ word: "limpid" }, { word: "transparent" }, { word: "lucid" }],
    antonyms: ["opaque", "murky"],
    exampleSentences: [
      {
        text: "The essay’s pellucid argument made a difficult theory feel obvious.",
      },
    ],
    wordFamily: ["pellucidity"],
    usageNotes: "Common in literary or critical prose about clarity.",
    confusedWith: [
      {
        word: "lucid",
        distinction: "Lucid is broader; pellucid often stresses crystalline clarity.",
      },
    ],
  },
  parsimonious: {
    word: "Parsimonious",
    normalizedWord: "parsimonious",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "par-suh-MOH-nee-us", confidence: "high" },
    definitions: [
      {
        text: "unwilling to spend money or use resources; stingy or excessively frugal",
        isPrimary: true,
      },
    ],
    etymology: {
      summary:
        "From Latin parsimonia ‘frugality,’ related to parcere ‘to spare.’ Not a modern root cut of ‘parsi + monious’ invented folk etymology.",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "parsi-",
          type: "stem",
          origin: "Latin parcere/parsimonia",
          meaning: "to spare / thrift",
          explanation: "Historical stem of thrift, not ‘partial money’.",
          relatedWords: ["parsimony"],
          confidence: "high",
        },
      ],
    },
    memoryHook: {
      text: "A person who parses every penny — parsimonious with cash.",
      type: "wordplay",
    },
    synonyms: [{ word: "stingy" }, { word: "miserly" }, { word: "frugal", note: "frugal can be neutral" }],
    antonyms: ["generous", "extravagant"],
    exampleSentences: [
      {
        text: "The foundation’s parsimonious budget left little room for experimental art.",
      },
    ],
    wordFamily: ["parsimony", "parsimoniously"],
    usageNotes: "On GRE, usually pejorative stinginess rather than wise thrift.",
    confusedWith: [
      {
        word: "frugal",
        distinction: "Frugal can be prudent; parsimonious implies too little spending.",
      },
    ],
  },
  intransigent: {
    word: "Intransigent",
    normalizedWord: "intransigent",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "in-TRAN-suh-junt", confidence: "high" },
    definitions: [
      {
        text: "unwilling to change one's views or to agree; uncompromising",
        isPrimary: true,
      },
    ],
    etymology: {
      summary:
        "From Spanish intransigente, ultimately Latin in- ‘not’ + transigere ‘to come to an agreement.’",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "in-",
          type: "prefix",
          origin: "Latin",
          meaning: "not",
          explanation: "Negating prefix.",
          relatedWords: ["inactive", "incomplete"],
          confidence: "high",
        },
        {
          text: "transig-",
          type: "root",
          origin: "Latin transigere",
          meaning: "to settle / come to terms",
          explanation: "Related to compromise/settlement sense.",
          relatedWords: ["transaction"],
          confidence: "medium",
        },
      ],
    },
    memoryHook: {
      text: "In transit? No deal. The negotiator stays stuck — intransigent.",
      type: "wordplay",
    },
    synonyms: [{ word: "uncompromising" }, { word: "obdurate" }, { word: "inflexible" }],
    antonyms: ["amenable", "yielding"],
    exampleSentences: [
      {
        text: "Both parties remained intransigent, and the treaty talks collapsed.",
      },
    ],
    wordFamily: ["intransigence"],
    usageNotes: "Frequent in political and negotiation contexts.",
    confusedWith: [],
  },
  equivocate: {
    word: "Equivocate",
    normalizedWord: "equivocate",
    partOfSpeech: ["verb"],
    pronunciation: { simple: "ih-KWIV-uh-kayt", confidence: "high" },
    definitions: [
      {
        text: "to use ambiguous language so as to conceal the truth or avoid committing oneself",
        isPrimary: true,
      },
    ],
    etymology: {
      summary: "From Latin aequivocus ‘of equal voice,’ equi- ‘equal’ + vox ‘voice.’",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "equi-",
          type: "prefix",
          origin: "Latin",
          meaning: "equal",
          explanation: "Same prefix as equal, equidistant.",
          relatedWords: ["equal", "equanimity"],
          confidence: "high",
        },
        {
          text: "voc",
          type: "root",
          origin: "Latin vox/vocare",
          meaning: "voice / call",
          explanation: "Shared with vocal and advocate.",
          relatedWords: ["vocal", "advocate", "vocation"],
          confidence: "high",
        },
      ],
    },
    memoryHook: {
      text: "Equal voices saying opposite things at once — you equivocate to dodge commitment.",
      type: "visual",
    },
    synonyms: [{ word: "prevaricate" }, { word: "hedge" }, { word: "waffle" }],
    antonyms: ["clarify", "speak plainly"],
    exampleSentences: [
      {
        text: "When asked about layoffs, the CEO began to equivocate instead of answering.",
      },
    ],
    wordFamily: ["equivocation", "equivocal"],
    usageNotes: "Implies deliberate ambiguity, not mere confusion.",
    confusedWith: [
      {
        word: "ambivalent",
        distinction: "Ambivalent is mixed feelings; equivocate is double-speak.",
      },
    ],
  },
  magnanimous: {
    word: "Magnanimous",
    normalizedWord: "magnanimous",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "mag-NAN-uh-mus", confidence: "high" },
    definitions: [
      {
        text: "generous or forgiving, especially toward a rival or less powerful person; lofty in spirit",
        isPrimary: true,
      },
    ],
    etymology: {
      summary: "From Latin magnanimus: magnus ‘great’ + animus ‘spirit/mind.’",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "magn-",
          type: "root",
          origin: "Latin magnus",
          meaning: "great",
          explanation: "Also in magnify, magnitude.",
          relatedWords: ["magnify", "magnitude"],
          confidence: "high",
        },
        {
          text: "anim",
          type: "root",
          origin: "Latin animus",
          meaning: "spirit / mind",
          explanation: "Also in unanimous, animate.",
          relatedWords: ["unanimous", "animosity", "animate"],
          confidence: "high",
        },
      ],
    },
    memoryHook: {
      text: "A great spirit (magna-animus) that forgives the loser with grace.",
      type: "story",
    },
    synonyms: [{ word: "generous" }, { word: "charitable" }, { word: "bighearted" }],
    antonyms: ["petty", "vindictive"],
    exampleSentences: [
      {
        text: "The champion was magnanimous in victory, praising her opponent’s skill.",
      },
    ],
    wordFamily: ["magnanimity", "magnanimously"],
    usageNotes: null,
    confusedWith: [],
  },
  prosaic: {
    word: "Prosaic",
    normalizedWord: "prosaic",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "proh-ZAY-ik", confidence: "high" },
    definitions: [
      {
        text: "lacking poetic beauty; commonplace or unromantic; dull",
        isPrimary: true,
      },
    ],
    etymology: {
      summary:
        "From Latin prosa ‘straightforward discourse’ (prose), not a decomposition into pro- + saic folk parts.",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "pros(a)",
          type: "root",
          origin: "Latin prosa",
          meaning: "prose / plain speech",
          explanation: "Contrasts with verse; thus ‘prosy’ or ordinary.",
          relatedWords: ["prose"],
          confidence: "high",
        },
      ],
    },
    memoryHook: {
      text: "Prose, not poetry — a prosaic laundry list instead of a lyric.",
      type: "sound",
    },
    synonyms: [{ word: "mundane" }, { word: "ordinary" }, { word: "humdrum" }],
    antonyms: ["poetic", "imaginative"],
    exampleSentences: [
      {
        text: "After the fireworks of theory, the report turned prosaic — budgets and timelines.",
      },
    ],
    wordFamily: ["prosaically"],
    usageNotes: "Can be neutral (as opposed to verse) or mildly critical (dull).",
    confusedWith: [],
  },
  recalcitrant: {
    word: "Recalcitrant",
    normalizedWord: "recalcitrant",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "rih-KAL-sih-trunt", confidence: "high" },
    definitions: [
      {
        text: "having an obstinately uncooperative attitude toward authority or discipline",
        isPrimary: true,
      },
    ],
    etymology: {
      summary: "From Latin recalcitrare ‘to kick back,’ re- + calx ‘heel.’",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "re-",
          type: "prefix",
          origin: "Latin",
          meaning: "back / again",
          explanation: "Directional back.",
          relatedWords: ["return", "reject"],
          confidence: "high",
        },
        {
          text: "calc-",
          type: "root",
          origin: "Latin calx",
          meaning: "heel",
          explanation: "Kicking with the heel; image of a stubborn animal.",
          relatedWords: ["inculcate"],
          confidence: "medium",
        },
      ],
    },
    memoryHook: {
      text: "A mule that kicks back with its heels at every command — recalcitrant.",
      type: "visual",
    },
    synonyms: [{ word: "defiant" }, { word: "unruly" }, { word: "intractable" }],
    antonyms: ["obedient", "compliant"],
    exampleSentences: [
      {
        text: "The recalcitrant committee ignored every deadline set by the board.",
      },
    ],
    wordFamily: ["recalcitrance"],
    usageNotes: null,
    confusedWith: [],
  },
  sagacious: {
    word: "Sagacious",
    normalizedWord: "sagacious",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "suh-GAY-shus", confidence: "high" },
    definitions: [
      {
        text: "having or showing keen mental discernment and good judgment; shrewd",
        isPrimary: true,
      },
    ],
    etymology: {
      summary: "From Latin sagax ‘wise, keen of scent,’ related to seeking/perceiving.",
      isUsefulForRootLearning: false,
      uncertaintyNote:
        "Further morphological splits of ‘sag-’ into modern GRE roots are not especially productive.",
      components: [],
    },
    memoryHook: {
      text: "A sage with keen eyes — sagacious counsel cuts through fog.",
      type: "sound",
    },
    synonyms: [{ word: "astute" }, { word: "shrewd" }, { word: "perceptive" }],
    antonyms: ["foolish", "obtuse"],
    exampleSentences: [
      {
        text: "Investors praised her sagacious decision to exit before the bubble burst.",
      },
    ],
    wordFamily: ["sagacity", "sagaciously"],
    usageNotes: "Elevated register; more formal than ‘smart.’",
    confusedWith: [
      {
        word: "sapient",
        distinction: "Both mean wise; sagacious stresses practical shrewdness.",
      },
    ],
  },
  enervate: {
    word: "Enervate",
    normalizedWord: "enervate",
    partOfSpeech: ["verb"],
    pronunciation: { simple: "EN-er-vayt", confidence: "high" },
    definitions: [
      {
        text: "to cause to feel drained of energy or vitality; weaken",
        isPrimary: true,
      },
    ],
    etymology: {
      summary:
        "From Latin enervare ‘to weaken,’ e- ‘out of’ + nervus ‘sinew/nerve.’ Not ‘energize.’",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "e-/ex-",
          type: "prefix",
          origin: "Latin",
          meaning: "out of",
          explanation: "Removal prefix.",
          relatedWords: ["emit", "eject"],
          confidence: "high",
        },
        {
          text: "nerv",
          type: "root",
          origin: "Latin nervus",
          meaning: "sinew / nerve / vigor",
          explanation: "Removing sinew = weakening; contrasts with ‘energy.’",
          relatedWords: ["nerve", "nervous"],
          confidence: "high",
        },
      ],
    },
    memoryHook: {
      text: "Do not confuse with energize — enervate pulls the nerves out, leaving you limp.",
      type: "wordplay",
    },
    synonyms: [{ word: "weaken" }, { word: "debilitate" }, { word: "sap" }],
    antonyms: ["invigorate", "fortify"],
    exampleSentences: [
      {
        text: "The humid heat enervated the hikers long before noon.",
      },
    ],
    wordFamily: ["enervating", "enervation"],
    usageNotes: "Classic GRE trap: sounds like energize but means the opposite.",
    confusedWith: [
      {
        word: "energize",
        distinction: "Opposite meaning — a frequent GRE confusable pair.",
      },
    ],
  },
  ephemeral: {
    word: "Ephemeral",
    normalizedWord: "ephemeral",
    partOfSpeech: ["adjective"],
    pronunciation: { simple: "ih-FEM-er-ul", confidence: "high" },
    definitions: [
      {
        text: "lasting for a very short time",
        isPrimary: true,
      },
    ],
    etymology: {
      summary: "From Greek ephēmeros ‘lasting a day,’ epi- ‘on’ + hēmera ‘day.’",
      isUsefulForRootLearning: true,
      components: [
        {
          text: "epi-",
          type: "prefix",
          origin: "Greek",
          meaning: "upon / on",
          explanation: "Common Greek prefix.",
          relatedWords: ["epidermis", "epicenter"],
          confidence: "high",
        },
        {
          text: "hemer-",
          type: "root",
          origin: "Greek hēmera",
          meaning: "day",
          explanation: "A day-long thing; thus fleeting.",
          relatedWords: ["hemeralopia"],
          confidence: "medium",
        },
      ],
    },
    memoryHook: {
      text: "A mayfly’s day-long life — ephemeral beauty that vanishes by dusk.",
      type: "visual",
    },
    synonyms: [{ word: "fleeting" }, { word: "transitory" }, { word: "evanescent" }],
    antonyms: ["permanent", "enduring"],
    exampleSentences: [
      {
        text: "Fame on social media can be painfully ephemeral.",
      },
    ],
    wordFamily: ["ephemerality", "ephemera"],
    usageNotes: null,
    confusedWith: [],
  },
};
