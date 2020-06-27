// @flow

import {Ar, Cl, Mp, Str} from '../src';
import {loadAndParseModulesAsync} from './src-parser';

(async () => {
  const modules = await loadAndParseModulesAsync();
  checkDescriptions(modules);
  console.log('');
  checkTests(modules);
  console.log('');
  checkTODOs(modules);
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
  }
  console.log('❌ Files with TODOs:');
  Cl.forEach(fileNamesToTODOCounts, (todoCount, moduleName) => {
    console.log('    ' + moduleName + ': ' + todoCount);
  });
}

function getTODOs(source) {
  return Str.countMatches(source, 'TODO');
}
