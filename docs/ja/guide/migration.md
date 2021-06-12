# 旧バージョンからの移行

## v2.0.0 への移行

### 互換性を損なう変更

新しいChart.jsのバージョンへの移行に伴う、より一般的な互換性を損なう変更の影響を受ける可能性がありますので、[Chart.js v3 移行ガイド](https://www.chartjs.org/docs/latest/getting-started/v3-migration.html)も必ずお読みください。

#### 明示的なプラグイン登録

[使い方](getting-started.md#モジュール)で説明したように、モジュールバンドラーを使ってビルドする際には、このプラグインを手動で登録する必要があります。

```js
import {Chart} from 'chart.js';
import ChartStreaming from 'chartjs-plugin-streaming';

Chart.register(ChartStreaming);
```

#### デフォルトオプション

本プラグインのデフォルトオプションは、`Chart.defaults.global.plugins.streaming.*`ではなく、`Chart.defaults.plugins.streaming.*` で指定するようになり、以下の方法で変更できます。

```js
Chart.defaults.set('plugins.streaming', {
  duration: 20000,
  // ...
});
```

詳しくは、[使い方 &rsaquo; 設定](getting-started.html#設定) をご覧ください。

#### Time スケールのオーバーライド

歴史的な理由により、前バージョンでは 'realtime' スケールだけでなく 'time' スケールでも自動スクロールが有効になっていました。バージョン2.xでは、'realtime' スケールでのみ自動スクロールが有効になっています。

#### Update のトランジションモード

`onRefresh` コールバック関数の外側でデータを追加する場合、`chart.update()` を明示的に呼び出す必要があります。実行中のアニメーションを中断させないために、前バージョンでは `update` 関数で `preservation` 設定プロパティをサポートしていましたが、本バージョンではサポートされません。

Chart.js v3 ではトランジションモードを指定する引数が導入され、本プラグインではこの目的のために `'quiet'` モードをサポートしています。

```js
chart.update('quiet');
```

詳しくは、[データフィードモデル &rsaquo; プルモデル（ポーリング型） - 非同期](data-feed-models.html#プルモデル-ポーリング型-非同期) をご覧ください。

