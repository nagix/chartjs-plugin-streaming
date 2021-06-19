# 使い方

## インストール

### npm

[![npm](https://img.shields.io/npm/v/chartjs-plugin-streaming.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chartjs-plugin-streaming) [![npm downloads](https://img.shields.io/npm/dm/chartjs-plugin-streaming.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chartjs-plugin-streaming)

```sh
npm install chartjs-plugin-streaming --save
```

::: tip 補足
このプラグインは、[Bower](https://bower.io/) を使ってインストールすることもできます。
:::

### CDN

[![jsdelivr](https://img.shields.io/npm/v/chartjs-plugin-streaming.svg?label=jsdelivr&style=flat-square&maxAge=600)](https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@latest/dist/) [![jsdelivr hits](https://data.jsdelivr.com/v1/package/npm/chartjs-plugin-streaming/badge)](https://www.jsdelivr.com/package/npm/chartjs-plugin-streaming)

デフォルトでは、`https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming` は最新の（圧縮された）バージョンを返しますが、互換性を損なう変更を避けるために、常にバージョンを指定することを[**強くお勧めします**](https://www.jsdelivr.com/features)。これは、URL に `@{version}` を追加することで実現できます。

```
https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@2.0.0    // 厳密なバージョン
https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@2        // 最新の 2.x.x
```

jsDeliver のバージョニングについては、同サービスの[ウェブサイト](http://www.jsdelivr.com/)をご覧ください。

### ダウンロード

[![github](https://img.shields.io/github/release/nagix/chartjs-plugin-streaming.svg?style=flat-square&maxAge=600)](https://github.com/nagix/chartjs-plugin-streaming/releases/latest) [![github downloads](https://img.shields.io/github/downloads/nagix/chartjs-plugin-streaming/total.svg?style=flat-square&maxAge=600)](http://www.somsubhra.com/github-release-stats/?username=nagix&repository=chartjs-plugin-streaming)

最新版の `chartjs-plugin-streaming` は、[GitHub Releases](https://github.com/nagix/chartjs-plugin-streaming/releases/latest)からダウンロードできます。

- `chartjs-plugin-streaming.js`（開発向けに推奨）
- `chartjs-plugin-streaming.min.js`（製品向けに推奨）
- `chartjs-plugin-streaming.esm.js`
- `chartjs-plugin-streaming.tgz`（すべてのビルドを含む）
- `chartjs-plugin-streaming.zip`（すべてのビルドを含む）

## 設置

### HTML

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.3.2"></script>
<script src="https://cdn.jsdelivr.net/npm/luxon@1.27.0"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.0.0"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@2.0.0"></script>
```

::: warning 重要
`chartjs-plugin-streaming` は、Chart.js、日付操作ライブラリ、対応するアダプターの**後に**ロードする必要があります！
:::

このプラグインを使用するためには、日付操作ライブラリとそれに対応するアダプターの両方が存在する必要があります。上の例では [Luxon](https://moment.github.io/luxon/) を使用していますが、[利用可能なアダプター](https://github.com/chartjs/awesome#adapters)の中から選択することもできます。

script タグを使用する場合は、登録は必要ありません。

### モジュール

```javascript
import {Chart} from 'chart.js';
import 'chartjs-adapter-luxon';
import ChartStreaming from 'chartjs-plugin-streaming';

Chart.register(ChartStreaming);
```

インポートされたプラグインは、グローバルに登録する必要があります。

::: warning 重要
`chartjs-plugin-streaming` はインラインプラグインとしては機能しません。[Chart.js &rsaquo; Using plugins](https://www.chartjs.org/docs/latest/developers/plugins.html) も参照してください。
:::

## 設定

[プラグインオプション](options.md) は3つのレベルで変更可能で、以下の優先順位で評価されます。

- 軸ごと：`options.scales[scaleId].realtime.*`
- チャートごと：`options.plugins.streaming.*`
- グローバル：`Chart.defaults.plugins.streaming.*`

例:

```js
// すべてのチャートのデフォルトオプションを変更
Chart.defaults.set('plugins.streaming', {
  duration: 20000
});

const chart = new Chart(ctx, {
  options: {
    plugins: {
      // このチャートのすべての軸のオプションを変更
      streaming: {
        duration: 20000
      }
    },
    scales: {
      x: {
        type: 'realtime',
        // この軸のオプションのみを変更
        realtime: {
          duration: 20000
        }
      }
    }
  }
});
```
