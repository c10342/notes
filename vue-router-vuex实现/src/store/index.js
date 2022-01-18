import Vue from "vue";
import Vuex from "./vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    name: "张三",
  },
  mutations: {
    setName(state) {
      state.name = "李四";
    },
  },
  actions: {
    setName({ commit }) {
      setTimeout(() => {
        commit("setName");
      }, 2000);
    },
  },
  modules: {},
});
