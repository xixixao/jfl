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
  checkTestsStructure(filteredModules);
  checkTODOs(filteredModules);
})();

function checkFunctions(modules) {
  const moduleNamesToFunctionsWithMaybeProblems = Mp.pull(
    modules,
    ({moduleName}) => moduleName,
    ({functions}) => Ar.map(functions, fn => checkFunction(fn)),
  );
  const allFunctions = Ar.flatten(moduleNamesToFunctionsWithMaybeProblems);
  const countAllFunctions = Cl.count(allFunctions);
  const functionsWithoutProblems = Ar.filter(
    allFunctions,
    maybeProblem => maybeProblem == null,
  );
  const countFunctionsWithoutProblems = Cl.count(functionsWithoutProblems);
  const percentageCorrect = Str.fromNumber(
    Math.round((100 * countFunctionsWithoutProblems) / countAllFunctions),
  );
  const moduleNamesToFunctionsWithProblems = Mp.filter(
    Mp.map(
      moduleNamesToFunctionsWithMaybeProblems,
      functionsWithMaybeProblems => Ar.filterNulls(functionsWithMaybeProblems),
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
    Cl.forEach(functions, functionWithProblems =>
      printFunction(functionWithProblems),
    );
  });
  console.log(
    `${percentageCorrect}% (${countFunctionsWithoutProblems}/${countAllFunctions}) done.`,
  );
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
  const missingTimeComplexity = doc != null && doc.time == null;
  const missingSpaceComplexity = doc != null && doc.space == null;
  const missingTests = testLineNumber == null;
  if (
    !(
      incompleteDescription ||
      examplesMissingFunction ||
      examplesMissingResults ||
      missingTimeComplexity ||
      missingSpaceComplexity ||
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
    missingTimeComplexity,
    missingSpaceComplexity,
    missingTests,
  };
}

function printFunction({
  functionName,
  incompleteDescription,
  examplesMissingFunction,
  examplesMissingResults,
  missingTimeComplexity,
  missingSpaceComplexity,
  missingTests,
}) {
  const docProblem = incompleteDescription
    ? 'missing doc'
    : examplesMissingFunction
    ? 'bad example'
    : examplesMissingResults
    ? 'example missing result'
    : missingTimeComplexity || missingSpaceComplexity
    ? 'missing complexity note'
    : null;
  const testProblem = missingTests ? 'missing test' : null;

  console.log(
    `      ${functionName}` +
      ` (${Str.join(Ar.filterNulls([docProblem, testProblem]), ', ')})`,
  );
}

function checkTestsStructure(modules) {
  const modulesWithTestsInWrongOrder = Ar.mapMaybe(
    modules,
    ({moduleName, functions, tests}) => {
      const functionNames = Ar.map(functions, ({functionName}) => functionName);
      const functionNamesWithoutEquals = Ar.filter(
        functionNames,
        name => !Str.startsWith(name, 'equal'),
      );
      const testNamesWithoutEquals = Ar.filter(
        tests,
        name => !Str.startsWith(name, 'equal'),
      );
      if (Cl.equals(functionNamesWithoutEquals, testNamesWithoutEquals)) {
        return null;
      }
      const testsInWrongOrder = Ar.unzip(
        Ar.dropFirstWhile(
          Ar.zip(functionNamesWithoutEquals, testNamesWithoutEquals),
          ([functionName, testName]) => functionName === testName,
        ),
      );
      return {moduleName, testsInWrongOrder};
    },
  );
  if (Cl.isEmpty(modulesWithTestsInWrongOrder)) {
    console.log('✅ All test files are correctly ordered!');
    return;
  }
  console.log('❌ Test files with wrong ordering:');
  Cl.forEach(
    modulesWithTestsInWrongOrder,
    ({moduleName, testsInWrongOrder}) => {
      const [functionsInModuleOrder, functionsInTestOrder] = testsInWrongOrder;
      console.log(
        '    ' +
          moduleName +
          ':\n' +
          '      declared: ' +
          Str.join(Ar.takeFirst(functionsInModuleOrder, 5), ', ') +
          '\n' +
          '      test: ' +
          Str.join(Ar.takeFirst(functionsInTestOrder, 5), ', '),
      );
    },
  );

  // get an ordered list of functions from module
  // get an ordered list of functions from test
  // check that they are equal
  // if not print them from the mismatched
  // zip them
  // remove equal ones
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
