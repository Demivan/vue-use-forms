import type zod from 'zod'

import type { ComputedRef, WritableComputedRef } from 'vue'
import { computed, reactive, shallowRef, watch } from 'vue'
import type { ZodFormattedError } from 'zod/lib/ZodError'
import type { FieldValues, Path, PathValue } from './types/fields'

interface Field<T> {
  readonly value: WritableComputedRef<T>
  readonly error: ComputedRef<string | undefined>
}

interface Form<T extends FieldValues> {
  useField<KeyPath extends Path<T>> (name: KeyPath): Field<PathValue<T, KeyPath>>
}

function getDeepProp<T extends FieldValues, KeyPath extends Path<T>>(obj: T, key: KeyPath): PathValue<T, KeyPath> {
  return key.split('.').reduce((acc, key) => acc[key], obj) as PathValue<T, KeyPath>
}

function setDeepProp<T extends FieldValues, KeyPath extends Path<T>>(obj: T, key: KeyPath, value: PathValue<T, KeyPath>): void {
  // Make sure that we create the path if it doesn't exist
  const keys = key.split('.')
  const lastKey = keys.pop()!

  const lastObj = keys.reduce((acc, key) => {
    if (acc[key] === undefined)
      acc[key] = {}

    return acc[key]
  }, obj as Record<string, any>)

  lastObj[lastKey] = value
}

export function useForm<T extends FieldValues, Schema extends zod.Schema<T>>(schema: Schema) {
  const state: T = reactive({} as T)

  const errors = shallowRef({} as ZodFormattedError<T>)

  watch(() => state, async (state) => {
    const result = await schema.safeParseAsync(state)

    if (result.success)
      errors.value = {} as ZodFormattedError<T>
    else
      errors.value = result.error.format()
  }, { deep: true })

  const form: Form<zod.infer<Schema>> = {
    useField(name) {
      const value = computed({
        get() {
          return getDeepProp(state, name)
        },
        set(value) {
          setDeepProp(state, name, value)
          state[name] = value
        },
      })

      const error = computed(() => getDeepProp(errors.value, name)?._errors?.[0])

      return {
        value,
        error,
      }
    },
  }

  return form
}
