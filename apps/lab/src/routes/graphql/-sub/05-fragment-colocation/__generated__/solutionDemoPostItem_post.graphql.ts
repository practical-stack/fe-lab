/**
 * @generated SignedSource<<4e79e537a9d4114fa7b63ec5c5b997cd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type solutionDemoPostItem_post$data = {
  readonly body: string;
  readonly comments: ReadonlyArray<{
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"solutionDemoCommentItem_comment">;
  }>;
  readonly createdAt: string;
  readonly title: string;
  readonly " $fragmentType": "solutionDemoPostItem_post";
};
export type solutionDemoPostItem_post$key = {
  readonly " $data"?: solutionDemoPostItem_post$data;
  readonly " $fragmentSpreads": FragmentRefs<"solutionDemoPostItem_post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "solutionDemoPostItem_post",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "body",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Comment",
      "kind": "LinkedField",
      "name": "comments",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "solutionDemoCommentItem_comment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "6926bc9ca26de299b157a4e526d1b5b5";

export default node;
