// @flow

import type {$Array} from '../src/types.flow';

import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import {Ar, Cl, REx, Str, nullthrows} from '../src';

type Doc = {text: string, examples?: $Array<string>};
type Source = $Array<{|
  moduleAlias: ?string,
  moduleName: string,
  moduleDoc: Doc,
  sections: $Array<{
    sectionName: string,
    functions: $Array<{
      isAsync: boolean,
      doc: Doc,
      functionName: string,
      lineNumber: number,
      testLineNumber: ?number,
      signature: string,
    }>,
  }>,
|}>;

const srcDirectoryPath = path.join(__dirname, '../src');
const testDirectoryPath = path.join(__dirname, '../__tests__');

export async function loadAndParseModulesAsync(): Promise<Source> {
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
  const testLines = Str.splitLines(testSource);
  const moduleDoc = parseModuleDoc(moduleSource);
  const moduleLines = Str.splitLines(moduleSource);
  let $$ = moduleSource;
  $$ = Str.matchEvery($$, /\/\/\/ (\w+)(((\s|\S)(?!\/\/\/))*)/);
  const sections = Ar.map($$, ([_, sectionName, sectionSource]) => ({
    sectionName,
    functions: parseSectionFunctions(moduleLines, testLines, sectionSource),
  }));
  return {moduleDoc, sections};
}

function parseModuleDoc(moduleSource) {
  let match = Str.matchFirst(moduleSource, /^(\/\*\*(?:(?:\s|\S)(?!\*\/))*)/);
  const [_, doc] = match ?? [];
  return parseDoc(doc);
}

function parseSectionFunctions(moduleLines, testLines, sectionSource) {
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
    // Yeah this is slow, we're reaching limits of this hacky parsing
    lineNumber: nullthrows(
      findLineIncludes(moduleLines, `function ${functionName}`),
    ),
    testLineNumber: findLineIncludes(testLines, `test('${functionName}`),
    signature:
      (isAsync != null ? 'async function ' : '') + functionName + params,
  }));
}

function findLineIncludes(lines, search) {
  return Cl.findKey(lines, line => Str.includes(line, search));
}

function parseDoc(doc) {
  if (doc == null) {
    return {text: 'Work in progress.'};
  }
  let $$ = doc;
  $$ = Str.trim($$, /[\s*/]*/);
  $$ = Str.splitLines($$);
  $$ = Ar.map($$, line => Str.trim(line, /[\s*/]*/));
  $$ = Ar.filter($$, line => line !== '@flow');

  let $$2 = Ar.takeWhile($$, line => !Str.startsWith(line, '@'));
  $$2 = Ar.dropWhile($$2, line => line === '');
  $$2 = Ar.dropWhileFromEnd($$2, line => line === '');
  $$2 = Ar.map($$2, line => (line === '' ? '<br /><br />' : line));
  const text = Str.joinWords($$2);

  let $$3 = Ar.filter($$, line => Str.startsWith(line, '@ex'));
  const examples = Ar.map($$3, example => Str.trimStart(example, '@ex '));

  return {text, examples};
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
