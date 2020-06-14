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
  console.log('Functions are missing description in');
  Cl.forEach($$, (functionsToParsedDocs, fileName) => {
    console.log('  ' + fileName + ':');
    Cl.forEach(functionsToParsedDocs, (_parsedDoc, functionName) => {
      console.log('    ' + functionName);
    });
  });
})();

function getExportsWithDocs(source) {
  let $$ = REx.everyMatch(
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
  let [text] = nullthrows(REx.firstMatch(doc, /^((\s|\S)(?!@|\/))*/));
  let $$ = text;
  $$ = Str.replace($$, / *\* */, ''); // strip comments
  $$ = Str.replace($$, /^\n+/, ''); // truncate newlines from start
  $$ = Str.replace($$, /\n+$/, ''); // truncate newlines from end
  return $$;
}
