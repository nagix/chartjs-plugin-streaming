# メイン App コンポーネントを編集する

まず、メインとなるトップレベルのコンポーネントから見ていきます。Vue CLI が生成したメインコンポーネントが src/App.vue に置かれています。ここでは、この後で作成する `MyChart` コンポーネントをインポートします。

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
