/**
 * OpenAI strict JSON Schema for vocabulary learning content.
 * additionalProperties: false is required for structured outputs.
 */
export const vocabularyLearningContentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "word",
    "normalizedWord",
    "partOfSpeech",
    "pronunciation",
    "definitions",
    "etymology",
    "memoryHook",
    "synonyms",
    "antonyms",
    "exampleSentences",
    "wordFamily",
    "usageNotes",
    "confusedWith",
  ],
  properties: {
    word: { type: "string" },
    normalizedWord: { type: "string" },
    partOfSpeech: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 6,
    },
    pronunciation: {
      type: "object",
      additionalProperties: false,
      required: ["ipa", "simple", "confidence"],
      properties: {
        ipa: { type: ["string", "null"] },
        simple: { type: ["string", "null"] },
        confidence: {
          type: ["string", "null"],
          enum: ["high", "medium", "low", null],
        },
      },
    },
    definitions: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "sense", "isPrimary"],
        properties: {
          text: { type: "string" },
          sense: { type: ["string", "null"] },
          isPrimary: { type: "boolean" },
        },
      },
    },
    etymology: {
      type: "object",
      additionalProperties: false,
      required: [
        "summary",
        "isUsefulForRootLearning",
        "uncertaintyNote",
        "components",
      ],
      properties: {
        summary: { type: "string" },
        isUsefulForRootLearning: { type: "boolean" },
        uncertaintyNote: { type: ["string", "null"] },
        components: {
          type: "array",
          maxItems: 8,
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "text",
              "type",
              "origin",
              "meaning",
              "explanation",
              "relatedWords",
              "confidence",
            ],
            properties: {
              text: { type: "string" },
              type: {
                type: "string",
                enum: ["prefix", "root", "stem", "suffix", "other"],
              },
              origin: { type: ["string", "null"] },
              meaning: { type: "string" },
              explanation: { type: "string" },
              relatedWords: {
                type: "array",
                items: { type: "string" },
                maxItems: 12,
              },
              confidence: {
                type: "string",
                enum: ["high", "medium", "low"],
              },
            },
          },
        },
      },
    },
    memoryHook: {
      type: "object",
      additionalProperties: false,
      required: ["text", "type"],
      properties: {
        text: { type: "string" },
        type: {
          type: "string",
          enum: ["visual", "sound", "story", "wordplay", "other"],
        },
      },
    },
    synonyms: {
      type: "array",
      minItems: 1,
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["word", "note"],
        properties: {
          word: { type: "string" },
          note: { type: ["string", "null"] },
        },
      },
    },
    antonyms: {
      type: "array",
      items: { type: "string" },
      maxItems: 12,
    },
    exampleSentences: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "targetSense"],
        properties: {
          text: { type: "string" },
          targetSense: { type: ["string", "null"] },
        },
      },
    },
    wordFamily: {
      type: "array",
      items: { type: "string" },
      maxItems: 12,
    },
    usageNotes: { type: ["string", "null"] },
    confusedWith: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["word", "distinction"],
        properties: {
          word: { type: "string" },
          distinction: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;
