// Rewarded-ad interface for future TallSkill Coin earning. No ad SDK is integrated.
// A provider must implement: { name, isAvailable(): Promise<boolean>, show(placement): Promise<{ rewardToken }> }.
// Coins are only ever credited by the backend after server-side verification.
import { FEATURES } from '../config/tallskill';
import { getNativeBridge } from './platform';

let provider = null;

export function registerRewardedAdProvider(p) {
  provider = p;
}

export async function isRewardedAdAvailable() {
  if (!FEATURES.rewardedAds || !provider) return false;
  return provider.isAvailable();
}

export async function showRewardedAd(placement) {
  if (!FEATURES.rewardedAds || !provider) {
    throw new Error('Rewarded ads are not available yet.');
  }
  return provider.show(placement);
}

/** Adapter for a future Android bridge exposing `TallSkillNative.rewardedAds`. */
export function nativeBridgeProvider() {
  const ads = getNativeBridge()?.rewardedAds;
  if (!ads) return null;
  return {
    name: 'android-native',
    isAvailable: () => Promise.resolve(Boolean(ads.isAvailable?.())),
    show: (placement) => ads.show(placement),
  };
}
