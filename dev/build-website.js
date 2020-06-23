// @flow

import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import {Str, St, Ar} from '../src';
import {joinLines} from '../src/string';
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

(async () => {
  const websiteDirectoryPath = path.join(__dirname, '../website');
  const websiteTemplatePath = path.join(websiteDirectoryPath, 'template.html');
  const template = await readFile(websiteTemplatePath, 'utf8');
  const websiteIndexPath = path.join(websiteDirectoryPath, 'index.html');
  const built = Str.replaceFirst(
    template,
    '<!--NAVIGATION-->',
    await getModulesNavigation(),
  );
  await writeFile(websiteIndexPath, built);
})();

const srcDirectoryPath = path.join(__dirname, '../src');
async function getModulesNavigation() {
  const indexPath = path.join(srcDirectoryPath, 'index.js');
  const indexSource = await readFile(indexPath, 'utf8');
  let $$ = indexSource;
  $$ = Str.matchEvery($$, /export \* as (\w+) from '\.\/(\w+)';/);
  $$ = await Ar.mapAsync(
    $$,
    async ([_, shortName, fullName]) =>
      `
      ${getModuleLink(shortName, fullName)}
      ${await getModuleSectionLinks(shortName, fullName)}
    `,
  );
  return Str.joinLines($$);
}

function getModuleLink(shortName, fileName) {
  return `<a href="#${Str.lowercase(
    shortName,
  )}">${shortName} (${fileName})</a>`;
}

async function getModuleSectionLinks(shortName, moduleName) {
  const sourcePath = path.join(srcDirectoryPath, moduleName + '.js');
  const moduleSource = await readFile(sourcePath, 'utf8');
  let $$ = moduleSource;
  $$ = Str.matchEvery($$, /\/\/\/ (\w+)(((\s|\S)(?!\/\/\/))*)/);
  $$ = Ar.map(
    $$,
    ([_, section, sectionSource]) => `
    <div class="section">${section}</div>
    ${getFunctionLinks(shortName, sectionSource)}
  `,
  );
  return Str.joinLines($$);
}

function getFunctionLinks(shortName, source) {
  let $$ = source;
  $$ = Str.matchEvery($$, /export function (\w+)/);
  $$ = Ar.map(
    $$,
    ([_, functionName]) => `
    <a class="function" href="#${shortName}.${functionName}">
      ${shortName}.${functionName}
    </a>
  `,
  );
  return Str.joinLines($$);
}
