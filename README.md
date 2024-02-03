# positioning-strategy

The [`positioning-strategy`](https://www.npmjs.com/package/positioning-strategy) module implements a function to calculate where to position an element relative to another element.

## API

This module exports a single function,

```ts
function calculateChildPosition(
  strategyName,
  parentRect,
  childDimension,
  viewportDimension,
  options
): { left: number, top: number }
```

### Parameters:

- `strategyName` A string representing the name of the strategy.

  There are 12 strategies available. A strategy name is composed of “primary axis” and “secondary axis.”

  |                |                |                  |                 |                 |
  | -------------- | -------------- | ---------------- | --------------- | --------------- |
  |                | top<br>left    | top<br>center    | top<br>right    |                 |
  | left<br>top    |                |                  |                 | right<br>top    |
  | left<br>center |                |                  |                 | right<br>center |
  | left<br>bottom |                |                  |                 | right<br>bottom |
  |                | bottom<br>left | bottom<br>center | bottom<br>right |                 |

- `parentRect` An object representing the rectangle of the parent. It has these properties:

  - `left` The distance from the left edge of the viewport to the element.
  - `top` The distance from the top edge of the viewport to the element.
  - `width` The width of the element.
  - `height` The height of the element.

- `childDimension` An object representing the size of the element you want to position.

  - `width` The width of the element.
  - `height` The height of the element.

- `viewportDimension` An object representing the size of the viewport.

  - `width` The width of the element.
  - `height` The height of the element.

- `options` Optional.

  - `gap` How much distance between the child and the parent.

### Return type

It returns an object representing where to position the child relative to the parent element. It contains these properties:

- `left` The distance from the left edge of the viewport to the element.
- `top` The distance from the top edge of the viewport to the element.
