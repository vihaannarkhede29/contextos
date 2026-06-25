export interface ParsedSymbols {
  imports: string[];
  exports: string[];
  classes: string[];
  functions: string[];
  comments: string[];
}

const IMPORT_RE =
  /(?:import\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)|from\s+([\w.]+)\s+import)/g;
const EXPORT_RE =
  /export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)/g;
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g;
const FUNCTION_RE =
  /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>/g;
const COMMENT_RE = /\/\*\*?[\s\S]*?\*\/|\/\/.*$/gm;
const PY_IMPORT_RE = /^(?:from\s+(\S+)\s+import|import\s+(\S+))/gm;
const PY_CLASS_RE = /^class\s+(\w+)/gm;
const PY_FUNCTION_RE = /^def\s+(\w+)/gm;
const GO_IMPORT_RE = /import\s+(?:\([\s\S]*?\)|"([^"]+)")/g;
const GO_FUNC_RE = /^func\s+(?:\([^)]+\)\s+)?(\w+)/gm;
const JAVA_IMPORT_RE = /^import\s+([\w.]+);/gm;
const JAVA_CLASS_RE = /(?:public\s+)?(?:abstract\s+)?class\s+(\w+)/g;

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function parseWithRegex(content: string, extension: string): ParsedSymbols {
  const imports: string[] = [];
  const exports: string[] = [];
  const classes: string[] = [];
  const functions: string[] = [];
  const comments: string[] = [];

  const commentMatches = content.match(COMMENT_RE);
  if (commentMatches) comments.push(...commentMatches.map((c) => c.trim()));

  if (['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx'].includes(extension)) {
    let m: RegExpExecArray | null;
    while ((m = IMPORT_RE.exec(content)) !== null) {
      imports.push(m[1] ?? m[2] ?? m[3] ?? '');
    }
    while ((m = EXPORT_RE.exec(content)) !== null) {
      exports.push(m[1] ?? '');
    }
    while ((m = CLASS_RE.exec(content)) !== null) {
      classes.push(m[1] ?? '');
    }
    while ((m = FUNCTION_RE.exec(content)) !== null) {
      functions.push(m[1] ?? m[2] ?? '');
    }
  } else if (extension === '.py') {
    let m: RegExpExecArray | null;
    while ((m = PY_IMPORT_RE.exec(content)) !== null) {
      imports.push(m[1] ?? m[2] ?? '');
    }
    while ((m = PY_CLASS_RE.exec(content)) !== null) {
      classes.push(m[1] ?? '');
    }
    while ((m = PY_FUNCTION_RE.exec(content)) !== null) {
      functions.push(m[1] ?? '');
    }
  } else if (extension === '.go') {
    let m: RegExpExecArray | null;
    while ((m = GO_IMPORT_RE.exec(content)) !== null) {
      if (m[1]) imports.push(m[1]);
    }
    while ((m = GO_FUNC_RE.exec(content)) !== null) {
      functions.push(m[1] ?? '');
    }
  } else if (extension === '.java') {
    let m: RegExpExecArray | null;
    while ((m = JAVA_IMPORT_RE.exec(content)) !== null) {
      imports.push(m[1] ?? '');
    }
    while ((m = JAVA_CLASS_RE.exec(content)) !== null) {
      classes.push(m[1] ?? '');
    }
  }

  return {
    imports: unique(imports),
    exports: unique(exports),
    classes: unique(classes),
    functions: unique(functions),
    comments: unique(comments),
  };
}

// Tree-sitter WASM parser (optional; regex fallback below)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ParserClass: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tsLang: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let jsLang: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyLang: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tsxLang: any = null;
let parserInitialized = false;

function hasSymbols(symbols: ParsedSymbols): boolean {
  return (
    symbols.imports.length > 0 ||
    symbols.exports.length > 0 ||
    symbols.classes.length > 0 ||
    symbols.functions.length > 0
  );
}

