import { Injectable, Logger } from '@nestjs/common';

export interface ScanResult {
  safe: boolean;
  violations: string[];
}

export interface SecurityMetrics {
  totalScans: number;
  totalRejections: number;
  rejectionRate: string;
  recentViolations: Array<{
    timestamp: Date;
    language: string;
    violations: string[];
  }>;
}

// Banned patterns by language
const BANNED_PATTERNS: Record<string, RegExp[]> = {
  javascript: [
    // Infinite loops
    /while\s*\(\s*true\s*\)/,
    /for\s*\(\s*;\s*;\s*\)/,
    // Dangerous modules
    /require\s*\(\s*['"`]child_process/,
    /require\s*\(\s*['"`]fs['"`]\s*\)/,
    /require\s*\(\s*['"`]net['"`]\s*\)/,
    /require\s*\(\s*['"`]http['"`]\s*\)/,
    /require\s*\(\s*['"`]https['"`]\s*\)/,
    /require\s*\(\s*['"`]dgram['"`]\s*\)/,
    /require\s*\(\s*['"`]cluster['"`]\s*\)/,
    /require\s*\(\s*['"`]worker_threads['"`]\s*\)/,
    // ES module imports
    /import\s+.*from\s+['"`]fs['"`]/,
    /import\s+.*from\s+['"`]child_process['"`]/,
    /import\s+.*from\s+['"`]net['"`]/,
    /import\s+.*from\s+['"`]http['"`]/,
    // Process manipulation
    /process\.exit/,
    /process\.env/,
    /process\.kill/,
    /process\.binding/,
    // Code execution
    /eval\s*\(/,
    /Function\s*\(/,
    /\.exec\s*\(/,
    /\.spawn\s*\(/,
    /\.execSync/,
    /\.spawnSync/,
    // Prototype pollution
    /__proto__/,
    /constructor\s*\[/,
    /Object\.setPrototypeOf/,
  ],

  python: [
    // Infinite loops
    /while\s+True\s*:/,
    // Dangerous imports
    /import\s+os/,
    /import\s+subprocess/,
    /import\s+sys/,
    /import\s+socket/,
    /import\s+requests/,
    /import\s+urllib/,
    /import\s+shutil/,
    /import\s+pathlib/,
    /import\s+multiprocessing/,
    /import\s+threading/,
    /from\s+os\s+import/,
    /from\s+subprocess\s+import/,
    /from\s+socket\s+import/,
    // Code execution
    /exec\s*\(/,
    /eval\s*\(/,
    /compile\s*\(/,
    /__import__\s*\(/,
    // Introspection abuse
    /globals\s*\(\)/,
    /locals\s*\(\)/,
    /vars\s*\(\)/,
    /getattr\s*\(/,
    /setattr\s*\(/,
  ],

  dart: [
    // Infinite loops
    /while\s*\(\s*true\s*\)/,
    /for\s*\(\s*;\s*;\s*\)/,
    // Dangerous imports
    /import\s+['"]dart:io['"]/,
    /import\s+['"]dart:mirrors['"]/,
    /import\s+['"]dart:ffi['"]/,
    /import\s+['"]dart:isolate['"]/,
    // Operations
    /Process\./,
    /File\s*\(/,
    /Directory\s*\(/,
    /HttpClient/,
    /Socket\./,
    /Platform\./,
  ],

  sql: [
    // File operations
    /INTO\s+OUTFILE/i,
    /INTO\s+DUMPFILE/i,
    /LOAD_FILE\s*\(/i,
    /LOAD\s+DATA/i,
    // Time delays / resource abuse
    /SLEEP\s*\(/i,
    /BENCHMARK\s*\(/i,
    /WAIT\s+FOR\s+DELAY/i,
    // Locking
    /GET_LOCK\s*\(/i,
    /RELEASE_LOCK\s*\(/i,
  ],
};

// Universal patterns for all languages
const UNIVERSAL_BANNED = [
  /\.\.\/|\.\.\\/, // Path traversal
];

@Injectable()
export class CodeScannerService {
  private readonly logger = new Logger(CodeScannerService.name);

  private totalScans = 0;
  private totalRejections = 0;
  private recentViolations: Array<{
    timestamp: Date;
    language: string;
    violations: string[];
  }> = [];

  private readonly MAX_RECENT_VIOLATIONS = 50;

  /**
   * Scan code for security violations
   */
  scan(code: string, language: string): ScanResult {
    this.totalScans++;
    const violations: string[] = [];

    // Normalize language (typescript uses javascript patterns)
    const lang = language === 'typescript' ? 'javascript' : language;

    // Get patterns for this language
    const patterns = [...(BANNED_PATTERNS[lang] || []), ...UNIVERSAL_BANNED];

    for (const pattern of patterns) {
      if (pattern.test(code)) {
        violations.push(`Prohibited pattern: ${pattern.source}`);
      }
    }

    if (violations.length > 0) {
      this.totalRejections++;
      this.recentViolations.push({
        timestamp: new Date(),
        language,
        violations,
      });

      if (this.recentViolations.length > this.MAX_RECENT_VIOLATIONS) {
        this.recentViolations.shift();
      }

      this.logger.warn(
        `Security violation in ${language}: ${violations.join(', ')}`,
      );
    }

    return {
      safe: violations.length === 0,
      violations,
    };
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): SecurityMetrics {
    return {
      totalScans: this.totalScans,
      totalRejections: this.totalRejections,
      rejectionRate:
        this.totalScans > 0
          ? ((this.totalRejections / this.totalScans) * 100).toFixed(2) + '%'
          : '0%',
      recentViolations: this.recentViolations.slice(-20), // Last 20
    };
  }

  /**
   * Reset security metrics
   */
  resetMetrics(): void {
    this.totalScans = 0;
    this.totalRejections = 0;
    this.recentViolations = [];
    this.logger.log('Security metrics reset');
  }
}
