import { describe, expectTypeOf, it } from 'vitest'

import z from 'zod'
import { useForm } from '../src'

describe('useField', () => {
  it('schema keys', () => {
    // Arrange
    const schema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email().optional(),
    })

    // Act
    const { useField } = useForm(schema)

    // Assert
    expectTypeOf<Parameters<typeof useField>>().toEqualTypeOf<['id' | 'name' | 'email']>()
  })

  it('deep schema keys', () => {
    // Arrange
    const schema = z.object({
      id: z.number(),
      basicInfo: z.object({
        name: z.string(),
        email: z.string().email().optional(),
      }),
    })

    // Act
    const { useField } = useForm(schema)

    // Assert
    expectTypeOf<Parameters<typeof useField>>().toEqualTypeOf<['id' | 'basicInfo' | 'basicInfo.name' | 'basicInfo.email']>()
  })

  it('deep field type', () => {
    // Arrange
    const schema = z.object({
      id: z.number(),
      basicInfo: z.object({
        name: z.string(),
        email: z.string().email().optional(),
      }),
    })

    // Act
    const { useField } = useForm(schema)

    // Assert
    expectTypeOf(useField('id').value.value).toEqualTypeOf<number>()
    expectTypeOf(useField('basicInfo.name').value.value).toEqualTypeOf<string>()
    expectTypeOf(useField('basicInfo.email').value.value).toEqualTypeOf<string | undefined>()
  })
})
