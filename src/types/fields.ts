type ArrayKey = number

type PathImpl<K extends string | number, V> = V extends Primitive
  ? `${K}`
  : K extends number
    ? `${K}` | `${K}.${Path<V>}` | `[${K}]${Path<V>}]`
    : `${K}` | `${K}.${Path<V>}`

type FieldValues = Record<string, any>

type Path<T> = T extends ReadonlyArray<infer V>
  ? IsArray<T> extends true
    ? {
        [K in TupleKey<T>]-?: PathImpl<K & string, T[K]>;
      }[TupleKey<T>]
    : PathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: PathImpl<K & string, T[K]>;
    }[keyof T]

type FieldPath<TFieldValues extends object> = Path<TFieldValues>

type Primitive = null | undefined | string | number | boolean | symbol | bigint

type IsArray<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true
type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>

type PathValue<T, P extends Path<T>> = T extends any
  ? P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K]>
        ? PathValue<T[K], R>
        : never
      : K extends `${ArrayKey}`
        ? T extends ReadonlyArray<infer V>
          ? PathValue<V, R & Path<V>>
          : never
        : never
    : P extends keyof T
      ? T[P]
      : P extends `${ArrayKey}`
        ? T extends ReadonlyArray<infer V>
          ? V
          : never
        : never
  : never

type _FieldPathValue<
  TFieldValues extends FieldValues, TFieldPath extends FieldPath<TFieldValues>,
> = PathValue<TFieldValues, TFieldPath>
