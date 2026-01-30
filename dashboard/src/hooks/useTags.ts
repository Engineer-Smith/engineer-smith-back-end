// PART 2: Fixed useTags hook (complete replacement for useTags.ts)

import { useState, useEffect } from 'react';
import apiService from '../services/ApiService';
import type { Language } from '../types';

export interface TagMetadata {
  label: string;
  description: string;
  color?: string;
}

export interface UseTagsOptions {
  languages?: Language[];
  autoFetch?: boolean;
}

export interface UseTagsResult {
  tags: string[];
  tagsByLanguage: Record<string, string[]>;
  tagMetadata: Record<string, TagMetadata>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Simple tags hook - uses ApiService directly
 */
export const useTags = (options: UseTagsOptions = {}): UseTagsResult => {
  const { languages, autoFetch = true } = options;

  const [tags, setTags] = useState<string[]>([]);
  const [tagsByLanguage, setTagsByLanguage] = useState<Record<string, string[]>>({});
  const [tagMetadata, setTagMetadata] = useState<Record<string, TagMetadata>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getTags(languages);

      if (response.error) {
        // Check if it's a 404 - endpoint doesn't exist, use fallback
        if (response.message?.includes('404') || response.message?.includes('Not Found')) {
          console.warn('Tags endpoint not available, using empty tags');
          setTags([]);
          setTagsByLanguage({});
          setTagMetadata({});
          return;
        }
        throw new Error(response.message || 'Failed to fetch tags');
      }

      // Access the data property from API response
      const data = response.data;

      // Add null check for data
      if (!data) {
        setTags([]);
        setTagsByLanguage({});
        setTagMetadata({});
        return;
      }

      if ('allTags' in data) {
        // Full response - no language filter
        setTags(data.allTags);
        setTagsByLanguage(data.tagsByLanguage);
        setTagMetadata(data.tagMetadata);
      } else if ('applicableTags' in data) {
        // Filtered response - specific languages
        setTags(data.applicableTags);
        setTagMetadata(data.tagMetadata);
        // Clear tagsByLanguage for filtered responses
        setTagsByLanguage({});
      }
    } catch (err: any) {
      // Handle 404 errors gracefully - tags endpoint may not exist
      if (err?.response?.status === 404 || err?.message?.includes('404')) {
        console.warn('Tags endpoint not available (404), using empty tags');
        setTags([]);
        setTagsByLanguage({});
        setTagMetadata({});
        setError(null); // Don't show error for missing endpoint
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
      console.error('Tags fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTags();
    }
  }, [languages?.join(','), autoFetch]);

  return {
    tags,
    tagsByLanguage,
    tagMetadata,
    loading,
    error,
    refetch: fetchTags
  };
};