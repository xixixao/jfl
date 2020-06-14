// @flow

import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
import {Ar, St, Cl, Mp, REx, nullthrows, Str} from '../src';

const srcDirectoryPath = path.join(__dirname, '../src');
(async () => {
  let $$ = await readdir(srcDirectoryPath);
  $$ = St.diff($$, ['types.flow.js']);
  $$ = Mp.fromKeys($$, fileName => path.join(srcDirectoryPath, fileName));
  $$ = await Mp.mapAsync($$, filePath => readFile(filePath, 'utf8'));
  checkDescriptions($$);
  console.log('');
  checkTODOs($$);
})();

function checkTODOs(fileNamesToFileSources) {
  let $$ = fileNamesToFileSources;
  $$ = Mp.map($$, fileSource => getTODOs(fileSource));
  $$ = Mp.filter($$, todoCount => todoCount > 0);
  const fileNamesToTODOCounts = $$;
  if (Cl.isEmpty(fileNamesToTODOCounts)) {
    console.log('✅ No files with TODOs!');
  }
  console.log('❌ Files with TODOs:');
  Cl.forEach(fileNamesToTODOCounts, (todoCount, fileName) => {
    console.log('    ' + fileName + ': ' + todoCount);
  });
}

function getTODOs(source) {
  return Str.countMatches(source, 'TODO');
}

function checkDescriptions(fileNamesToFileSources) {
  let $$ = fileNamesToFileSources;
  $$ = Mp.map($$, fileSource => getExportsWithDocs(fileSource));
  $$ = Mp.map($$, functionsToParsedDocs =>
    Mp.filter(
      functionsToParsedDocs,
      parsedDoc => parsedDoc?.description == null,
    ),
  );
  $$ = Mp.filter(
    $$,
    functionsToParsedDocs => !Cl.isEmpty(functionsToParsedDocs),
  );
  const fileNamesToFunctionsToParsedDocs = $$;
  if (Cl.isEmpty(fileNamesToFunctionsToParsedDocs)) {
    console.log('✅ No files with functions missing descriptions!');
  }
  console.log('❌ Functions are missing description in:');
  Cl.forEach(
    fileNamesToFunctionsToParsedDocs,
    (functionsToParsedDocs, fileName) => {
      console.log('    ' + fileName + ':');
      Cl.forEach(functionsToParsedDocs, (_parsedDoc, functionName) => {
        console.log('      ' + functionName);
      });
    },
  );
}

function getExportsWithDocs(source) {
  let $$ = Str.everyMatch(
    source,
    /(?:\/(?<doc>\*\*(?:(?:\s|\S)(?!\*\*|TODO|\n\n))*?))?export function (?<name>\w+)/g,
  );
  $$ = Ar.map($$, match => nullthrows(match.groups));
  $$ = Mp.mapToEntries($$, groups => [groups.name, groups.doc]);
  $$ = Mp.map($$, doc =>
    doc != null
      ? {
          description: getDescriptionFromDoc(doc),
          // complexity: getComplexityFromDoc(doc),
          // examples: getExamplesFromDoc(doc),
        }
      : null,
  );
  return $$;
}

function getDescriptionFromDoc(doc) {
  let [text] = nullthrows(Str.firstMatch(doc, /^((\s|\S)(?!@|\/))*/));
  let $$ = text;
  $$ = Str.replaceEvery($$, / *\* */, ''); // strip comments
  $$ = Str.replaceEvery($$, /^\n+/, ''); // truncate newlines from start
  $$ = Str.replaceEvery($$, /\n+$/, ''); // truncate newlines from end
  return $$;
}
