import { describe, expect, it } from 'vitest'

import z from 'zod'
import { useForm } from '../src'

describe('useField', () => {
  it('validates the field', async () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { useField } = useForm(schema)
    const name = useField('name')

    // Act
    // @ts-expect-error - we're testing the validation
    name.value.value = 1

    await new Promise(resolve => setTimeout(resolve, 0))

    // Assert
    expect(name.error.value).toEqual('Expected string, received number')
  })
})
