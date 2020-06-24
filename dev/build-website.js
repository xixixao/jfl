// @flow

import type {Collection} from '../src/types.flow';
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import {rollup} from 'rollup';
import Highlighter from 'highlights';
import rollupFlowPlugin from './rollup-flow-plugin';
import {Str, St, Ar, Cl, REx} from '../src';
import {joinLines} from '../src/string';
import {append} from '../src/regexp';
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const websiteSrcDirPath = path.join(__dirname, '../website-src');
const websiteDirectoryPath = path.join(__dirname, '../docs');

(async () => {
  const websiteTemplatePath = path.join(websiteSrcDirPath, 'template.html');
  const template = await readFile(websiteTemplatePath, 'utf8');
  const websiteIndexPath = path.join(websiteDirectoryPath, 'index.html');
  const modules = await loadAndParseModulesAsync();
  let $$ = template;
  $$ = Str.replaceFirst($$, '<!--NAVIGATION-->', await formatNav(modules));
  $$ = Str.replaceFirst($$, '<!--CONTENT-->', await formatModules(modules));
  $$ = Str.replaceFirst($$, '/*SCRIPT*/', await formatScript());
  await writeFile(websiteIndexPath, $$);
})().catch(e => console.log(e));

const srcDirectoryPath = path.join(__dirname, '../src');
async function loadAndParseModulesAsync() {
  const indexPath = path.join(srcDirectoryPath, 'index.js');
  const indexSource = await readFile(indexPath, 'utf8');
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
  const moduleSource = await readFile(sourcePath, 'utf8');
  const moduleDoc = parseModuleDoc(moduleSource);
  const moduleLines = Str.splitLines(moduleSource);
  let $$ = moduleSource;
  $$ = Str.matchEvery($$, /\/\/\/ (\w+)(((\s|\S)(?!\/\/\/))*)/);
  const sections = Ar.map($$, ([_, sectionName, sectionSource]) => ({
    sectionName,
    functions: parseSectionFunctions(moduleLines, sectionSource),
  }));
  return {moduleDoc, sections};
}

function parseModuleDoc(moduleSource) {
  let match = Str.matchFirst(moduleSource, /^(\/\*\*(?:(?:\s|\S)(?!\*\/))*)/);
  const [_, doc] = match ?? [];
  return parseDoc(doc);
}

function parseSectionFunctions(moduleLines, sectionSource) {
  let $$ = sectionSource;
  $$ = Str.matchEvery(
    $$,
    REx.concat(
      /(\/\*\*(?:(?:\s|\S)(?!export))*)?\s/,
      /export (async )?function (\w+)/,
      /((?:(?:\s|\S)(?!(\{\n  \S)|\{\}\n\n))*)/,
    ),
  );
  return Ar.map($$, ([_, doc, isAsync, functionName, params]) => ({
    doc: parseDoc(doc),
    isAsync: isAsync != null,
    functionName,
    // Yeah this is slow, we're reaching limits of this hacky parsing
    lineNumber: Cl.findKeyX(moduleLines, line =>
      Str.includes(line, `function ${functionName}`),
    ),
    signature:
      (isAsync != null ? 'async function ' : '') + functionName + params,
  }));
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

function formatNav(modules) {
  return mapAndJoin(
    modules,
    ({moduleAlias, moduleName, sections}) =>
      `
      <div class="moduleExpander">
        ${formatModuleLink(moduleAlias, moduleName)}
        ${formatModuleSectionLinks(moduleAlias, sections)}
      </div>
    `,
  );
}

function formatModuleLink(moduleAlias, moduleName) {
  const link = formatModuleLinkID(moduleAlias);
  const name = formatModuleName(moduleAlias, moduleName);
  return `
    <a class="module">${name}</a>
    <a class="function" href="#${link}">Overview</a>
  `;
}

function formatModuleName(moduleAlias, moduleName) {
  return moduleAlias == null ? '(jfl)' : `${moduleAlias} (${moduleName})`;
}

function formatModuleLinkID(moduleAlias) {
  return moduleAlias == null ? 'jfl' : Str.lowercase(moduleAlias);
}

function formatModuleSectionLinks(moduleAlias, sections) {
  return mapAndJoin(
    sections,
    ({sectionName, functions}) =>
      `
        <div class="section">${sectionName}</div>
        ${formatFunctionLinks(moduleAlias, functions)}
      `,
  );
}

function formatFunctionLinks(moduleAlias, functions) {
  return mapAndJoin(
    functions,
    ({functionName}) =>
      `
      <a class="function" href="#${formatFunctionName(
        moduleAlias,
        functionName,
      )}">
        ${formatFunctionName(moduleAlias, functionName)}
      </a>
    `,
  );
}

function formatFunctionName(shortModuleName, functionName) {
  return shortModuleName == null
    ? functionName
    : `${shortModuleName}.${functionName}`;
}

function formatModules(modules) {
  return mapAndJoin(
    modules,
    ({moduleAlias, moduleName, moduleDoc, sections}) =>
      `
      <a name="${formatModuleLinkID(moduleAlias)}"></a>
      <h2>${formatModuleName(moduleAlias, moduleName)}</h2>
      ${formatDoc(null, moduleDoc)}
      ${formatModuleSections(moduleAlias, moduleName, sections)}
    `,
  );
}

function formatModuleSections(moduleAlias, moduleName, sections) {
  return mapAndJoin(
    sections,
    ({sectionName, functions}) => `
      <h3>${sectionName}</h3>
      ${formatFunctions(moduleAlias, moduleName, functions)}
    `,
  );
}

function formatFunctions(moduleAlias, moduleName, functions) {
  return mapAndJoin(
    functions,
    ({functionName, doc, signature, lineNumber}) => `
      <div>
        <a name="${formatFunctionName(moduleAlias, functionName)}"></a>
        <h4>${formatFunctionName(moduleAlias, functionName)}</h4>
        ${formatDoc(signature, doc)}
        <p class="functionFooter"><a target="_blank" href="${getSourceHref(
          moduleName,
          lineNumber,
        )}">Source</a></p>
      </div>
    `,
  );
}

function formatDoc(signature, doc) {
  const highlightedCode =
    doc.examples != null && !Cl.isEmpty(doc.examples)
      ? highlight(Str.joinLines(doc.examples))
      : null;
  return `
    <p>${doc.text}</p>
    ${signature != null ? highlight(signature) : ''}
    ${highlightedCode ?? ''}
  `;
}

const highlighter = new Highlighter({scopePrefix: 'syntax--'});
function highlight(code) {
  return highlighter.highlightSync({
    fileContents: code,
    scopeName: 'source.js',
  });
}

const repoSourceURL = 'https://github.com/xixixao/jfl/blob/master/src/';

function getSourceHref(moduleName, lineNumber) {
  return repoSourceURL + moduleName + '.js' + '#L' + lineNumber;
}

function mapAndJoin<V>(collection: Collection<V>, fn: V => string): string {
  return Str.joinLines(Ar.map(collection, fn));
}

async function formatScript() {
  const inputOptions = {
    input: path.join(websiteSrcDirPath, 'script.js'),
    plugins: [rollupFlowPlugin({pretty: true})],
    onwarn: (warning, warn) => {
      if (!warning.code === 'CIRCULAR_DEPENDENCY') {
        warn(warning);
      }
    },
  };
  const outputOptions = {
    format: 'iife',
  };
  const {output} = await (await rollup(inputOptions)).generate(outputOptions);
  const code = Str.joinLines(Ar.map(output, chunk => chunk.code));
  return Str.replaceFirst(code, '}(_));', '}())');
}
