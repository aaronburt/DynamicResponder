declare global {
    interface Request {
        params: string[];
    }
}

export type ResponseFunction = ((req: Request) => Response) | ((req: Request) => Promise<Response>)

export interface RouteEntry {
    func: ResponseFunction;   
    method: string; 
    pathname: string;     
}

export default class DynamicResponder {

    public router: Map<RegExp, RouteEntry> = new Map();

    assignRoute(method: string, pathname: string, func: ResponseFunction){
        const dynamicPathname: RegExp = new RegExp('^' + pathname.replace(/:([a-zA-Z]+)/g, '([^\\s/]+)') + '$');
        this.router.set(dynamicPathname, { func: func, method: method, pathname: pathname });
    }

    get(pathname: string, func: ResponseFunction) {
        this.assignRoute('GET', pathname, func);
    }

    post(pathname: string, func: ResponseFunction) {
        this.assignRoute('POST', pathname, func);
    }

    put(pathname: string, func: ResponseFunction) {
        this.assignRoute('PUT', pathname, func);
    }

    start(port: number, hostname: string = "0.0.0.0"){
        Deno.serve({ port: port, hostname: hostname }, (req: Request) => {
            const { pathname } = new URL(req.url);

            for(const [route, content] of this.router){
                if(content.method === req.method){
                    const match = pathname.match(route);
                    if(match !== null){
                        const params: string[] = match.slice(1).filter(item => typeof item === 'string'); 
                        req.params = params;
                        return content.func(req)
                    }
                }
            }

            return new Response("404", { status: 404 })
        })
    }


}
