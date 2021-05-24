# Edit a main App component

First, we'll start with the main top level component. The Vue CLI already generates a main component that can be found in src/App.vue. We import the `MyChart` component which will be created later.

#### src/App.vue

```html
<template>
  <div id="app">
    <MyChart />
  </div>
</template>

<script>
import MyChart from './components/MyChart.vue'

export default {
  name: 'app',
  components: {
    MyChart
  }
}
</script>
```
