'use babel';

import { paramCase, snakeCase, pascalCase } from 'change-case';

function standardPathBuilderFactory(moduleSeparator, fileNameCasing) {
  return function pathBuilder(text) {
    return text.split(moduleSeparator).map(fileNameCasing).join('/')
  }
}

export const rb = { pathBuilder: standardPathBuilderFactory('::', snakeCase) };
export const js = { pathBuilder: standardPathBuilderFactory('.', paramCase) };
export const cs = { pathBuilder: standardPathBuilderFactory('.', pascalCase) };
export const none = { pathBuilder: standardPathBuilderFactory('.', paramCase) };
