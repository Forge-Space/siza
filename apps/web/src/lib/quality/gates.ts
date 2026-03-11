export interface QualityResult {
  gate: string;
  passed: boolean;
  issues: string[];
  severity: 'info' | 'warning' | 'error';
}

export interface PostGenScoreResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  passed: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
    weight: number;
  }>;
}

export interface QualityReport {
  passed: boolean;
  results: QualityResult[];
  score: number;
  timestamp: string;
  postGenScore?: PostGenScoreResult;
}

const XSS_PATTERN_STRINGS = [
  'dangerously' + 'SetInnerHTML',
  'inner' + 'HTML\\s*=',
  'document\\.write',
  'eval\\s*\\(',
  'new\\s+Function\\s*\\(',
];

const INJECTION_PATTERN_STRINGS = [
  '\\$\\{.*\\}.*exec',
  'child_' + 'process',
  `require\\s*\\(\\s*['"]fs['"]\\s*\\)`,
];

export function runSecurityScan(code: string): QualityResult {
  const issues: string[] = [];

  for (const src of XSS_PATTERN_STRINGS) {
    if (new RegExp(src).test(code)) {
      issues.push(`Potential XSS vector detected`);
    }
  }

  for (const src of INJECTION_PATTERN_STRINGS) {
    if (new RegExp(src).test(code)) {
      issues.push(`Potential injection vector detected`);
    }
  }

  return {
    gate: 'security',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'error' : 'info',
  };
}

