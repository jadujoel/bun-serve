type InferredType = string | boolean | number | null | undefined | Record<string, unknown> | Array<InferredType>

const NUMERIC_CHARS = '0123456789.' as const
function isNumber(value: string): boolean {
  return NUMERIC_CHARS.includes(value)
}

function isNumberString(value: string) {
  return value.split('').every(isNumber)
}

function inferType(value: string): InferredType {
  if (value === 'null') {
    return null
  }
  if (value === 'undefined') {
    return undefined
  }
  if (value === undefined || value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  if (
    (value.startsWith('[') && value.endsWith(']')) ||
    (value.startsWith('{') && value.endsWith('}'))
    ) {
    return JSON.parse(value)
  }
  if (value.split(',').length > 1) {
    return value.split(',').map(inferType)
  }
  if (isNumberString(value)) {
    return Number(value)
  }
  return value
}

function parseArg(arg: string): Record<string, InferredType> {
  const [key, value] = arg.split("=");
  return { [key.replaceAll('--', '')]: inferType(value) };
}

/**
 * @example
 * ```bash
 * bun cli.ts
 * ```
 * ```typescript
 * // cli.ts
 * parse(process.argv.slice(2) // ['--hello=world', 'num=1.23', '--truthy', '--falsy=false', '--nullish=null', '--list=0,1,foo,null,10,undefined', --json='{"hello": "world"}' --array='[1,{"key":"value"},3]']
 * {
 *   hello: "world",
 *   num: 1.23,
 *   truthy: true,
 *   falsy: false,
 *   nullish: null,
 *   list: [ 0, 1, "foo", null, 10, undefined ],
 *   json: {
 *     hello: "world"
 *   },
 *   array: [1, { key: "value" }, 3]
 * }
 * ```
 */
export function parse(args: readonly string[]): Record<string, InferredType> {
  return args.reduce((acc, arg) => ({ ...acc, ...parseArg(arg) }), {});
}
