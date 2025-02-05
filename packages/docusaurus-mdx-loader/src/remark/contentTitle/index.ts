/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import visit, {EXIT} from 'unist-util-visit';
// @ts-expect-error: TODO see https://github.com/microsoft/TypeScript/issues/49721
import type {Transformer} from 'unified';
import type {Heading} from 'mdast';

// TODO as of April 2023, no way to import/re-export this ESM type easily :/
// TODO upgrade to TS 5.3
// See https://github.com/microsoft/TypeScript/issues/49721#issuecomment-1517839391
// import type {Plugin} from 'unified';
type Plugin = any; // TODO fix this asap

interface PluginOptions {
  removeContentTitle?: boolean;
}

/**
 * A remark plugin to extract the h1 heading found in Markdown files
 * This is exposed as "data.contentTitle" to the processed vfile
 * Also gives the ability to strip that content title (used for the blog plugin)
 */
const plugin: Plugin = function plugin(
  options: PluginOptions = {},
): Transformer {
  // content title is
  const removeContentTitle = options.removeContentTitle ?? false;

  return async (root, vfile) => {
    const {toString} = await import('mdast-util-to-string');
    visit(root, 'heading', (headingNode: Heading, index, parent) => {
      if (headingNode.depth === 1) {
        vfile.data.compilerName;
        vfile.data.contentTitle = toString(headingNode);
        if (removeContentTitle) {
          parent!.children.splice(index, 1);
        }
        return EXIT; // We only handle the very first heading
      }
      // We only handle contentTitle if it's the very first heading found
      if (headingNode.depth >= 1) {
        return EXIT;
      }
      return undefined;
    });
  };
};

export default plugin;
