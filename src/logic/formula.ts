export type FormulaNode =
  | { type: 'num'; value: number }
  | { type: 'ident'; key: string }
  | { type: 'neg'; operand: FormulaNode }
  | { type: 'binary'; op: '+' | '-' | '*' | '/'; left: FormulaNode; right: FormulaNode };

export type ParseResult = { ok: true; ast: FormulaNode } | { ok: false; error: string };

type Token =
  | { type: 'num'; value: number }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: '+' | '-' | '*' | '/' }
  | { type: 'lparen' }
  | { type: 'rparen' };

function tokenize(source: string): Token[] | { error: string } {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < source.length && /[0-9.]/.test(source[j])) j += 1;
      const value = Number(source.slice(i, j));
      if (Number.isNaN(value)) return { error: `Invalid number near position ${i}` };
      tokens.push({ type: 'num', value });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < source.length && /[A-Za-z0-9_]/.test(source[j])) j += 1;
      tokens.push({ type: 'ident', value: source.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'op', value: ch });
      i += 1;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i += 1;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i += 1;
      continue;
    }
    return { error: `Unexpected character "${ch}" near position ${i}` };
  }
  return tokens;
}

class Parser {
  private pos = 0;
  constructor(
    private tokens: Token[],
    private knownKeys: Set<string>,
  ) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private next(): Token | undefined {
    return this.tokens[this.pos++];
  }

  parseExpr(): FormulaNode {
    let node = this.parseTerm();
    for (;;) {
      const tok = this.peek();
      if (tok?.type === 'op' && (tok.value === '+' || tok.value === '-')) {
        this.next();
        const right = this.parseTerm();
        node = { type: 'binary', op: tok.value, left: node, right };
      } else {
        break;
      }
    }
    return node;
  }

  private parseTerm(): FormulaNode {
    let node = this.parseFactor();
    for (;;) {
      const tok = this.peek();
      if (tok?.type === 'op' && (tok.value === '*' || tok.value === '/')) {
        this.next();
        const right = this.parseFactor();
        node = { type: 'binary', op: tok.value, left: node, right };
      } else {
        break;
      }
    }
    return node;
  }

  private parseFactor(): FormulaNode {
    const tok = this.next();
    if (!tok) throw new Error('Unexpected end of formula');
    if (tok.type === 'op' && tok.value === '-') {
      return { type: 'neg', operand: this.parseFactor() };
    }
    if (tok.type === 'num') {
      return { type: 'num', value: tok.value };
    }
    if (tok.type === 'ident') {
      if (!this.knownKeys.has(tok.value)) {
        throw new Error(`Unknown category "${tok.value}" in formula`);
      }
      return { type: 'ident', key: tok.value };
    }
    if (tok.type === 'lparen') {
      const inner = this.parseExpr();
      const close = this.next();
      if (close?.type !== 'rparen') throw new Error("Expected ')'");
      return inner;
    }
    throw new Error('Unexpected token in formula');
  }

  parseAndCheckComplete(): FormulaNode {
    const node = this.parseExpr();
    if (this.pos < this.tokens.length) {
      throw new Error('Unexpected trailing tokens in formula');
    }
    return node;
  }
}

export function parseFormula(source: string, knownKeys: string[]): ParseResult {
  if (!source.trim()) return { ok: false, error: 'Formula is empty' };
  const tokens = tokenize(source);
  if (!Array.isArray(tokens)) return { ok: false, error: tokens.error };
  if (tokens.length === 0) return { ok: false, error: 'Formula is empty' };
  try {
    const parser = new Parser(tokens, new Set(knownKeys));
    const ast = parser.parseAndCheckComplete();
    return { ok: true, ast };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid formula' };
  }
}

export function evaluateFormula(ast: FormulaNode, values: Record<string, number>): number {
  switch (ast.type) {
    case 'num':
      return ast.value;
    case 'ident':
      return values[ast.key] ?? 0;
    case 'neg':
      return -evaluateFormula(ast.operand, values);
    case 'binary': {
      const left = evaluateFormula(ast.left, values);
      const right = evaluateFormula(ast.right, values);
      switch (ast.op) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          return right === 0 ? 0 : left / right;
      }
    }
  }
}