export function runLintCheck(code: string): QualityResult {
  const issues: string[] = [];

  if (/console\.(log|debug|info)\s*\(/.test(code)) {
    issues.push('Contains console.log statements');
  }

  if (/:\s*any[\s;,)]/.test(code)) {
    issues.push('Uses explicit `any` type');
  }

  if (code.split('\n').some((line) => line.length > 120)) {
    issues.push('Lines exceed 120 characters');
  }

  return {
    gate: 'lint',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runTypeCheck(code: string): QualityResult {
  const issues: string[] = [];

  const hasHooks = /useState|useEffect|useRef/.test(code);
  const hasJsx = /<[A-Z]/.test(code);
  const hasDirective = /^['"]use client['"]/.test(code);

  if (hasJsx && hasHooks && !hasDirective) {
    issues.push('Component uses hooks but missing "use client" directive');
  }

  return {
    gate: 'type-check',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runAccessibilityCheck(code: string): QualityResult {
  const issues: string[] = [];

  if (/<img\b(?![^>]*\balt\s*=)/i.test(code)) {
    issues.push('<img> missing alt attribute');
  }

  if (/<button\b[^>]*>\s*<\/button>/i.test(code)) {
    issues.push('<button> without text content or aria-label');
  }

  if (/<input\b(?![^>]*(?:aria-label|aria-labelledby))/i.test(code)) {
    const hasLabel = /<label\b/i.test(code);
    if (!hasLabel) {
      issues.push('<input> without associated <label> or aria-label');
    }
  }

  if (/tabIndex\s*=\s*\{?\s?[1-9]/.test(code)) {
    issues.push('Positive tabIndex values harm accessibility');
  }

  return {
    gate: 'accessibility',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runResponsiveCheck(code: string): QualityResult {
  const issues: string[] = [];

  const hasBreakpoints = /\b(sm:|md:|lg:|xl:|2xl:)|@media/.test(code);
  const hasLayout = /\b(flex|grid|flex-col|grid-cols)\b/.test(code);

  if (!hasBreakpoints && hasLayout) {
    issues.push('Layout classes used without responsive breakpoints');
  }

  return {
    gate: 'responsive',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runArchitectureCheck(code: string): QualityResult {
  const issues: string[] = [];
  const lines = code.split('\n');

  if (lines.length > 300) {
    issues.push(`File is ${lines.length} lines (max 300) — split into smaller modules`);
  }

  const functionPattern = /^(?:export\s+)?(?:async\s+)?function\s+\w+/gm;
  const arrowPattern = /^(?:export\s+)?const\s+\w+\s*=.*=>/gm;
  const functions =
    (code.match(functionPattern) || []).length + (code.match(arrowPattern) || []).length;
  if (functions > 10) {
    issues.push(`${functions} functions in one file (max 10) — extract to separate modules`);
  }

  const propsMatch = code.match(/interface\s+\w*Props\s*\{([^}]*)\}/s);
  if (propsMatch) {
    const propCount = propsMatch[1].split(';').filter((p) => p.trim()).length;
    if (propCount > 10) {
      issues.push(`Component has ${propCount} props (max 10) — decompose or use context`);
    }
  }

  let maxNesting = 0;
  let currentNesting = 0;
  for (const char of code) {
    if (char === '{') {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    }
    if (char === '}') currentNesting--;
  }
  if (maxNesting > 5) {
    issues.push(`Nesting depth ${maxNesting} (max 5) — extract nested logic`);
  }

  return {
    gate: 'architecture',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runErrorHandlingCheck(code: string): QualityResult {
  const issues: string[] = [];

  const emptyCatch = /catch\s*\([^)]*\)\s*\{\s*\}/;
  if (emptyCatch.test(code)) {
    issues.push('Empty catch block swallows errors silently');
  }

  const consoleCatch = /catch\s*\([^)]*\)\s*\{[^}]*console\.(log|warn|debug)\s*\([^}]*\}/;
  if (consoleCatch.test(code)) {
    issues.push('Catch block only logs to console — use proper error reporting');
  }

  const fetchNoTry = /(?:await\s+)?fetch\s*\([^)]*\)(?!.*\.catch)(?![\s\S]*?catch)/;
  const hasTryCatch = /try\s*\{[\s\S]*?fetch[\s\S]*?\}\s*catch/.test(code);
  if (fetchNoTry.test(code) && !hasTryCatch && /fetch\s*\(/.test(code)) {
    const fetchCount = (code.match(/fetch\s*\(/g) || []).length;
    const tryCount = (code.match(/try\s*\{/g) || []).length;
    if (fetchCount > tryCount) {
      issues.push('fetch() calls without error handling — wrap in try/catch');
    }
  }

  const promiseNoHandle = /\.then\s*\([^)]*\)(?!\s*\.catch)/g;
  const thenMatches = code.match(promiseNoHandle) || [];
  const catchCount = (code.match(/\.catch\s*\(/g) || []).length;
  if (thenMatches.length > 0 && catchCount === 0) {
    issues.push('Promise .then() without .catch() — handle rejections');
  }

  return {
    gate: 'error-handling',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runScalabilityCheck(code: string): QualityResult {
  const issues: string[] = [];

  const loopFetch =
    /(?:for\s*\(|forEach\s*\(|map\s*\()[\s\S]*?(?:fetch\s*\(|await\s+\w+\.(?:query|find|get|select))/;
  if (loopFetch.test(code)) {
    issues.push('Database/API call inside loop — batch queries to avoid N+1');
  }

  const hasFetchOrQuery = /(?:fetch\s*\(|\.(query|find|findMany|select|get)\s*\()/.test(code);
  const hasArrayRender = /\.map\s*\(/.test(code);
  const hasPagination = /(?:limit|offset|page|pageSize|skip|take|cursor|pagination)/.test(code);
  if (hasFetchOrQuery && hasArrayRender && !hasPagination) {
    issues.push('Renders list from API without pagination — add limit/offset');
  }

  const unboundedState = /useState\s*<\s*any\[\]\s*>\s*\(\s*\[\s*\]\s*\)/;
  const hasAppend = /set\w+\s*\(\s*(?:\[\s*\.{3}|prev\s*=>)/.test(code);
  if (unboundedState.test(code) && hasAppend) {
    issues.push('Unbounded array state growth — implement windowing or limits');
  }

  return {
    gate: 'scalability',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runHardcodedValuesCheck(code: string): QualityResult {
  const issues: string[] = [];

  const urlPattern =
    /['"]https?:\/\/(?!(?:localhost|127\.0\.0\.1|example\.com|placeholder))[^'"]+['"]/g;
  const urlMatches = (code.match(urlPattern) || []).filter(
    (u) => !/(?:schema\.org|w3\.org|example\.|placeholder)/.test(u)
  );
  if (urlMatches.length > 0) {
    issues.push('Hardcoded URL — use environment variables or config');
  }

  const secretPattern =
    /(?:api[_-]?key|secret|token|password|credential)\s*[:=]\s*['"][^'"]{8,}['"]/i;
  if (secretPattern.test(code)) {
    issues.push('Possible hardcoded secret — use environment variables');
  }

  const magicNumbers: number[] = [];
  const numberPattern = /\b-?\d+(?:\.\d+)?\b/g;
  const numbers = code.match(numberPattern) || [];
  for (const rawNumber of numbers) {
    const n = Number(rawNumber);
    if (!Number.isFinite(n)) continue;
    if ([-1, 0, 1, 2, 100].includes(n)) continue;
    if (Math.abs(n) <= 2) continue;
    magicNumbers.push(n);
  }
  const uniqueMagic = [...new Set(magicNumbers)];
  if (uniqueMagic.length > 3) {
    issues.push(`${uniqueMagic.length} magic numbers — extract to named constants`);
  }

  const todoPattern = /\/\/\s*(?:TODO|FIXME|HACK|XXX)\b/gi;
  const todos = code.match(todoPattern) || [];
  if (todos.length > 3) {
    issues.push(`${todos.length} TODO/FIXME comments — resolve or create issues`);
  }

  return {
    gate: 'hardcoded-values',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runEngineeringCheck(code: string): QualityResult {
  const issues: string[] = [];

  const tsIgnore = /@ts-ignore|@ts-nocheck|@ts-expect-error/g;
  const ignores = code.match(tsIgnore) || [];
  if (ignores.length > 0) {
    issues.push(`${ignores.length} TypeScript suppression(s) — fix type errors instead`);
  }

  const syncOps = /(?:readFileSync|writeFileSync|execSync|pbkdf2Sync|randomFillSync)\s*\(/;
  if (syncOps.test(code)) {
    issues.push('Synchronous I/O operation — use async variant to avoid blocking');
  }

  const inlineStyles = /style\s*=\s*\{\s*\{/g;
  const styleCount = (code.match(inlineStyles) || []).length;
  if (styleCount > 3) {
    issues.push(`${styleCount} inline styles — use CSS classes or styled components`);
  }

  const indexAsPropKey = /\.map\s*\([^)]*,\s*(\w+)\)[\s\S]*?key\s*=\s*\{\s*\1\s*\}/;
  const indexAsKey = /key\s*=\s*\{\s*(?:index|i|idx)\s*\}/;
  if (indexAsPropKey.test(code) || indexAsKey.test(code)) {
    issues.push('Array index used as React key — use stable unique identifier');
  }

  return {
    gate: 'engineering',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

const GATE_WEIGHTS: Record<string, number> = {
  security: 3,
  accessibility: 2,
  architecture: 2,
  'error-handling': 2,
  scalability: 1.5,
  'hardcoded-values': 1.5,
  engineering: 1.5,
  lint: 1,
  'type-check': 1,
  responsive: 0.5,
};

export function calculateQualityScore(results: QualityResult[]): number {
  let earned = 0;
  let total = 0;

  for (const result of results) {
    const weight = GATE_WEIGHTS[result.gate] ?? 1;
    total += weight;
    if (result.passed) earned += weight;
  }

  return total > 0 ? earned / total : 1;
}

export function runAllGates(code: string): QualityReport {
  const results = [
    runSecurityScan(code),
    runAccessibilityCheck(code),
    runArchitectureCheck(code),
    runErrorHandlingCheck(code),
    runScalabilityCheck(code),
    runHardcodedValuesCheck(code),
    runEngineeringCheck(code),
    runLintCheck(code),
    runTypeCheck(code),
    runResponsiveCheck(code),
  ];

  const score = calculateQualityScore(results);

  return {
    passed: results.every((r) => r.passed || r.severity !== 'error'),
    results,
    score,
    timestamp: new Date().toISOString(),
  };
}
