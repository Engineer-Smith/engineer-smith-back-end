// =====================================================
// src/hooks/questionCreation/useCodeConfig.ts - Hook for Code Configuration
// =====================================================

import { useCallback, useMemo } from 'react';
import { 
  CodeConfigManager, 
  formatRuntimeForDisplay, 
  getRecommendedTimeout,
  type RuntimeEnvironment,
  type CodeConfigValidation,
  type FunctionSignature
} from '../../utils/codeConfiguration';
import type { Language, QuestionCategory, CodeConfig } from '../../types';

export interface UseCodeConfigReturn {
  // Runtime management
  getAvailableRuntimes: () => RuntimeEnvironment[];
  getDefaultRuntime: () => string;
  formatRuntimeDisplay: (runtime: RuntimeEnvironment) => string;
  
  // Configuration creation and validation
  createDefaultCodeConfig: () => CodeConfig;
  validateCodeConfig: (config: CodeConfig) => CodeConfigValidation;
  
  // Function signatures and recommendations
  getFunctionSignatures: () => FunctionSignature[];
  getPerformanceRecommendations: () => string[];
  getSecurityRecommendations: () => string[];
  
  // Timeout and limits
  getRecommendedTimeoutForLanguage: () => number;
  
  // Computed properties
  requiresRuntime: boolean;
  hasRuntimeOptions: boolean;
  defaultConfig: CodeConfig;
}

/**
 * ✅ HOOK: Code configuration management for question creation
 */
export const useCodeConfig = (
  language: Language, 
  category: QuestionCategory
): UseCodeConfigReturn => {

  // ✅ MEMOIZED: Available runtimes for the current language
  const availableRuntimes = useMemo(() => {
    return CodeConfigManager.getRuntimeEnvironments(language);
  }, [language]);

  // ✅ MEMOIZED: Default configuration for language/category
  const defaultConfig = useMemo(() => {
    return CodeConfigManager.createDefaultConfig(language, category);
  }, [language, category]);

  // ✅ COMPUTED: Whether this language/category requires runtime execution
  const requiresRuntime = useMemo(() => {
    // Logic questions need runtime for test execution
    if (category === 'logic') return true;
    
    // UI and syntax questions typically don't need runtime
    return false;
  }, [category]);

  // ✅ COMPUTED: Whether there are runtime options available
  const hasRuntimeOptions = useMemo(() => {
    return availableRuntimes.length > 0;
  }, [availableRuntimes]);

  // ✅ CALLBACK: Get available runtimes
  const getAvailableRuntimes = useCallback(() => {
    return availableRuntimes;
  }, [availableRuntimes]);

  // ✅ CALLBACK: Get default runtime ID
  const getDefaultRuntime = useCallback(() => {
    return availableRuntimes.length > 0 ? availableRuntimes[0].id : '';
  }, [availableRuntimes]);

  // ✅ CALLBACK: Format runtime for display
  const formatRuntimeDisplay = useCallback((runtime: RuntimeEnvironment) => {
    return formatRuntimeForDisplay(runtime);
  }, []);

  // ✅ CALLBACK: Create default code configuration
  const createDefaultCodeConfig = useCallback(() => {
    return defaultConfig;
  }, [defaultConfig]);

  // ✅ CALLBACK: Validate code configuration
  const validateCodeConfig = useCallback((config: CodeConfig) => {
    return CodeConfigManager.validateCodeConfig(config, language, category);
  }, [language, category]);

  // ✅ CALLBACK: Get function signatures for language
  const getFunctionSignatures = useCallback(() => {
    return CodeConfigManager.getFunctionSignatures(language);
  }, [language]);

  // ✅ CALLBACK: Get performance recommendations
  const getPerformanceRecommendations = useCallback(() => {
    return CodeConfigManager.getPerformanceRecommendations(language);
  }, [language]);

  // ✅ CALLBACK: Get security recommendations
  const getSecurityRecommendations = useCallback(() => {
    return CodeConfigManager.getSecurityRecommendations(language);
  }, [language]);

  // ✅ CALLBACK: Get recommended timeout for language
  const getRecommendedTimeoutForLanguage = useCallback(() => {
    return getRecommendedTimeout(language);
  }, [language]);

  return {
    // Runtime management
    getAvailableRuntimes,
    getDefaultRuntime,
    formatRuntimeDisplay,
    
    // Configuration creation and validation
    createDefaultCodeConfig,
    validateCodeConfig,
    
    // Function signatures and recommendations
    getFunctionSignatures,
    getPerformanceRecommendations,
    getSecurityRecommendations,
    
    // Timeout and limits
    getRecommendedTimeoutForLanguage,
    
    // Computed properties
    requiresRuntime,
    hasRuntimeOptions,
    defaultConfig
  };
};