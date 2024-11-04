import { assertEquals } from "@std/assert";
import DynamicResponder from "./responder.ts";

const testPort = 8080;


/* SERVER */ 
const app = new DynamicResponder();

app.get("/user/:id", (req: Request) => {
    return new Response(req.params.id);
});

app.get("/:id", (req: Request) => {
    return new Response(req.params.id);
});
  
app.get("/", (_req: Request) => {
    return new Response("This is a standard response");
});

app.start(testPort);


Deno.test(async function userParamResponse() {
    const response = await fetch(`http://localhost:${testPort}/user/testaccount`);
    const text = await response.text();
    assertEquals(text, "testaccount", "Param response is unexpected")
});

Deno.test(async function idParamResponse() {
    const response = await fetch(`http://localhost:${testPort}/test`);
    const text = await response.text();
    assertEquals(text, "test", "Param response is unexpected")
});

Deno.test(async function defaultResponse() {
    const response = await fetch(`http://localhost:${testPort}/`);
    const text = await response.text();
    assertEquals(text, "This is a standard response", "Param response is unexpected")
});