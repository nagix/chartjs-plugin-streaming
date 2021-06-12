# オプション

以下の表は、利用可能なすべてのオプションを示しています。

| 名前 | 型 | デフォルト値 | 説明
| ---- | ---- | ------- | -----------
| `duration` | `number` | `10000` | チャートの表示時間（どのくらいの期間のデータを表示するか）をミリ秒単位で指定します。
| `ttl` | `number` | | データが保持される期間をミリ秒単位で指定します。設定されていない場合は、古いデータがチャートから消えると自動的に削除されます。
| `delay` | `number` | `0` | 値が追加され完全に線がプロットされてから表示するようにするために、チャートに追加する遅延をミリ秒単位で指定します。これにより、チャートの右側がせわしなく揺れ動かずに、連続した流れのように見えます。予想される遅延時間の最大値を指定します。
| `refresh` | `number` | `1000` | データの更新間隔をミリ秒単位で指定します。この間隔で `onRefresh` コールバック関数が呼び出されます。
| [`onRefresh`](#onrefresh) | `function` | `null` | 一定時間ごとに呼び出されるコールバック関数。[詳細...](#onrefresh)
| `frameRate` | `number` | `30` | 画面にチャートが描画される頻度（1秒あたりのフレーム数）。CPU の消費電力を節約したい場合は、この値を小さくしてください。[詳細...](performance.md#cpu-使用率を下げる)
| `pause` | `boolean` | `false` | `true` に設定すると、スクロールが停止します。`true` に設定されていても、`onRefresh` コールバックは呼び出されることに注意してください。

::: tip 補足
これらのオプションの設定方法がわからない場合は、[設定](getting-started.md#設定)の項を参照してください。
:::

なお、`'realtime'` スケールでは、以下の軸オプションは無視されます。

- `bounds`
- `max`
- `min`
- `offset`（常に `false`）
- `ticks.autoSkip`（常に `false`）
- `ticks.major.enabled`（常に `true`）

## onRefresh

`onRefresh` コールバック関数は、チャートオブジェクトへの参照である1つの引数を取ります。コールバック関数の `this` キーワードには、スケールオブジェクトが設定されています。

この関数内でデータセットを更新することができます。チャートは関数から戻る際に自動的に更新されますので、`chart.update()` を呼び出す必要はありません。次の例では、一定の更新間隔でデータを追加する方法を示しています。

```js
const myChart = new Chart(ctx, {
  options: {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          onRefresh: function(chart) {
            chart.data.datasets.forEach(function(dataset) {
              dataset.data.push({
                x: Date.now(),
                y: Math.random()
              });
            });
          }
        }
      }
    }
  }
});
```
