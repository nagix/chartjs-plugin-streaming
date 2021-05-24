# Create a canvas

ng2-charts gives us a `baseChart` directive that can be applied on an HTML canvas element. Here’s an example showing-off some of the options to pass-in as inputs.

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
