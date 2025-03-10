import { ApiRoutes } from './api.routes';

export abstract class ApiCalls {
    constructor(protected apiRoutes: ApiRoutes) {}
}
