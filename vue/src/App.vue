<template>
  <div>
    <img src="./logo.svg" alt="Logo">
    <h2>Rectangle Creator</h2>
    <p>
      Count:
      <input type="number" v-model.number="count" value="2" />
    </p>
    <button @click="create">Create</button>
    <button @click="cancel">Cancel</button>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      count: 2
    };
  },
  methods: {
    create: function() {
      const count = parseInt(this.count, 10);
      console.log(count);
      parent.postMessage(
        { pluginMessage: { type: "create-rectangles", count } },
        "*"
      );
    },
    cancel: function() {
      parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
    }
  },
  created() {}
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>