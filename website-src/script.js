// @flow

import {Ar, Cl, Mp, Str, invariant, nullthrows} from '../src/index';

const sidebar = nullthrows(document.querySelector('.sidebar'));
const searchBar = document.querySelector('.sidebarSearch input');
const searchBarCancel = nullthrows(
  document.querySelector('.sidebarSearchCancel'),
);
const moduleExpanders = document.querySelectorAll('.sidebar .moduleExpander');
const moduleLinks = document.querySelectorAll('.sidebar a.module');
const moduleExpandersToFunctions = Mp.fromKeys(
  moduleExpanders,
  moduleExpander => moduleExpander.querySelectorAll('.function'),
);

Cl.forEach(moduleLinks, link => {
  link.addEventListener(
    'click',
    (event: MouseEvent) => {
      if (!sidebar.classList.contains('searched')) {
        invariant(event.target instanceof Node);
        const parent = event.target.parentNode;
        invariant(parent instanceof Element);
        parent.classList.toggle('open');
      }
    },
    true,
  );
});

invariant(searchBar instanceof HTMLInputElement);
searchBar.addEventListener('input', onSearchUpdate);
searchBarCancel.addEventListener('click', cancelSearch);
nullthrows(document.body).addEventListener('keyup', (event: KeyboardEvent) => {
  if (event.code === 'Escape') {
    cancelSearch();
    searchBar.blur();
  }
});

function cancelSearch() {
  searchBar.value = '';
  onSearchUpdate();
}

function onSearchUpdate() {
  const searched = searchBar.value;
  const isSearched = !Str.isEmpty(searched);
  sidebar.classList.toggle('searched', isSearched);
  const hasMatch = Cl.any(
    Ar.map(moduleExpandersToFunctions, (functionLinks, moduleExpander) => {
      const hasModuleMatch = Cl.any(
        Ar.map(functionLinks, link => {
          const matches =
            isSearched &&
            Str.ignoreCase(link.textContent, searched, Str.includes);
          link.classList.toggle('matchesSearch', matches);
          return matches;
        }),
      );
      moduleExpander.classList.toggle('hasSearchMatch', hasModuleMatch);
      return hasModuleMatch;
    }),
  );
  searchBar.classList.toggle('noMatch', isSearched && !hasMatch);
}
