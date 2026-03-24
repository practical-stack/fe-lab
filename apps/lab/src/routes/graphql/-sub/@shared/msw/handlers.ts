import { graphql, HttpResponse, delay } from 'msw'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql as executeGraphQL } from 'graphql'
import { resolvers } from '../schema/resolvers'

// Import SDL as raw text
import sdl from '../schema/schema.graphql?raw'

const schema = makeExecutableSchema({
  typeDefs: sdl,
  resolvers,
})

export const handlers = [
  graphql.operation(async ({ query, variables, operationName }) => {
    // Add realistic network delay
    await delay(300)

    const result = await executeGraphQL({
      schema,
      source: query,
      variableValues: variables,
      operationName,
    })

    return HttpResponse.json(result)
  }),
]
