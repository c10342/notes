let Vue;

class Router {
  constructor({ routes }) {
    //   routes
    this.routeMap = routes.reduce((memo, current) => {
      memo[current.path] = current.component;
      return memo;
    }, {});
    //   this.route = { current: "/" };

    // Vue.util.defineReactive(this, "route", { current: "/" });
    this.route = Vue.observable({ current: "/" });

    window.addEventListener("load", () => {
      //   默认跳转到首页
      location.hash ? "" : (location.hash = "/");
    });

    window.addEventListener("hashchange", () => {
      this.route.current = location.hash.slice(1);
    });
  }
}

Router.install = (_Vue) => {
  Vue = _Vue;
  Vue.mixin({
    beforeCreate() {
      // this._router === new Router()
      // 判断根组件是谁
      if (this.$options && this.$options.router) {
        // 根组件
        this._router = this.$options.router;
      } else {
        //   让所有的子组件，都有_router属性，指向当前router
        this._router = this.$parent && this.$parent._router;
      }

      // 每个组件都有$route,$router
      //   Object.defineProperty(this, "$route", {});
      //   Object.defineProperty(this, "$router", {});
    },
  });

  Vue.component("router-link", {
    props: {
      to: String,
    },
    render() {
      return <a href={`#${this.to}`}>{this.$slots.default}</a>;
    },
  });
  Vue.component("router-view", {
    render(h) {
      return h(this._router.routeMap[this._router.route.current]);
    },
  });
};

export default Router;
