class Router{
    constructor(routes){
        this.routes = routes;
        this.rootElm = document.getElementById('app');

        window.addEventListener('hashchange', () => this.handleRouteChange());
        this.handleRouteChange();
    }

    handleRouteChange(){
        const path = window.location.hash.slice(1) || '/';
        const route = this.routes[path] || this.route['404'];
        this.rootElm.innerHTML = '';
        route(this.rootElm);
    }
}

export default Router;