class Router {
    constructor(routes) {
        this.routes = routes;
        this.rootElm = document.getElementById('app');

        window.addEventListener('DOMContentLoaded', () => {
            this.rootElm = document.getElementById('app');
            this.handleRouteChange();
        });

        window.addEventListener('hashchange', () => this.handleRouteChange());
    }

    handleRouteChange() {
        if (!this.rootElm) {
            this.rootElm = document.getElementById('app');
        }

        const path = window.location.hash.slice(1).split('?')[0] || '/';
        const queryParams = this.getQueryParams();
        const route = this.routes[path] || this.routes['404'];

        this.rootElm.innerHTML = '';
        route(this.rootElm, queryParams);
    }

    getQueryParams() {
        const queryString = window.location.hash.split('?')[1];
        const params = new URLSearchParams(queryString);
        const queryParams = {};
        
        params.forEach((value, key) => {
            queryParams[key] = value;
        });

        return queryParams;
    }
}

export default Router;
