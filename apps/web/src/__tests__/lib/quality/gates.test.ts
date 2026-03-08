import {
  runSecurityScan,
  runLintCheck,
  runTypeCheck,
  runAccessibilityCheck,
  runResponsiveCheck,
  runArchitectureCheck,
  runErrorHandlingCheck,
  runScalabilityCheck,
  runHardcodedValuesCheck,
  runEngineeringCheck,
  calculateQualityScore,
  runAllGates,
} from '@/lib/quality/gates';

describe('runSecurityScan', () => {
  it('passes for clean code', () => {
    const result = runSecurityScan('const x = 1;');
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('security');
    expect(result.issues).toHaveLength(0);
    expect(result.severity).toBe('info');
  });

  it('detects dangerouslySetInnerHTML', () => {
    const result = runSecurityScan('<div dangerouslySetInnerHTML={{__html: x}} />');
    expect(result.passed).toBe(false);
    expect(result.issues).toContain('Potential XSS vector detected');
    expect(result.severity).toBe('error');
  });

  it('detects document.write', () => {
    const result = runSecurityScan('document.write("<script>")');
    expect(result.passed).toBe(false);
  });

  it('detects eval', () => {
    const result = runSecurityScan('eval("alert(1)")');
    expect(result.passed).toBe(false);
  });

  it('detects new Function', () => {
    const result = runSecurityScan('new Function("return 1")');
    expect(result.passed).toBe(false);
  });

  it('detects child_process injection', () => {
    const result = runSecurityScan('require("child_process").exec("ls")');
    expect(result.passed).toBe(false);
  });

  it('detects fs require injection', () => {
    const result = runSecurityScan("require('fs')");
    expect(result.passed).toBe(false);
  });
});

describe('runLintCheck', () => {
  it('passes for clean code', () => {
    const result = runLintCheck('const x: string = "hello";');
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('lint');
  });

  it('detects console.log', () => {
    const result = runLintCheck('console.log("debug");');
    expect(result.passed).toBe(false);
    expect(result.issues).toContain('Contains console.log statements');
  });

  it('ignores console.error', () => {
    const result = runLintCheck('console.error("err");');
    expect(result.passed).toBe(true);
  });

  it('detects explicit any type', () => {
    const result = runLintCheck('const x: any = 1;');
    expect(result.passed).toBe(false);
    expect(result.issues).toContain('Uses explicit `any` type');
  });

  it('detects long lines', () => {
    const result = runLintCheck('a'.repeat(130) + ' const x = 1;');
    expect(result.passed).toBe(false);
  });

  it('reports warning severity', () => {
    const result = runLintCheck('console.log("x"); const y: any = 1;');
    expect(result.severity).toBe('warning');
  });
});

describe('runTypeCheck', () => {
  it('passes for JSX without hooks', () => {
    const result = runTypeCheck('<Button onClick={handleClick}>Click</Button>');
    expect(result.passed).toBe(true);
  });

  it('passes with use client directive', () => {
    const code =
      '"use client"\nimport { useState } from "react";\nconst [c, s] = useState(0);\nreturn <Button>{c}</Button>;';
    const result = runTypeCheck(code);
    expect(result.passed).toBe(true);
  });

  it('fails for hooks + JSX without use client', () => {
    const code =
      'import { useState } from "react";\nconst [c, s] = useState(0);\nreturn <Button>{c}</Button>;';
    const result = runTypeCheck(code);
    expect(result.passed).toBe(false);
  });
});

describe('runAccessibilityCheck', () => {
  it('passes for accessible code', () => {
    const code = '<img alt="Photo" src="x.jpg" /><button>Click me</button>';
    const result = runAccessibilityCheck(code);
    expect(result.passed).toBe(true);
  });

  it('detects img without alt', () => {
    const result = runAccessibilityCheck('<img src="photo.jpg" />');
    expect(result.passed).toBe(false);
  });

  it('detects empty button', () => {
    const result = runAccessibilityCheck('<button></button>');
    expect(result.passed).toBe(false);
  });

  it('detects input without label', () => {
    const result = runAccessibilityCheck('<input type="text" />');
    expect(result.passed).toBe(false);
  });

  it('passes input with label element', () => {
    const result = runAccessibilityCheck('<label>Name</label><input type="text" />');
    expect(result.passed).toBe(true);
  });

  it('passes input with aria-label', () => {
    const result = runAccessibilityCheck('<input aria-label="Search" type="text" />');
    expect(result.passed).toBe(true);
  });

  it('detects positive tabIndex', () => {
    const result = runAccessibilityCheck('<div tabIndex={5}>Focusable</div>');
    expect(result.passed).toBe(false);
  });
});

