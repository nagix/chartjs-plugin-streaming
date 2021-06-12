# Canvas を作成する

ng2-charts では HTML Canvas 要素で `baseChart` ディレクティブを使用することができます。下記の例では、いくつかのオプションを入力として渡しています。

#### src/app/app.component.html

```html
<div>
  <canvas
    baseChart
    [type]="'line'"
    [datasets]="datasets"
    [options]="options">
  </canvas>
</div>
```
