import React from 'react';

const C = {
  keyword:  '#569CD6',
  control:  '#C586C0',
  string:   '#CE9178',
  comment:  '#6A9955',
  type:     '#4EC9B0',
  fn:       '#DCDCAA',
  prop:     '#9CDCFE',
  number:   '#B5CEA8',
  plain:    '#D4D4D4',
  tag:      '#4EC9B0',
  attr:     '#9CDCFE',
  op:       '#D4D4D4',
  punct:    '#808080',
  sqlkw:    '#569CD6',
  yamlkey:  '#9CDCFE',
  bashcmd:  '#DCDCAA',
  bashflag: '#9CDCFE',
};

type Token = { text: string; color: string };

const TS_KEYWORDS = new Set([
  'import','export','from','as','default',
  'const','let','var','function','class','interface','type','enum',
  'extends','implements','new','this','super',
  'async','await','return','yield',
  'if','else','for','while','do','switch','case','break','continue',
  'try','catch','finally','throw',
  'true','false','null','undefined','void','never','any','unknown',
  'static','readonly','private','public','protected','abstract',
  'describe','it','test','expect','beforeEach','afterEach','beforeAll','afterAll',
  'module','require',
]);

const CONTROL_KEYWORDS = new Set([
  'return','if','else','for','while','do','switch','case','break',
  'continue','try','catch','finally','throw','yield',
]);

const SQL_KEYWORDS = new Set([
  'SELECT','FROM','WHERE','CREATE','ALTER','DROP','INSERT','UPDATE','DELETE',
  'TABLE','VIEW','INDEX','POLICY','ENABLE','DISABLE','ROW','LEVEL','SECURITY',
  'FOR','ALL','USING','TO','WITH','CHECK','ON','AS','IS','NOT','NULL',
  'TRUE','FALSE','AND','OR','IN','VALUES','REFERENCES','PRIMARY','KEY',
  'FOREIGN','UNIQUE','CASCADE','GRANT','REVOKE','SCHEMA','DATABASE','TRIGGER',
  'FUNCTION','RETURNS','LANGUAGE','BEGIN','END','DECLARE','SET','CONSTRAINT',
]);

function tokenizeTS(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    const ch = code[i];
    const rest = code.slice(i);

    if (ch === '/' && code[i + 1] === '/') {
      const nl = code.indexOf('\n', i);
      const end = nl === -1 ? code.length : nl;
      tokens.push({ text: code.slice(i, end), color: C.comment });
      i = end;
      continue;
    }

    if (ch === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const endIdx = end === -1 ? code.length : end + 2;
      tokens.push({ text: code.slice(i, endIdx), color: C.comment });
      i = endIdx;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === ch) { j++; break; }
        j++;
      }
      tokens.push({ text: code.slice(i, j), color: C.string });
      i = j;
      continue;
    }

    if (/[a-zA-Z_$]/.test(ch)) {
      const m = /^[a-zA-Z_$][a-zA-Z0-9_$]*/.exec(rest)!;
      const word = m[0];
      const after = code[i + word.length];
      let color: string;
      if (CONTROL_KEYWORDS.has(word)) {
        color = C.control;
      } else if (TS_KEYWORDS.has(word)) {
        color = C.keyword;
      } else if (after === '(') {
        color = C.fn;
      } else if (/^[A-Z]/.test(word)) {
        color = C.type;
      } else {
        color = C.prop;
      }
      tokens.push({ text: word, color });
      i += word.length;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      const m = /^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/.exec(rest)!;
      tokens.push({ text: m[0], color: C.number });
      i += m[0].length;
      continue;
    }

    if (ch === '<') {
      if (code[i + 1] === '/') {
        const closeEnd = code.indexOf('>', i);
        if (closeEnd !== -1) {
          const tag = code.slice(i, closeEnd + 1);
          const tagName = /^<\/([a-zA-Z][a-zA-Z0-9.]*)/.exec(tag);
          if (tagName) {
            tokens.push({ text: '</', color: C.punct });
            tokens.push({ text: tagName[1], color: C.tag });
            tokens.push({ text: '>', color: C.punct });
            i = closeEnd + 1;
            continue;
          }
        }
      } else {
        const m = /^<([a-zA-Z][a-zA-Z0-9.]*)/.exec(rest);
        if (m) {
          tokens.push({ text: '<', color: C.punct });
          tokens.push({ text: m[1], color: C.tag });
          i += m[0].length;
          continue;
        }
      }
    }

    tokens.push({ text: ch, color: C.op });
    i++;
  }

  return tokens;
}

