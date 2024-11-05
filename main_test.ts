import { assertEquals } from "@std/assert";
import DynamicResponder from "./main.ts";
import type { CustomRequest } from "./responder.ts";

const testPort = 8080;

/* SERVER */
const app = new DynamicResponder();

app.get("/user/:id", (req: CustomRequest) => {
	return new Response(req.params.id);
});

app.get("/:id", (req: CustomRequest) => {
	return new Response(req.params.id);
});

app.get("/", (_req: CustomRequest) => {
	return new Response("This is a standard response");
});

app.start(testPort);

Deno.test(async function userParamResponse() {
	const response = await fetch(`http://localhost:${testPort}/user/testaccount`);
	const text = await response.text();
	assertEquals(text, "testaccount", "User param response is unexpected");
});

Deno.test(async function idParamResponse() {
	const response = await fetch(`http://localhost:${testPort}/test`);
	const text = await response.text();
	assertEquals(text, "test", "ID param response is unexpected");
});

Deno.test(async function defaultResponse() {
	const response = await fetch(`http://localhost:${testPort}/`);
	const text = await response.text();
	assertEquals(text, "This is a standard response", "Default response is unexpected");
});

Deno.test(async function invalidUserParam() {
	const response = await fetch(`http://localhost:${testPort}/user/invalid`);
	const text = await response.text();
	assertEquals(text, "invalid", "Invalid user param response is unexpected");
});

Deno.test(async function nonexistentRoute() {
	const response = await fetch(`http://localhost:${testPort}/thisisnt/nonexistent`);
	await response.body?.cancel(); // Cancelled the body to remove memory leaks
	assertEquals(response.status, 404, "Nonexistent route did not return 404");
});

Deno.test(async function rootWithQueryParams() {
	const queryParam = "foo=bar";

	const response = await fetch(`http://localhost:${testPort}/?${queryParam}`);
	const responseUrl = new URL(response.url);
	const responseSearchParam: string = responseUrl.searchParams.toString();
	const text = await response.text();
	assertEquals(responseSearchParam, queryParam, "Query param is response is unexpected");
	assertEquals(text, "This is a standard response", "Root with query params response is unexpected");
});
