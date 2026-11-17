import { safeUrl, type FollowerNetwork, type Followers } from "./document";

export const followerNetworks: ReadonlyArray<
  readonly [FollowerNetwork, string, readonly string[]]
> = [
  ["instagram", "Instagram", ["instagram.com"]],
  ["tiktok", "TikTok", ["tiktok.com"]],
  ["x", "X (Twitter)", ["x.com", "twitter.com"]],
  ["youtube", "YouTube", ["youtube.com"]],
  ["facebook", "Facebook", ["facebook.com"]],
];

export function followerUrl(url: string, domains: readonly string[]) {
  const parsed = safeUrl(url);
  if (!parsed) return "";
  const host = new URL(parsed).hostname;
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`))
    ? parsed
    : "";
}

export function validFollowerCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= 1_000_000_000
  );
}

export function followerTotal(followers?: Followers) {
  let total = 0;
  let hasCount = false;
  for (const [key, , domains] of followerNetworks) {
    const profile = followers?.profiles?.[key];
    if (
      profile &&
      typeof profile.url === "string" &&
      followerUrl(profile.url, domains) &&
      validFollowerCount(profile.count)
    ) {
      total += profile.count;
      hasCount = true;
    }
  }
  return hasCount ? total : null;
}
