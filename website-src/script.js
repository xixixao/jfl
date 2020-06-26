// @flow

import {Ar, Cl, Str, invariant, nullthrows} from '../src/index';

const collapsible = document.querySelectorAll('.sidebar a.module');
Cl.forEach(collapsible, link => {
  link.addEventListener(
    'click',
    (event: MouseEvent) => {
      invariant(event.target instanceof Node);
      const parent = event.target.parentNode;
      invariant(parent instanceof Element);
      parent.classList.toggle('open');
    },
    true,
  );
});

const sidebar = nullthrows(document.querySelector('.sidebar'));
const searchBar = document.querySelector('.sidebarSearch input');
const functionLinks = document.querySelectorAll('.sidebar a.function');
const searchBarCancel = nullthrows(
  document.querySelector('.sidebarSearchCancel'),
);
invariant(searchBar instanceof HTMLInputElement);
searchBar.addEventListener('input', onSearchUpdate);
searchBarCancel.addEventListener('click', cancelSearch);
searchBar.addEventListener('keyup', (event: KeyboardEvent) => {
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
  sidebar.classList.toggle('searched', !Str.isEmpty(searched));
  let hasMatch = false;
  Cl.forEach(functionLinks, link => {
    const matches = Str.ignoreCase(link.textContent, searched, Str.includes);
    link.classList.toggle('matchesSearch', matches);
    hasMatch = hasMatch || matches;
  });
  searchBar.classList.toggle('noMatch', !hasMatch);
}
