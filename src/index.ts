import type zod from 'zod'

import type { ComputedRef, WritableComputedRef } from 'vue'
import { computed, reactive, shallowRef, watch } from 'vue'

interface Field<T> {
  readonly value: WritableComputedRef<T>
  readonly error: ComputedRef<string | undefined>
}

interface Form<T extends FieldValues> {
  useField<KeyPath extends Path<T>> (name: KeyPath): Field<PathValue<T, KeyPath>>
}

export function useForm<Schema extends zod.Schema>(schema: Schema) {
  const state = reactive({} as zod.infer<Schema>)

  const errors = shallowRef({} as Record<string, string[] | undefined>)

  watch(() => state, async (state) => {
    const result = await schema.safeParseAsync(state)

    if (result.success)
      errors.value = {}
    else
      errors.value = result.error.flatten().fieldErrors
  }, { deep: true })

  const form: Form<zod.infer<Schema>> = {
    useField(name) {
      const value = computed({
        get() {
          return state[name] // TODO: handle nested fields
        },
        set(value) {
          state[name] = value
        },
      })

      const error = computed(() => errors.value[name]?.[0])

      return {
        value,
        error,
      }
    },
  }

  return form
}
