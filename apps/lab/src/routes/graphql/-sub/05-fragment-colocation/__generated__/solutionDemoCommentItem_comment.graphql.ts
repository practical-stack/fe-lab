/**
 * @generated SignedSource<<0354be5c084ae975c2bd476b9e7fef0f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type solutionDemoCommentItem_comment$data = {
  readonly author: {
    readonly name: string;
  };
  readonly body: string;
  readonly " $fragmentType": "solutionDemoCommentItem_comment";
};
export type solutionDemoCommentItem_comment$key = {
  readonly " $data"?: solutionDemoCommentItem_comment$data;
  readonly " $fragmentSpreads": FragmentRefs<"solutionDemoCommentItem_comment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "solutionDemoCommentItem_comment",
  "selections": [
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
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": null
};

(node as any).hash = "58ce26926c59e2d7078f7d37d580901f";

export default node;
