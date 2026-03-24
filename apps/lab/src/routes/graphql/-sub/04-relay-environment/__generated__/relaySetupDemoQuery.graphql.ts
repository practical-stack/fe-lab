/**
 * @generated SignedSource<<95c1238ca632cfe282ef3903336a135f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type relaySetupDemoQuery$variables = {
  id: string;
};
export type relaySetupDemoQuery$data = {
  readonly user: {
    readonly avatar: string | null | undefined;
    readonly email: string;
    readonly id: string;
    readonly name: string;
  } | null | undefined;
};
export type relaySetupDemoQuery = {
  response: relaySetupDemoQuery$data;
  variables: relaySetupDemoQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "relaySetupDemoQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "relaySetupDemoQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ccad8981c88fda5a686d6f262a24530e",
    "id": null,
    "metadata": {},
    "name": "relaySetupDemoQuery",
    "operationKind": "query",
    "text": "query relaySetupDemoQuery(\n  $id: ID!\n) {\n  user(id: $id) {\n    id\n    name\n    email\n    avatar\n  }\n}\n"
  }
};
})();

(node as any).hash = "6a7214946c7ad4db00a6a12b7f975204";

export default node;
