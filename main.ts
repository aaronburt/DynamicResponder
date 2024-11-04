import DynamicResponder from "./responder.ts";

const app = new DynamicResponder();

app.get("/user/:id", (req: Request) => {
  console.log(req.params);
  return new Response(req.params.id);
});

app.start(80);