describe('runResponsiveCheck', () => {
  it('passes with responsive breakpoints', () => {
    const code = '<div className="flex md:flex-row flex-col">Content</div>';
    const result = runResponsiveCheck(code);
    expect(result.passed).toBe(true);
  });

  it('warns for layout without breakpoints', () => {
    const code = '<div className="flex flex-col gap-4">Content</div>';
    const result = runResponsiveCheck(code);
    expect(result.passed).toBe(false);
  });

  it('passes for non-layout code', () => {
    const code = '<p className="text-lg font-bold">Hello</p>';
    const result = runResponsiveCheck(code);
    expect(result.passed).toBe(true);
  });
});

describe('runArchitectureCheck', () => {
  it('passes for small clean code', () => {
    const result = runArchitectureCheck('const x = 1;');
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('architecture');
  });

  it('detects files exceeding 300 lines', () => {
    const code = Array(350).fill('const x = 1;').join('\n');
    const result = runArchitectureCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/350 lines/);
  });

  it('detects too many functions in one file', () => {
    const fns = Array(12)
      .fill(0)
      .map((_, i) => `function fn${i}() { return ${i}; }`)
      .join('\n');
    const result = runArchitectureCheck(fns);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/12 functions/);
  });

  it('detects components with too many props', () => {
    const props = Array(15)
      .fill(0)
      .map((_, i) => `  prop${i}: string;`)
      .join('\n');
    const code = `interface CardProps {\n${props}\n}`;
    const result = runArchitectureCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/15 props/);
  });

  it('detects deep nesting', () => {
    const code = '{ { { { { { const x = 1; } } } } } }';
    const result = runArchitectureCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/depth 6/);
  });

  it('passes for moderate nesting', () => {
    const code = '{ { { const x = 1; } } }';
    const result = runArchitectureCheck(code);
    expect(result.passed).toBe(true);
  });
});

describe('runErrorHandlingCheck', () => {
  it('passes for clean code', () => {
    const result = runErrorHandlingCheck('const x = 1;');
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('error-handling');
  });

  it('detects empty catch blocks', () => {
    const code = 'try { doThing(); } catch (e) { }';
    const result = runErrorHandlingCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/Empty catch/);
  });

  it('detects console-only catch blocks', () => {
    const code = 'try { doThing(); } catch (e) { console.log(e) }';
    const result = runErrorHandlingCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/only logs to console/);
  });

  it('detects promise chains without catch', () => {
    const code = 'fetchData().then(data => process(data))';
    const result = runErrorHandlingCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/without \.catch/);
  });

  it('passes for promise with catch', () => {
    const code = 'fetchData().then(d => d).catch(e => handleError(e))';
    const result = runErrorHandlingCheck(code);
    expect(result.passed).toBe(true);
  });
});

describe('runScalabilityCheck', () => {
  it('passes for clean code', () => {
    const result = runScalabilityCheck('const x = 1;');
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('scalability');
  });

  it('detects fetch inside loop (N+1)', () => {
    const code = 'for (const id of ids) { await db.query(id); }';
    const result = runScalabilityCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/N\+1/);
  });

  it('detects list rendering without pagination', () => {
    const code = `
      const data = await fetch('/api/items');
      return data.map(item => <Item key={item.id} />);
    `;
    const result = runScalabilityCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/pagination/);
  });

  it('passes when pagination params present', () => {
    const code = `
      const data = await fetch('/api/items?limit=20&offset=0');
      return data.map(item => <Item key={item.id} />);
    `;
    const result = runScalabilityCheck(code);
    expect(result.passed).toBe(true);
  });
});

