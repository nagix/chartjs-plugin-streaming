# データフィードモデル

本プラグインは、プル型とプッシュ型の両方のデータフィードに対応しています。

## プルモデル (ポーリング型) - 同期

プルモデルでは、ユーザーコードが新しいデータを要求し、データソースからデータを引き出す必要があります。これを可能にするために、プラグインには2つのオプションが用意されています。データソースを確認するために一定の間隔で呼び出されるコールバック関数である `onRefresh` と、その間隔を指定する `refresh` です。このコールバック関数では、通常通り既存のデータ配列にデータを追加することができますが、`update` 関数は内部で呼び出されるため、ユーザーが呼び出す必要はありません。

例:

```js
const myChart = new Chart(ctx, {
  type: 'line',             // 'line'、'bar'、'bubble'、'scatter' タイプに対応
  data: {
    datasets: [{
      data: []              // 最初は空
    }]
  },
  options: {
    scales: {
      x: {
        type: 'realtime',   // x軸は右から左に自動スクロール
        realtime: {         // 軸ごとのオプション
          duration: 20000,  // 過去20000ミリ秒のデータを表示
          refresh: 1000,    // onRefresh コールバックを1000ミリ秒毎に呼び出し
          delay: 1000,      // 1000ミリ秒の遅延により、次の値が確定し線が完全に引けてから表示
          pause: false,     // チャートは一時停止していない
          ttl: undefined,   // データはチャートから消えると自動的に削除
          frameRate: 30,    // データポイントを毎秒30回描画

          // データセットを更新するためのコールバック
          onRefresh: chart => {

            // データソースに問い合わせを行い、{x: タイムスタンプ, y: 値} 形式のオブジェクトの配列を取得
            var data = getLatestData();

            // 新しいデータ配列を既存のチャートデータに追加
            chart.data.datasets[0].data.push(...data);
          }
        }
      }
    }
  }
});
```

## プルモデル (ポーリング型) - 非同期

データソースがリクエストに非同期で応答する場合は、おそらくコールバック関数で結果を受け取り、既存のデータ配列にデータを追加することができるでしょう。新しいデータを追加した後には、`update` 関数を呼び出す必要があります。

ストリームデータのフィードに対して `update` 関数を呼び出す場合の問題点は、実行中のアニメーションが中断されて新しいアニメーションが開始されるため、スムーズな遷移が妨げられることです。これを避けるために、本プラグインでは、`update` 関数向けに `'quiet'` というトランジションモードを追加しました。これを指定すると、実行中のアニメーションが中断されず、新しいアニメーションを開始することなく新しいデータを追加することができます。

このモデルは、Web サーバー、Kafka（REST Proxy）、Kinesis（Data Streams API）などのデータソースや、Elasticsearch、OpenTSDB、Graphite などの REST API に対応した時系列データベースに適しています。

例:

```js
const myChart = new Chart(ctx, {
  options: {
    scales: {
      x: {
        realtime: {
          onRefresh: chart => {
            // 非同期で受信できるようにデータを要求
            // 応答は {x: タイムスタンプ, y: 値} 形式のオブジェクトの配列であると仮定
            fetch(YOUR_DATA_SOURCE_URL)
              .then(response => response.json())
              .then(data => {
                // 新しいデータ配列を既存のチャートデータに追加
                chart.data.datasets[0].data.push(...data);

                // 実行中のアニメーションを維持したまま、チャートのデータセットを更新
                chart.update('quiet');
              });
          }
        }
      }
    }
  }
});
```

## プッシュモデル (リスニング型)

プッシュモデルでは、ユーザーコードは新しいデータを待ち受けるリスナーを登録することで、データが到着した直後にデータを受け取ることができます。通常、プッシュモデルをサポートするデータソースのコネクタライブラリはコールバック関数を提供しており、この関数の中で既存のデータ配列にデータを追加できます。このモデルでは `onRefresh` は不要ですが、非同期プルモデルと同様に新しいデータを追加した後に `update` 関数を呼び出す必要があります。

このモデルは、WebSocket、MQTT、Kinesis (Client Library)などのデータソースや、Socket.IO、Pusher、Firebaseなどのリアルタイムメッセージングサービスに適しています。

以下に、リスナー関数の例を示します。

```js
// チャートのインスタンスを変数に保存
var myChart = new Chart(ctx, config);

// イベントリスナーのコード - event オブジェクトは timestamp と value のプロパティを持つと仮定
function onReceive(event) {

  // 新しいデータ配列を既存のチャートデータに追加
  myChart.data.datasets[0].data.push({
    x: event.timestamp,
    y: event.value
  });

  // 実行中のアニメーションを維持したまま、チャートのデータセットを更新
  myChart.update('quiet');
}
```
