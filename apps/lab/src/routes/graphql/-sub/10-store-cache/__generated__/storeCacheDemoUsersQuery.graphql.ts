/**
 * @generated SignedSource<<7bc081017d71b2dee201d462cdd0fd73>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type storeCacheDemoUsersQuery$variables = Record<PropertyKey, never>;
export type storeCacheDemoUsersQuery$data = {
  readonly users: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly email: string;
        readonly id: string;
        readonly name: string;
      };
    }>;
  };
};
export type storeCacheDemoUsersQuery = {
  response: storeCacheDemoUsersQuery$data;
  variables: storeCacheDemoUsersQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 5
      }
    ],
    "concreteType": "UserConnection",
    "kind": "LinkedField",
    "name": "users",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "node",
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
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "users(first:5)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "storeCacheDemoUsersQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "storeCacheDemoUsersQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "177caa704d93660f9ea227f7a6cb04b6",
    "id": null,
    "metadata": {},
    "name": "storeCacheDemoUsersQuery",
    "operationKind": "query",
    "text": "query storeCacheDemoUsersQuery {\n  users(first: 5) {\n    edges {\n      node {\n        id\n        name\n        email\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ebfd5703708b6a0fcd40ae5a4b8a7f21";

export default node;
