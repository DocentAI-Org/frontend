/**
 * The demo deployment (DEMO_MODE=on): there is no backend, so the app's API and Auth clients
 * are answered in process by the typed mock with sample data (tests/app/mock-api/demo.ts).
 */
// Never contacted: demoFetch answers every request to it in process.
export const DEMO_ORIGIN = "https://demo.invalid";

export function isDemo(): boolean {
  return process.env.DEMO_MODE === "on";
}

export const demoFetch: typeof fetch = async (input, init) => {
  const { handleDemo } = await import("../../tests/app/mock-api/demo.ts");
  return handleDemo(new Request(input, init));
};
