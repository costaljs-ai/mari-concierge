/**
 * Local terpene reference. Tapping a terpene chip shows this
 * instantly — no AI call, no waiting.
 */
export type Terpene = {
  name: string;
  aroma: string;
  simple: string; // plain language, for first-timers
  deeper: string; // for experienced guests
  tone: "fjord" | "sage" | "sand";
};

export const TERPENES: Record<string, Terpene> = {
  myrcene: {
    name: "Myrcene",
    aroma: "Earthy, musky, ripe mango",
    simple: "The 'couch' terpene. Often linked with feeling relaxed, heavy and sleepy — great for evenings.",
    deeper: "Most abundant terpene in modern cultivars. Associated with sedative, body-forward effects; above ~0.5% it often reads as 'indica-like' regardless of label.",
    tone: "fjord",
  },
  limonene: {
    name: "Limonene",
    aroma: "Bright citrus peel",
    simple: "The 'sunny' terpene. Often linked with a lifted, cheerful mood and less stress.",
    deeper: "Associated with mood elevation and anxiolytic effects in preclinical work. Pairs with caryophyllene for a calm-but-upbeat profile.",
    tone: "sand",
  },
  caryophyllene: {
    name: "Caryophyllene",
    aroma: "Black pepper, clove, spice",
    simple: "A calming, body-soothing terpene. Many people reach for it for aches and tension.",
    deeper: "Beta-caryophyllene binds CB2 receptors directly — the only common terpene that acts as a cannabinoid. Linked to anti-inflammatory effects.",
    tone: "sage",
  },
  linalool: {
    name: "Linalool",
    aroma: "Lavender, floral",
    simple: "The lavender terpene. Often linked with calm, easing worry, and winding down.",
    deeper: "Associated with anxiolytic and sedative effects; can soften the edge of high-THC products. Often a minor terpene, so even 0.1–0.3% is meaningful.",
    tone: "fjord",
  },
  pinene: {
    name: "Pinene",
    aroma: "Fresh pine forest",
    simple: "The 'clear head' terpene. Often linked with alertness and feeling focused.",
    deeper: "Alpha-pinene is an acetylcholinesterase inhibitor in vitro and is anecdotally linked to reduced THC-related short-term memory fog.",
    tone: "sage",
  },
  terpinolene: {
    name: "Terpinolene",
    aroma: "Fresh, herbal, a little floral and fruity",
    simple: "An energizing, creative terpene. Common in upbeat daytime strains.",
    deeper: "Dominant in many 'sativa'-type cultivars (Jack Herer, Durban lineage). Uplifting, sometimes racy for anxiety-prone users.",
    tone: "sand",
  },
  humulene: {
    name: "Humulene",
    aroma: "Hops, woody, earthy",
    simple: "An earthy terpene found in hops. Often described as grounding and appetite-calming.",
    deeper: "Co-occurs with caryophyllene. Studied for anti-inflammatory properties; anecdotally appetite-suppressing.",
    tone: "sage",
  },
  ocimene: {
    name: "Ocimene",
    aroma: "Sweet, herbal, tropical",
    simple: "A sweet, bright terpene often found in uplifting strains.",
    deeper: "Volatile, light terpene; contributes to uplifting, 'airy' profiles. Rarely dominant.",
    tone: "sand",
  },
  bisabolol: {
    name: "Bisabolol",
    aroma: "Chamomile, soft floral",
    simple: "The chamomile terpene. Gentle and soothing.",
    deeper: "Alpha-bisabolol is studied for skin-soothing and anti-irritant effects; adds a soft, calming note.",
    tone: "fjord",
  },
};

export function findTerpene(label: string): Terpene | undefined {
  const key = label
    .toLowerCase()
    .replace(/^(beta|b|alpha|a|β|α)[-\s]*/, "")
    .replace(/[^a-z]/g, "");
  return TERPENES[key];
}