async function initTreeSitter(): Promise<boolean> {
  if (parserInitialized) return ParserClass !== null;
  parserInitialized = true;
  try {
    const mod = await import('web-tree-sitter');
    ParserClass = mod.default;
    await ParserClass.init();
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    tsLang = await ParserClass.Language.load(
      require.resolve('tree-sitter-typescript/tree-sitter-typescript.wasm'),
    );
    try {
      tsxLang = await ParserClass.Language.load(
        require.resolve('tree-sitter-typescript/tree-sitter-tsx.wasm'),
      );
    } catch {
      tsxLang = tsLang;
    }
    jsLang = await ParserClass.Language.load(
      require.resolve('tree-sitter-javascript/tree-sitter-javascript.wasm'),
    );
    pyLang = await ParserClass.Language.load(
      require.resolve('tree-sitter-python/tree-sitter-python.wasm'),
    );
    return true;
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFromTree(node: any, symbols: ParsedSymbols): void {
  const type = node.type;
  if (type === 'import_statement' || type === 'import_declaration') {
    const text = node.text.trim();
    if (text) symbols.imports.push(text);
  }
  if (type === 'export_statement') {
    const text = node.text.trim();
    if (text) symbols.exports.push(text);
  }
  if (type === 'class_declaration' || type === 'class_definition') {
    const nameNode = node.childForFieldName('name');
    if (nameNode) symbols.classes.push(nameNode.text);
  }
  if (type === 'function_declaration' || type === 'function_definition') {
    const nameNode = node.childForFieldName('name');
    if (nameNode) symbols.functions.push(nameNode.text);
  }
  if (type === 'comment') {
    symbols.comments.push(node.text.trim());
  }
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child) extractFromTree(child, symbols);
  }
}

async function parseWithTreeSitter(
  content: string,
  extension: string,
): Promise<ParsedSymbols | null> {
  const ready = await initTreeSitter();
  if (!ready || !ParserClass) return null;

  let lang = null;
  if (extension === '.tsx') lang = tsxLang ?? tsLang;
  else if (extension === '.ts') lang = tsLang;
  else if (['.js', '.jsx'].includes(extension)) lang = jsLang;
  else if (extension === '.py') lang = pyLang;
  if (!lang) return null;

  const parser = new ParserClass();
  parser.setLanguage(lang);
  const tree = parser.parse(content);
  const symbols: ParsedSymbols = {
    imports: [],
    exports: [],
    classes: [],
    functions: [],
    comments: [],
  };
  extractFromTree(tree.rootNode, symbols);
  return {
    imports: unique(symbols.imports),
    exports: unique(symbols.exports),
    classes: unique(symbols.classes),
    functions: unique(symbols.functions),
    comments: unique(symbols.comments),
  };
}

export async function parseFile(content: string, extension: string): Promise<ParsedSymbols> {
  const treeResult = await parseWithTreeSitter(content, extension);
  if (treeResult && hasSymbols(treeResult)) return treeResult;
  return parseWithRegex(content, extension);
}

export function generateSummary(
  path: string,
  symbols: ParsedSymbols,
  content: string,
): string {
  const parts: string[] = [`File: ${path}`];
  if (symbols.classes.length) parts.push(`Classes: ${symbols.classes.join(', ')}`);
  if (symbols.functions.length) parts.push(`Functions: ${symbols.functions.slice(0, 10).join(', ')}`);
  if (symbols.imports.length) parts.push(`Imports: ${symbols.imports.slice(0, 8).join(', ')}`);
  if (path.endsWith('README.md') || path.endsWith('.md')) {
    parts.push(content.slice(0, 500));
  } else if (symbols.comments.length) {
    const docComment = symbols.comments.find((c) => c.startsWith('/**') || c.startsWith('"""'));
    if (docComment) parts.push(docComment.slice(0, 300));
  }
  return parts.join('\n');
}
