// @flow

import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import {Ar, Mp, REx, Str, Cl} from '../src';
import type {$Array} from '../src/types.flow';

type ParsedSource = $Array<{|
  moduleAlias: ?string,
  moduleName: string,
  moduleDoc: ?Doc,
  moduleSource: string,
  sections: $Array<{
    sectionName: string,
    functions: $Array<ParsedFunction>,
  }>,
  functions: $Array<ParsedFunction>,
|}>;
type ParsedFunction = {
  isAsync: boolean,
  doc: ?Doc,
  functionName: string,
  lineNumber: number,
  testLineNumber: ?number,
  signatures: $Array<string>,
};
type Doc = {
  text: string,
  examples: $Array<string>,
  time: ?string,
  space: ?string,
};

const srcDirectoryPath = path.join(__dirname, '../src');
const testDirectoryPath = path.join(__dirname, '../__tests__');

export async function loadAndParseModulesAsync(): Promise<ParsedSource> {
  const indexPath = path.join(srcDirectoryPath, 'index.js');
  const indexSource = await readFileX(indexPath);
  let $$ = indexSource;
  $$ = Str.matchEvery($$, /export \* as (\w+) from '\.\/(\w+)';/);
  $$ = Ar.map($$, ([_, moduleAlias, moduleName]) => [moduleAlias, moduleName]);
  $$ = Ar.prepend($$, [null, 'index']);
  return await Ar.mapAsync($$, async ([moduleAlias, moduleName]) => ({
    moduleAlias,
    moduleName,
    ...(await loadAndParseModuleAsync(moduleName)),
  }));
}

async function loadAndParseModuleAsync(moduleName) {
  const sourcePath = path.join(srcDirectoryPath, moduleName + '.js');
  const moduleSource = await readFileX(sourcePath);
  const testPath = path.join(testDirectoryPath, moduleName + '.test.js');
  const testSource = (await readFile(testPath)) ?? '';
  const testIndex = parseTestIndex(testSource);
  const moduleDoc = parseModuleDoc(moduleSource);
  const moduleFunctionIndex = parseFunctionIndex(moduleSource);
  const moduleDeclarationIndex = parseDeclarationIndex(moduleSource);
  let $$ = moduleSource;
  $$ = Str.matchEvery($$, /\/\/\/ (\w+)(((\s|\S)(?!\/\/\/))*)/);
  const sections = Ar.map($$, ([_, sectionName, sectionSource]) => ({
    sectionName,
    functions: parseSectionFunctions(
      moduleFunctionIndex,
      moduleDeclarationIndex,
      testIndex,
      sectionSource,
    ),
  }));
  const functions = Ar.mapFlat(sections, ({functions}) => functions);
  return {moduleDoc, moduleSource, sections, functions};
}

function parseModuleDoc(moduleSource) {
  let match = Str.matchFirst(moduleSource, /^(\/\*\*(?:(?:\s|\S)(?!\*\/))*)/);
  const [_, doc] = match ?? [];
  return parseDoc(doc);
}

function parseFunctionIndex(moduleSource) {
  return parseToIndex(moduleSource, /export (?:async )?function (\w+)/);
}

function parseDeclarationIndex(moduleSource) {
  let $$ = moduleSource;
  $$ = Str.matchEvery($$, /declare ((?:async )?function (\w+)[^;]+)/);
  return Mp.group(
    $$,
    ([_, __, functionName]) => functionName,
    ([_, signature]) => signature,
  );
}

function parseTestIndex(testSource) {
  return parseToIndex(testSource, /test\('(\w+)/);
}

function parseToIndex(source, pattern) {
  return Mp.fromEntries(
    Ar.mapMaybe(Str.splitLines(source), (line, index) => {
      const match = Str.matchFirst(line, pattern);
      if (match == null) {
        return null;
      }
      const [_, functionName] = match;
      return [functionName, index];
    }),
  );
}

function parseSectionFunctions(
  moduleFunctionIndex,
  moduleDeclarationIndex,
  testIndex,
  sectionSource,
) {
  let $$ = sectionSource;
  $$ = Str.matchEvery(
    $$,
    REx.concat(
      /(\/\*\*(?:(?:\s|\S)(?!export))*)?\s/,
      /export (async )?function (\w+)/,
      /((?:(?:\s|\S)(?!(\{\n {2}\S)|\{\}\n\n))*)/,
    ),
  );
  return Ar.map($$, ([_, doc, isAsync, functionName, params]) => ({
    doc: parseDoc(doc),
    isAsync: isAsync != null,
    functionName,
    lineNumber: Mp.getX(moduleFunctionIndex, functionName),
    testLineNumber: testIndex.get(functionName),
    signatures: moduleDeclarationIndex.get(functionName) ?? [
      (isAsync != null ? 'async function ' : '') +
        functionName +
        Str.replaceFirst(params, ': %checks', ': bool'),
    ],
  }));
}

function parseDoc(doc) {
  if (doc == null) {
    return null;
  }
  let $$ = doc;
  $$ = Str.trim($$, /[\s*/]*/);
  $$ = Str.splitLines($$);
  $$ = Ar.map($$, line => Str.trim(line, /[\s*/]*/));
  $$ = Ar.filter($$, line => line !== '@flow');

  let $$2 = Ar.takeFirstWhile($$, line => !Str.startsWith(line, '@'));
  $$2 = Ar.dropFirstWhile($$2, line => line === '');
  $$2 = Ar.dropLastWhile($$2, line => line === '');
  $$2 = Ar.map($$2, line => (line === '' ? '<br /><br />' : line));
  $$2 = Str.joinWords($$2);
  const text = Str.replaceEvery(
    $$2,
    /`([\w.]+)`/,
    (_, name) => `<span class="inlineCode">${name}</span>`,
  );

  let $$3 = Ar.filter($$, line => Str.startsWith(line, '@ex'));
  const examples = Ar.map($$3, example => Str.trimStart(example, '@ex '));

  let $$4 = Ar.filter($$, line => Str.startsWith(line, '@time'));
  $$4 = Ar.map($$3, example => Str.trimStart(example, '@time '));
  const time = Cl.first($$4);

  let $$5 = Ar.filter($$, line => Str.startsWith(line, '@space'));
  $$5 = Ar.map($$3, example => Str.trimStart(example, '@space '));
  const space = Cl.first($$5);

  return {text, examples, time, space};
}

async function readFileX(path: string): Promise<string> {
  return await promisify(fs.readFile)(path, 'utf8');
}

async function readFile(path: string): Promise<?string> {
  try {
    return await promisify(fs.readFile)(path, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') {
      return Promise.resolve(null);
    }
    throw e;
  }
}
