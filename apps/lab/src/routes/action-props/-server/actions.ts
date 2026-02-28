import { createServerFn } from '@tanstack/react-start'
import { delay } from '~/lib/utils'

export const changeTab = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    await delay(800)
    return data
  })

export const saveText = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    await delay(1000)
    return data
  })
