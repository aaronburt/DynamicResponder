export interface CustomRequest extends Request {
	params: Record<string, string>;
}

export type ResponseFunction = ((req: CustomRequest) => Response) | ((req: CustomRequest) => Promise<Response>);

export interface RouteEntry {
	func: ResponseFunction;
	method: string;
	pathname: string;
}

export default class DynamicResponder {
	private router: Map<RegExp, RouteEntry> = new Map();

	private assignRoute(method: string, pathname: string, func: ResponseFunction) {
		const dynamicPathname: RegExp = new RegExp("^" + pathname.replace(/:([a-zA-Z]+)/g, "([^\\s/]+)") + "$");
		this.router.set(dynamicPathname, { func: func, method: method, pathname: pathname });
	}

	private dynParamAssigner(matchedRoute: RegExpMatchArray, content: RouteEntry) {
		const params: string[] = matchedRoute.slice(1).filter((item) => typeof item === "string");
		return content.pathname
			.split("/")
			.filter((segment) => segment.startsWith(":"))
			.reduce((acc, segment, index) => {
				const key = segment.slice(1);
				acc[key] = params[index];
				return acc;
			}, {} as Record<string, string>);
	}

	public get(pathname: string, func: ResponseFunction) {
		this.assignRoute("GET", pathname, func);
	}

	public post(pathname: string, func: ResponseFunction) {
		this.assignRoute("POST", pathname, func);
	}

	public put(pathname: string, func: ResponseFunction) {
		this.assignRoute("PUT", pathname, func);
	}

	public delete(pathname: string, func: ResponseFunction) {
		this.assignRoute("delete", pathname, func);
	}

	public getRoutes(): Map<RegExp, RouteEntry> {
		return this.router;
	}

	start(port: number, hostname: string = "0.0.0.0") {
		Deno.serve({ port: port, hostname: hostname }, (req: Request) => {
			const { pathname } = new URL(req.url);

			//https://jsr.io/docs/about-slow-types#global-augmentation
			const CustomRequest: CustomRequest = req as CustomRequest;

			for (const [route, content] of this.router) {
				if (content.method === req.method) {
					const match: RegExpMatchArray | null = pathname.match(route);
					if (match !== null) {
						const mappedParams: Record<string, string> = this.dynParamAssigner(match, content);
						CustomRequest.params = mappedParams;
						return content.func(CustomRequest);
					}
				}
			}

			return new Response("404", { status: 404 });
		});
	}
}
