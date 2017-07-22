'use babel';

import path from 'path';
import { paramCase, snakeCase, pascalCase } from 'change-case';

function standardPathBuilderFactory(moduleSeparator, fileNameCasing) {
  function pathBuilder(text) {
    return text.split(moduleSeparator).map(fileNameCasing).join('/')
  }

  return function (filePath, selectedText) {
    const ext = path.extname(filePath);
    const dir = path.dirname(filePath);
    const newFilePath = pathBuilder(selectedText)
    return `${dir}/${newFilePath}${ext}`;
  }
}

const langs = {};
langs.rb = {
  pathBuilder: standardPathBuilderFactory('::', snakeCase),
  commentPrefix: '#'
};
langs.js = {
  pathBuilder: standardPathBuilderFactory('.', paramCase),
  commentPrefix: '//'
};
langs.cs = {
  pathBuilder: standardPathBuilderFactory('.', pascalCase),
  commentPrefix: '//'
};
langs.none = {
  pathBuilder: standardPathBuilderFactory('.', paramCase),
  commentPrefix: ''
};

export default function (filePath) {
  const ext = path.extname(filePath).replace(/^\./, '');
  return langs[ext] || langs.none;
}
