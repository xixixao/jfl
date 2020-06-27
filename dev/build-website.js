// @flow

import * as fs from 'fs';
import Highlighter from 'highlights';
import * as path from 'path';
import {rollup} from 'rollup';
import {promisify} from 'util';
import {Ar, Cl, Str} from '../src';
import type {KeyedCollection} from '../src/types.flow';
import rollupFlowPlugin from './rollup-flow-plugin';
import rollupCleanupPlugin from 'rollup-plugin-cleanup';
import {loadAndParseModulesAsync} from './src-parser';
const writeFile = promisify(fs.writeFile);
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
    <a class="moduleContent" href="#${link}">Overview</a>
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
      <a class="moduleContent function" href="#${formatFunctionName(
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
    ({functionName, doc, signature, lineNumber, testLineNumber}) => `
      <div>
        <a
          class="headlineLink"
          name="${formatFunctionName(moduleAlias, functionName)}"
          href="#${formatFunctionName(moduleAlias, functionName)}">
          <h4>${formatFunctionName(moduleAlias, functionName)}</h4>
        </a>
        ${formatDoc(signature, doc)}
        <p class="functionFooter">
          <a target="_blank" href="${getSourceHref(
            moduleName,
            lineNumber,
          )}">Source</a>
          ${
            testLineNumber != null
              ? `<a target="_blank" href="${getTestHref(
                  moduleName,
                  testLineNumber,
                )}">Tests</a>`
              : ''
          }          
        </p>
      </div>
    `,
  );
}

function formatDoc(signature, doc) {
  const highlightedCode =
    doc != null && !Cl.isEmpty(doc.examples)
      ? highlight(Str.joinLines(doc.examples))
      : null;
  return `
    <p>${formatDocText(doc?.text)}</p>
    ${formatSignature(signature)}
    ${highlightedCode ?? ''}
  `;
}

function formatDocText(text) {
  if (text == null) {
    return 'Work in progress';
  }
  return Str.replaceEvery(
    text,
    /https?:\/\/([\w.]+)(\S*)(\/\w+\/?)(?=\.?\s)/,
    (link, domain, path, page) =>
      `<a href="${link}">${domain}${
        Str.isEmpty(path) ? '' : '/...'
      }${page}</a>`,
  );
}

function formatSignature(signature) {
  if (signature == null) {
    return '';
  }
  let $$ = Str.replaceFirst(signature, ': %checks', ': bool');
  return highlight($$);
}

const highlighter = new Highlighter({scopePrefix: '-'});
function highlight(code) {
  return highlighter.highlightSync({
    fileContents: code,
    scopeName: 'source.js',
  });
}

const repoURL = 'https://github.com/xixixao/jfl/blob/master/';

function getSourceHref(moduleName, lineNumber) {
  return repoURL + 'src/' + moduleName + '.js' + '#L' + (lineNumber + 1);
}

function getTestHref(moduleName, lineNumber) {
  return (
    repoURL + '__tests__/' + moduleName + '.test.js' + '#L' + (lineNumber + 1)
  );
}

function mapAndJoin<K, V>(
  collection: KeyedCollection<K, V>,
  fn: V => string,
): string {
  return Str.joinLines(Ar.map(collection, fn));
}

async function formatScript() {
  const inputOptions = {
    input: path.join(websiteSrcDirPath, 'script.js'),
    plugins: [
      rollupFlowPlugin({pretty: true}),
      rollupCleanupPlugin({sourcemap: false}),
    ],
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
