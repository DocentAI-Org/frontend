/** A typed confirmation matches its phrase ignoring case and surrounding spaces (spec 017). */
export function samePhrase(typed: string, phrase: string): boolean {
  const norm = (value: string) => value.trim().toLocaleLowerCase("es");
  return phrase.trim() !== "" && norm(typed) === norm(phrase);
}
