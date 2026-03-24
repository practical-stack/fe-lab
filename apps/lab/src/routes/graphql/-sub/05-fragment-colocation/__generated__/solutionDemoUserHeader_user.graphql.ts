/**
 * @generated SignedSource<<b9e218b3dd1ab345ceb9bb0392de17d6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type solutionDemoUserHeader_user$data = {
  readonly avatar: string | null | undefined;
  readonly email: string;
  readonly name: string;
  readonly " $fragmentType": "solutionDemoUserHeader_user";
};
export type solutionDemoUserHeader_user$key = {
  readonly " $data"?: solutionDemoUserHeader_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"solutionDemoUserHeader_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "solutionDemoUserHeader_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatar",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "80af3ac5d42ddba218b31286ab5a7d24";

export default node;