function tokenizeSQL(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    const ch = code[i];
    const rest = code.slice(i);

    if (ch === '-' && code[i + 1] === '-') {
      const nl = code.indexOf('\n', i);
      const end = nl === -1 ? code.length : nl;
      tokens.push({ text: code.slice(i, end), color: C.comment });
      i = end;
      continue;
    }

    if (ch === "'" ) {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === "'") { j++; break; }
        j++;
      }
      tokens.push({ text: code.slice(i, j), color: C.string });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      const m = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(rest)!;
      const word = m[0];
      const color = SQL_KEYWORDS.has(word.toUpperCase()) ? C.sqlkw : C.prop;
      tokens.push({ text: word, color });
      i += word.length;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      const m = /^[0-9]+(\.[0-9]+)?/.exec(rest)!;
      tokens.push({ text: m[0], color: C.number });
      i += m[0].length;
      continue;
    }

    tokens.push({ text: ch, color: C.op });
    i++;
  }

  return tokens;
}

function tokenizeYAML(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');

  for (let li = 0; li < lines.length; li++) {
    if (li > 0) tokens.push({ text: '\n', color: C.plain });
    const line = lines[li];
    let i = 0;

    if (/^\s*#/.test(line)) {
      tokens.push({ text: line, color: C.comment });
      continue;
    }

    const keyMatch = /^(\s*)([a-zA-Z_-][a-zA-Z0-9_-]*)(\s*:)/.exec(line);
    if (keyMatch) {
      tokens.push({ text: keyMatch[1], color: C.plain });
      tokens.push({ text: keyMatch[2], color: C.yamlkey });
      tokens.push({ text: keyMatch[3], color: C.punct });
      i = keyMatch[0].length;
    }

    const remaining = line.slice(i);
    if (remaining) {
      const strMatch = /^\s*['"](.*)['"]/.exec(remaining);
      if (strMatch) {
        tokens.push({ text: remaining, color: C.string });
      } else if (remaining.trim().startsWith('- ') || remaining.trim().startsWith('-\n')) {
        const dashMatch = /^(\s*- )(.*)/.exec(remaining);
        if (dashMatch) {
          tokens.push({ text: dashMatch[1], color: C.punct });
          tokens.push({ text: dashMatch[2], color: C.string });
        } else {
          tokens.push({ text: remaining, color: C.plain });
        }
      } else {
        tokens.push({ text: remaining, color: C.plain });
      }
    }
  }

  return tokens;
}

function detectLang(code: string): 'ts' | 'sql' | 'yaml' {
  if (/ALTER TABLE|CREATE POLICY|ENABLE ROW LEVEL/i.test(code)) return 'sql';
  if (/^(jobs:|steps:|on:|runs-on:)/m.test(code) || /uses:\s+\S/.test(code)) return 'yaml';
  return 'ts';
}

function tokenize(code: string, lang?: string): Token[] {
  const resolved = lang ?? detectLang(code);
  if (resolved === 'sql') return tokenizeSQL(code);
  if (resolved === 'yaml') return tokenizeYAML(code);
  return tokenizeTS(code);
}

export function renderTokens(tokens: Token[]): React.ReactNode {
  return tokens.map((t, i) => (
    <span key={i} style={{ color: t.color }}>
      {t.text}
    </span>
  ));
}

export function highlightLine(line: string, lang?: string): React.ReactNode {
  if (!line.trim()) return '\u00A0';
  return renderTokens(tokenize(line, lang));
}

export function highlightBlock(code: string, lang?: string): React.ReactNode {
  return renderTokens(tokenize(code, lang ?? detectLang(code)));
}

export function lineStartColor(line: string): string {
  const t = line.trim();
  if (t.startsWith('//') || t.startsWith('--') || t.startsWith('#')) return C.comment;
  if (t.startsWith('import') || t.startsWith('export') || t.startsWith('const') ||
      t.startsWith('let') || t.startsWith('var') || t.startsWith('class') ||
      t.startsWith('interface') || t.startsWith('type') || t.startsWith('enum') ||
      t.startsWith('async') || t.startsWith('abstract') || t.startsWith('describe') ||
      t.startsWith('it(') || t.startsWith('test(') || t.startsWith('expect(')) {
    return C.keyword;
  }
  if (t.startsWith('return') || t.startsWith('if') || t.startsWith('else') ||
      t.startsWith('throw') || t.startsWith('try') || t.startsWith('catch')) {
    return C.control;
  }
  if (t.startsWith('<') || /^[A-Z]/.test(t)) return C.type;
  if (t.startsWith('"') || t.startsWith("'") || t.startsWith('`')) return C.string;
  return C.prop;
}
