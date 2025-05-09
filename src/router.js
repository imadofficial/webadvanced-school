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
        
        const path = window.location.hash.slice(1) || '/';
        const route = this.routes[path] || this.routes['404'];
        
        this.rootElm.innerHTML = '';
        route(this.rootElm);
    }
}

export default Router;