// @flow

import {Cl} from '../src/index';

const collapsible = document.querySelectorAll('.sidebar a.module');
Cl.forEach(collapsible, link => {
  link.addEventListener(
    'click',
    (e: MouseEvent) => {
      const parent = ((((e.target: any): Node).parentNode: any): Element);
      parent.classList.toggle('open');
    },
    true,
  );
});
