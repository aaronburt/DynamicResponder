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

	/**
	 * This method assigns the routes into the 'router' map
	 * @param method - HTTP method such as 'GET' 'POST' etc
	 * @param pathname - HTTP pathname
	 * @param func - HTTP callback function, injected by the user
	 */
	private assignRoute(method: string, pathname: string, func: ResponseFunction) {
		const dynamicPathname: RegExp = new RegExp("^" + pathname.replace(/:([a-zA-Z]+)/g, "([^\\s/]+)") + "$");
		this.router.set(dynamicPathname, { func: func, method: method, pathname: pathname });
	}

	/**
	 * This method will check params to see if the match the dynamic and match the params to the variables.
	 * @param matchedRoute - RegExpMatchArray of route
	 * @param content - RouteEntry from Deno.serve
	 * @returns Record<string, string> of params in k,v format
	 */
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

	/**
	 * @param pathname - Plaintext pathname
	 * @param func - Injected user function
	 */
	public get(pathname: string, func: ResponseFunction) {
		this.assignRoute("GET", pathname, func);
	}

	/**
	 * @param pathname - Plaintext pathname
	 * @param func - Injected user function
	 */
	public post(pathname: string, func: ResponseFunction) {
		this.assignRoute("POST", pathname, func);
	}

	/**
	 * @param pathname - Plaintext pathname
	 * @param func - Injected user function
	 */
	public put(pathname: string, func: ResponseFunction) {
		this.assignRoute("PUT", pathname, func);
	}
	/**
	 * @param pathname - Plaintext pathname
	 * @param func - Injected user function
	 */
	public delete(pathname: string, func: ResponseFunction) {
		this.assignRoute("delete", pathname, func);
	}

	/**
	 * @returns this.router which is a Map<RegExp, RouteEntry>
	 */
	public getRoutes(): Map<RegExp, RouteEntry> {
		return this.router;
	}

	/**
	 * @param port - Defined port number
	 * @param hostname - hostname
	 */
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
