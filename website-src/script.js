// @flow

import {Ar, Cl, Mp, Str, invariant, nullthrows} from '../src/index';

function documentQuerySelectorX(selector) {
  return nullthrows(document.querySelector(selector));
}

const sidebar = documentQuerySelectorX('.sidebar');
const main = documentQuerySelectorX('.main');
const searchBar = document.querySelector('.sidebarSearch input');
const searchBarCancel = documentQuerySelectorX('.sidebarSearchCancel');
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

// Chrome/Firefox/Edge don't remember scroll position properly so fix it

window.addEventListener('hashchange', maybeGoToCurrentHashTarget);
maybeGoToCurrentHashTarget();

window.addEventListener('load', () => {
  setTimeout(loadState, 1);
});

window.addEventListener('popstate', loadState);

function maybeGoToCurrentHashTarget() {
  const targetName = hashToName(location.hash);
  if (targetName != null) {
    scrollIntoView(targetName);
  }
}

function hashToName(hash) {
  const id = Str.dropFirst(hash, 1);
  return Str.isEmpty(id) ? null : id;
}

function scrollIntoView(targetName) {
  // Only scroll to element if we don't have a stored scroll position.
  if (history.state == null) {
    const hashTarget =
      document.getElementById(targetName) ||
      document.getElementsByName(targetName)[0];
    if (hashTarget != null) {
      hashTarget.scrollIntoView();
    }
  }
}

function updateState() {
  history.replaceState({contentScrollPosition: main.scrollTop}, document.title);
}

function loadState(event) {
  if (event != null) {
    // Edge doesn't replace change history.state on popstate.
    history.replaceState(event.state, document.title);
  }
  if (history.state != null) {
    main.scrollTop = history.state.contentScrollPosition;
  }
  setTimeout(updateState, 1);
}
