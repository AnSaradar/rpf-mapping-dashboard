const DATA_URL = "/data/jobar_cleaned_final.txt";
const SOCIAL_DATA_URL = "/data/Social_data_on_damascus.txt";
const CHUNK_SEPARATOR = /\r?\n-----------------------------\r?\n/;

const SOCIAL_FACTOR_PATTERNS = [
  /social\s*factor/i,
  /social\s+(aspect|impact|challenges|issues|structure|fabric)/i,
  /العامل\s*الاجتماع/i,
  /العوامل\s*الاجتماع/i,
  /الجانب\s*الاجتماع/i,
  /الوضع\s*الاجتماع/i,
  /الهيكل\s*الاجتماع/i,
  /النسيج\s*الاجتماع/i,
  /التفاعل\s*المجتمع/i,
  /العوامل\s*الاجتماعية/i,
];

const URBAN_PLANNING_PATTERNS = [
  /urban\s*planning/i,
  /design\s*participation/i,
  /community\s*participation/i,
  /building\s*code/i,
  /land\s*use/i,
  /التخطيط\s*الحضري/i,
  /المشاركة\s*التصميمية/i,
  /المشاركة\s*المجتم/i,
  /المشاركة\s*في\s*التخطيط/i,
  /ضعف\s*المشاركة/i,
  /استخدام\s*الأراض/i,
  /قوانين\s*البناء/i,
  /مد\s*البناء/i,
];

const DAMASCUS_DARAYA_PATTERNS = [
  /damascus/i,
  /دمشق/i,
  /darya/i,
  /daraya/i,
  /داريا/i,
];

let cachedChunks: string[] | null = null;
let cachedSocialData: string | null = null;

async function loadChunks(): Promise<string[]> {
  if (cachedChunks) return cachedChunks;

  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load Jobar data (${response.status})`);
  }

  const text = await response.text();
  cachedChunks = text
    .split(CHUNK_SEPARATOR)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (cachedChunks.length === 0) {
    throw new Error("Jobar data file is empty or has no valid chunks");
  }

  return cachedChunks;
}

function pickRandomIndices(total: number, count: number): number[] {
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, Math.min(count, total));
}

export async function getRandomChunks(count = 3): Promise<string[]> {
  const chunks = await loadChunks();
  const indices = pickRandomIndices(chunks.length, count);
  return indices.map((i) => chunks[i]);
}

export function shouldLoadDamascusContext(message: string): boolean {
  const mentionsLocation = DAMASCUS_DARAYA_PATTERNS.some((pattern) =>
    pattern.test(message),
  );
  const mentionsSocialFactor = SOCIAL_FACTOR_PATTERNS.some((pattern) =>
    pattern.test(message),
  );
  const mentionsUrbanPlanning = URBAN_PLANNING_PATTERNS.some((pattern) =>
    pattern.test(message),
  );

  if (mentionsUrbanPlanning) return true;
  if (mentionsSocialFactor && mentionsLocation) return true;

  return false;
}

/** @deprecated Use shouldLoadDamascusContext */
export function isSocialDamascusOrDarayaQuery(message: string): boolean {
  return shouldLoadDamascusContext(message);
}

export async function getSocialDamascusContext(): Promise<string> {
  if (cachedSocialData) return cachedSocialData;

  const response = await fetch(SOCIAL_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load Damascus social data (${response.status})`);
  }

  const text = (await response.text()).trim();
  if (!text) {
    throw new Error("Damascus social data file is empty");
  }

  cachedSocialData = text;
  return cachedSocialData;
}
