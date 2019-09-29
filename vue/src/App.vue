<template>
  <div>
    <img src="./logo.svg" alt="Logo" />
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
body {
  font: 12px sans-serif;
  text-align: center;
  margin: 20px;
}
button {
  border-radius: 5px;
  background: white;
  color: black;
  border: none;
  padding: 8px 15px;
  margin: 0 5px;
  box-shadow: inset 0 0 0 1px black;
  outline: none;
}
#create {
  box-shadow: none;
  background: #18a0fb;
  color: white;
}
input {
  border: none;
  outline: none;
  padding: 8px;
}
input:hover {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}
button:focus {
  box-shadow: inset 0 0 0 2px #18a0fb;
}
#create:focus {
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.3);
}
input:focus {
  box-shadow: inset 0 0 0 2px #18a0fb;
}
</style>