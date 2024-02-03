The [`positioning-strategy`](https://www.npmjs.com/package/positioning-strategy) module implements a function to calculate where to position an element relative to another element.

## Usage

This module exports a single function,

```ts
function calculateChildPosition(
  strategy,
  parentRect,
  childDimension,
  viewportDimension,
  options
): { left: number, top: number }
```

### Parameters

- `strategy` The wanted position of the child relative to the parent represented by the combination of two axes: (top, bottom) and (left, center, right)

  Possible values are:  
  `"top left"`, `"top center"`, `"top right"`,  
  `"bottom left"`, `"bottom center"`, `"bottom right"`,  
  `"left top"`, `"left center"`, `"left bottom"`,  
  `"right top"`, `"right center"`, `"right bottom"`,  
  including the shorthands: `"top"`, `"bottom"`, `"left"` and `"right"`

- `parentRect` An object representing the rectangle of the parent. It has these properties:

  - `left` The distance from the left edge of the viewport to the element.
  - `top` The distance from the top edge of the viewport to the element.
  - `width` The width of the element.
  - `height` The height of the element.

- `childDimension` An object representing the size of the child you want to position.

  - `width` The width of the element.
  - `height` The height of the element.

- `viewportDimension` An object representing the size of the viewport.

  - `width` The width of the element.
  - `height` The height of the element.

- `options` Optional.

  - `gap` The distance between the child and the parent.

### Return value

It returns an object representing where to position the child relative to the parent element. It contains these properties:

- `left` The distance from the left edge of the viewport to the child.
- `top` The distance from the top edge of the viewport to the child.
