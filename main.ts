import DynamicResponder from "./dynamicResponder.ts";

const app = new DynamicResponder();

app.get("/", (_req: Request) => {
  return new Response('Testing')
});

app.start(80);

