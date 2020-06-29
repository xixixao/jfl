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
  checkFunctions(filteredModules);
  checkTODOs(filteredModules);
})();

function checkFunctions(modules) {
  const moduleNamesToFunctionsWithProblems = Mp.filter(
    Mp.pull(
      modules,
      ({moduleName}) => moduleName,
      ({functions}) => Ar.mapMaybe(functions, fn => checkFunction(fn)),
    ),
    functionsWithProblems => !Cl.isEmpty(functionsWithProblems),
  );

  if (Cl.isEmpty(moduleNamesToFunctionsWithProblems)) {
    console.log('✅ No files with incomplete function docs/tests!');
    return;
  }
  console.log('❌ Functions have incomplete docs/tests in:');
  Cl.forEach(moduleNamesToFunctionsWithProblems, (functions, moduleName) => {
    console.log('    ' + moduleName + ':');
    Cl.forEach(
      functions,
      ({
        functionName,
        incompleteDescription,
        examplesMissingFunction,
        examplesMissingResults,
        missingTests,
      }) => {
        const docProblem = incompleteDescription
          ? 'missing doc'
          : examplesMissingFunction
          ? 'bad example'
          : examplesMissingResults
          ? 'example missing result'
          : null;
        const testProblem = missingTests ? 'missing test' : null;

        console.log(
          `      ${functionName}` +
            ` (${Str.join(Ar.filterNulls([docProblem, testProblem]), ', ')})`,
        );
      },
    );
  });
  console.log('');
}

function checkFunction({doc, testLineNumber, functionName}) {
  const incompleteDescription = doc == null || Str.includes(doc.text, 'TODO');
  const examplesMissingFunction =
    doc != null &&
    Cl.any(doc.examples, example => !Str.includes(example, functionName));
  const examplesMissingResults =
    doc != null &&
    Cl.any(doc.examples, example => !Str.includes(example, /\/\/ ./));
  const missingTests = testLineNumber == null;
  if (
    !(
      incompleteDescription ||
      examplesMissingFunction ||
      examplesMissingResults ||
      missingTests
    )
  ) {
    return null;
  }
  return {
    functionName,
    incompleteDescription,
    examplesMissingFunction,
    examplesMissingResults,
    missingTests,
  };
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