describe('runHardcodedValuesCheck', () => {
  it('passes for clean code', () => {
    const result = runHardcodedValuesCheck('const x = 1;');
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('hardcoded-values');
  });

  it('detects hardcoded URLs', () => {
    const code = 'const api = "https://api.production.com/v1/users";';
    const result = runHardcodedValuesCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/Hardcoded URL/);
  });

  it('ignores localhost URLs', () => {
    const code = 'const api = "http://localhost:3000/api";';
    const result = runHardcodedValuesCheck(code);
    const urlIssues = result.issues.filter((i) => i.includes('Hardcoded URL'));
    expect(urlIssues).toHaveLength(0);
  });

  it('detects hardcoded secrets', () => {
    const code = 'const api_key = "sk-1234567890abcdef";';
    const result = runHardcodedValuesCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.includes('secret'))).toBe(true);
  });

  it('detects TODO proliferation', () => {
    const code = '// TODO: fix\n// TODO: refactor\n// FIXME: broken\n// TODO: cleanup';
    const result = runHardcodedValuesCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.includes('TODO'))).toBe(true);
  });
});

describe('runEngineeringCheck', () => {
  it('passes for clean code', () => {
    const result = runEngineeringCheck('const x: string = "hello";');
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('engineering');
  });

  it('detects @ts-ignore', () => {
    const code = '// @ts-ignore\nconst x = badCall();';
    const result = runEngineeringCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/TypeScript suppression/);
  });

  it('detects @ts-nocheck', () => {
    const code = '// @ts-nocheck\nconst x = 1;';
    const result = runEngineeringCheck(code);
    expect(result.passed).toBe(false);
  });

  it('detects synchronous I/O', () => {
    const code = 'const data = readFileSync("config.json");';
    const result = runEngineeringCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/Synchronous I\/O/);
  });

  it('detects excessive inline styles', () => {
    const code = Array(5).fill('<div style={{ color: "red" }}>text</div>').join('\n');
    const result = runEngineeringCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/inline styles/);
  });

  it('detects array index as React key', () => {
    const code = 'items.map((item, index) => <li key={index}>{item}</li>)';
    const result = runEngineeringCheck(code);
    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatch(/Array index used as React key/);
  });
});

describe('calculateQualityScore', () => {
  it('returns 1 for all passed', () => {
    const results = [
      { gate: 'security', passed: true, issues: [] as string[], severity: 'info' as const },
      { gate: 'lint', passed: true, issues: [] as string[], severity: 'info' as const },
    ];
    expect(calculateQualityScore(results)).toBe(1);
  });

  it('returns 0 for all failed', () => {
    const results = [
      { gate: 'security', passed: false, issues: ['xss'], severity: 'error' as const },
      { gate: 'lint', passed: false, issues: ['log'], severity: 'warning' as const },
    ];
    expect(calculateQualityScore(results)).toBe(0);
  });

  it('weights security higher than lint', () => {
    const results = [
      { gate: 'security', passed: true, issues: [] as string[], severity: 'info' as const },
      { gate: 'lint', passed: false, issues: ['log'], severity: 'warning' as const },
    ];
    expect(calculateQualityScore(results)).toBe(0.75);
  });

  it('returns 1 for empty results', () => {
    expect(calculateQualityScore([])).toBe(1);
  });
});

describe('runAllGates', () => {
  it('returns report with all 10 gates', () => {
    const report = runAllGates('const x = 1;');
    expect(report.results).toHaveLength(10);
    expect(report.results.map((r) => r.gate)).toEqual([
      'security',
      'accessibility',
      'architecture',
      'error-handling',
      'scalability',
      'hardcoded-values',
      'engineering',
      'lint',
      'type-check',
      'responsive',
    ]);
    expect(report.timestamp).toBeDefined();
  });

  it('reports passed=true for clean code', () => {
    const report = runAllGates('const x: string = "hello";');
    expect(report.passed).toBe(true);
    expect(report.score).toBe(1);
  });

  it('reports passed=false when security fails', () => {
    const report = runAllGates('eval("alert(1)")');
    expect(report.passed).toBe(false);
    expect(report.score).toBeLessThan(1);
  });

  it('reports passed=true when only warnings present', () => {
    const report = runAllGates('console.log("test");');
    expect(report.passed).toBe(true);
    expect(report.score).toBeLessThan(1);
  });
});
