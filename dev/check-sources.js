// @flow

import {Ar, Cl, Mp, Str} from '../src';
import {loadAndParseModulesAsync} from './src-parser';
import path from 'path';

const moduleFilter = Cl.at(
  Ar.dropFirstWhile(
    process.argv,
    arg => !Str.includes(arg, path.basename(__filename)),
  ),
  1,
);
if (moduleFilter != null) {
  console.log(`Checking for files containing \`${moduleFilter}\`\n`);
}

(async () => {
  const modules = await loadAndParseModulesAsync();
  const filteredModules =
    moduleFilter == null
      ? modules
      : Ar.filter(modules, ({moduleName}) =>
          Str.includes(moduleName, moduleFilter),
        );
  checkDescriptions(filteredModules);
  checkTests(filteredModules);
  checkTODOs(filteredModules);
})();

function checkDescriptions(modules) {
  const moduleNamesToFunctionsWithMissingDescriptions = Mp.filter(
    Mp.pull(
      modules,
      ({moduleName}) => moduleName,
      ({functions}) =>
        Ar.filter(
          functions,
          ({doc}) => doc == null || Str.includes(doc.text, 'TODO'),
        ),
    ),
    functionsWithProblems => !Cl.isEmpty(functionsWithProblems),
  );

  if (Cl.isEmpty(moduleNamesToFunctionsWithMissingDescriptions)) {
    console.log('✅ No files with functions missing descriptions!');
    return;
  }
  console.log('❌ Functions are missing description in:');
  Cl.forEach(
    moduleNamesToFunctionsWithMissingDescriptions,
    (functions, moduleName) => {
      console.log('    ' + moduleName + ':');
      Cl.forEach(functions, ({functionName}) => {
        console.log('      ' + functionName);
      });
    },
  );
  console.log('');
}

function checkTests(modules) {
  const moduleNamesToFunctionsWithMissingTests = Mp.filter(
    Mp.pull(
      modules,
      ({moduleName}) => moduleName,
      ({functions}) =>
        Ar.filter(functions, ({testLineNumber}) => testLineNumber == null),
    ),
    functionsWithProblems => !Cl.isEmpty(functionsWithProblems),
  );

  if (Cl.isEmpty(moduleNamesToFunctionsWithMissingTests)) {
    console.log('✅ No files with functions missing tests!');
    return;
  }
  console.log('❌ Functions are missing tests in:');
  Cl.forEach(
    moduleNamesToFunctionsWithMissingTests,
    (functions, moduleName) => {
      console.log('    ' + moduleName + ':');
      Cl.forEach(functions, ({functionName}) => {
        console.log('      ' + functionName);
      });
    },
  );
  console.log('');
}

function checkTODOs(modules) {
  const fileNamesToTODOCounts = Mp.filter(
    Mp.pull(
      modules,
      ({moduleName}) => moduleName,
      ({moduleSource}) => getTODOs(moduleSource),
    ),
    todoCount => todoCount > 0,
  );
  if (Cl.isEmpty(fileNamesToTODOCounts)) {
    console.log('✅ No files with TODOs!');
    return;
  }
  console.log('❌ Files with TODOs:');
  Cl.forEach(fileNamesToTODOCounts, (todoCount, moduleName) => {
    console.log('    ' + moduleName + ': ' + todoCount);
  });
  console.log('');
}

function getTODOs(source) {
  return Str.countMatches(source, 'TODO');
}
