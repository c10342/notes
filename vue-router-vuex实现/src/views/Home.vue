<template>
  <div class="home">
    home
    {{$store.state.name}}
  </div>
</template>

<script>

export default {
  name: "Home",
  mounted() {
    // setTimeout(() => {
    //   this.$store.commit("setName");
    // }, 2000);

    this.$store.dispatch("setName");
  }
};
</script>
