/**
 * What is wrong with a question's answer options, as a `teacher.questions` message key: each one
 * filled in and no two the same, ignoring case (008 US1 AS5, 010 US1 AS2). Expects trimmed text.
 */
export function optionsProblem(options: string[]): "optionsRequired" | "optionsDistinct" | undefined {
  if (options.some((o) => !o)) return "optionsRequired";
  if (new Set(options.map((o) => o.toLocaleLowerCase())).size !== options.length) return "optionsDistinct";
  return undefined;
}
