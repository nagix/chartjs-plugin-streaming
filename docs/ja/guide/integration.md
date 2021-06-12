# 連携

`chartjs-plugin-streaming` は他の Chart.js プラグインと一緒に使えます。

## Annotation プラグイン

[chartjs-plugin-annotation](https://github.com/chartjs/chartjs-plugin-annotation) と併用することで、アノテーションを realtime スケール軸に沿ってスクロールさせることができます。

::: warning 互換性に関する注意事項
このプラグインには、chartjs-plugin-annotation **1.x** が必要です。
:::

```js
const myChart = new Chart(ctx, {
  options: {
    plugins: {
      annotation: {
        annotations: {
          // x軸は realtime スケールであると仮定
          line: {
            drawTime: 'afterDatasetsDraw',
            type: 'line',
            scaleID: 'x',
            value: LINE_TIME
          },
          box: {
            drawTime: 'beforeDatasetsDraw',
            type: 'box',
            xMin: BOX_START_TIME,
            xMax: BOX_END_TIME
          }
        }
      }
    }
  }
});
```

なお、`chartjs-plugin-annotation.js` は `chartjs-plugin-streaming.js` の前にロードする必要があります。

## Data Labels プラグイン

By using together with [chartjs-plugin-datalabels](https://github.com/chartjs/chartjs-plugin-datalabels) と併用することで、ストリーミングチャートにデータラベルを表示することができます。

::: warning 互換性に関する注意事項
このプラグインには、chartjs-plugin-datalabels **2.x** が必要です。
:::

```js
const myChart = new Chart(ctx, {
  options: {
    plugins: {
      datalabels: {
        // x軸は realtime スケールであると仮定
        backgroundColor: context => context.dataset.borderColor,
        padding: 4,
        borderRadius: 4,
        clip: true,       // ラベルがチャート領域からはみ出さないように true を推奨
        color: 'white',
        font: {
          weight: 'bold'
        },
        formatter: value => value.y
      }
    }
  }
});
```

なお、`chartjs-plugin-datalabels.js` は `chartjs-plugin-streaming.js` の前にロードする必要があります。

## Financial チャート

[chartjs-chart-financial](https://github.com/chartjs/chartjs-chart-financial) と併用することで、自動スクロールする金融チャートを作成することができます。

::: warning 互換性に関する注意事項
chartjs-chart-financial はまだプレリリースです。[コミット #5dcdca5](https://github.com/chartjs/chartjs-chart-financial/blob/5dcdca5001671a7cfd840a055a16ce113c8ab05a/docs/chartjs-chart-financial.js) で本プラグインと動作することを確認しています。
:::

```js
const myChart = new Chart(ctx, {
  type: 'candlestick',    // または 'ohlc'
  options: {
    scales: {
      x: {
        type: 'realtime',
        ticks: {
          source: 'auto'  // ローソク足チャートのデフォルト値は 'data'
        }
      }
    }
  }
});
```

なお、`chartjs-plugin-financial.js` は `chartjs-plugin-streaming.js` の前にロードする必要があります。

## Zoom プラグイン

[chartjs-plugin-zoom](https://github.com/chartjs/chartjs-plugin-zoom) と併用することで、マウスや指のジェスチャーでストリーミングチャートのズームやパンができるようになります。

::: warning 互換性に関する注意事項
このプラグインには、chartjs-plugin-zoom **1.x** が必要です。
:::

他のスケールタイプとは異なり、`limits` オプションの `min`、`max`、`minRange` は使用されません。代わりに、`minDelay`、`maxDelay`、`minDuration`、`maxDuration` を使用して `delay` と `duration` オプション値の範囲を制限します。

```js
const myChart = new Chart(ctx, {
  options: {
    plugins: {
      zoom: {
        // x軸は realtime スケールであると仮定
        pan: {
          enabled: true,        // パンの有効化
          mode: 'x'             // x軸方向のパン
        },
        zoom: {
          pinch: {
            enabled: true       // ピンチズームの有効化
          },
          wheel: {
            enabled: true       // ホイールズームの有効化
          },
          mode: 'x'             // x軸方向のズーム
        },
        limits: {
          x: {
            minDelay: null,     // delay オプションの最小値
            maxDelay: null,     // delay オプションの最大値
            minDuration: null,  // duration オプションの最小値
            maxDuration: null   // duration オプションの最大値
          }
        }
      }
    }
  }
});
```

なお、`chartjs-plugin-zoom.js` は `chartjs-plugin-streaming.js` の前にロードする必要があります。
