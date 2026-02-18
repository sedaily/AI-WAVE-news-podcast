import { useMemo } from 'react';
import type { EconomyPodcast } from './useEconomyNews';
import { sortPodcastsByPersonalization } from '../utils/podcastSorter';
import { getUserInterests } from '../utils/interestPreferences';

export function usePersonalizedPodcasts(podcasts: EconomyPodcast[]) {
  const sortedPodcasts = useMemo(() => {
    return sortPodcastsByPersonalization(podcasts);
  }, [podcasts]);

  const userInterests = useMemo(() => {
    return getUserInterests();
  }, []);

  const hasPersonalization = userInterests.categories.length > 0;

  return {
    podcasts: sortedPodcasts,
    hasPersonalization,
    interestCount: userInterests.categories.length
  };
}
