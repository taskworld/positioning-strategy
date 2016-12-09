
# positioning-strategy [![](https://img.shields.io/codecov/c/github/taskworld/positioning-strategy.svg)](https://codecov.io/gh/taskworld/positioning-strategy/src/master/README.md)


The [`positioning-strategy`](https://www.npmjs.com/package/positioning-strategy) module implements a function to calculate where to position an element relative to another element.

## API

This module exports a single function, `calculateChildPosition`.

### calculateChildPosition(strategyName, parentRect, childDimension, viewportDimension, options)

Returns an object representing where to position a child element relative to a parent element.

It takes the following arguments:

- `strategyName` A string representing the name of the strategy.

  There are 12 strategies available. A strategy name is composed of “primary axis” and “secondary axis.”

  | | | | | |
  | --- | --- | --- | --- | --- |
  | | top<br>left | top<br>center | top<br>right | |
  | left<br>top | | | | right<br>top |
  | left<br>center | | | | right<br>center |
  | left<br>bottom | | | | right<br>bottom |
  | | bottom<br>left | bottom<br>center | bottom<br>right | |

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

- `options` An optional object. Optional.

  - `gap` How much distance between the child and the parent.

Returns an object representing where to position the child. It contains these properties:

- `left` The distance from the left edge of the viewport to the element.
- `top` The distance from the top edge of the viewport to the element.

```js
// index.test.js
import calculateChildPosition from './'

const viewportRect = { width: 1000, height: 1000 }
const buttonRect = { top: 450, left: 400, width: 200, height: 100 }
const moveTo = (left, top) => (rect) => ({ ...rect, top, left })

it('positions a menu relative to a button', () => {
  const menuRect = { width: 120, height: 300 }
  assert.deepEqual(
    calculateChildPosition('bottom left', buttonRect, menuRect, viewportRect, { gap: 8 }),
    { top: 450 + 100 + 8, left: 400 })
  assert.deepEqual(
    calculateChildPosition('bottom center', buttonRect, menuRect, viewportRect, { gap: 8 }),
    { top: 450 + 100 + 8, left: 400 + (200 - 120) / 2 })
  assert.deepEqual(
    calculateChildPosition('bottom right', buttonRect, menuRect, viewportRect, { gap: 8 }),
    { top: 450 + 100 + 8, left: 400 + (200 - 120) })
  assert.deepEqual(
    calculateChildPosition('left top', buttonRect, menuRect, viewportRect, { gap: 8 }),
    { left: 400 - 120 - 8, top: 450 })
  assert.deepEqual(
    calculateChildPosition('right bottom', buttonRect, menuRect, viewportRect, { gap: 8 }),
    { left: 400 + 200 + 8, top: 450 + 100 - 300 })
  assert.deepEqual(
    calculateChildPosition('right center', buttonRect, menuRect, viewportRect, { gap: 8 }),
    { left: 400 + 200 + 8, top: 450 + (100 - 300) / 2 })
})

describe('primary axis', function () {
  it('bounces to the other direction on overflow', () => {
    const menuRect = { width: 400, height: 200 }
    assert.deepEqual(
      calculateChildPosition('bottom left', moveTo(100, 100)(buttonRect), menuRect, viewportRect, { gap: 8 }),
      { top: 100 + 100 + 8, left: 100 })
    assert.deepEqual(
      calculateChildPosition('bottom left', moveTo(100, 700)(buttonRect), menuRect, viewportRect, { gap: 8 }),
      { top: 700 - 200 - 8, left: 100 })
  })
  it('does not bounce if bouncing still causes an overflow', () => {
    const menuRect = { width: 800, height: 800 }
    assert.deepEqual(
      calculateChildPosition('bottom left', moveTo(100, 300)(buttonRect), menuRect, viewportRect, { gap: 8 }),
      { top: 300 + 100 + 8, left: 100 })
    assert.deepEqual(
      calculateChildPosition('top left', moveTo(100, 300)(buttonRect), menuRect, viewportRect, { gap: 8 }),
      { top: 300 - 800 - 8, left: 100 })
  })
})

describe('secondary axis', function () {
  it('adjusts to fit', () => {
    const menuRect = { width: 400, height: 200 }
    assert.deepEqual(
      calculateChildPosition('bottom', moveTo(400, 100)(buttonRect), menuRect, viewportRect, { gap: 8 }),
      { top: 100 + 100 + 8, left: 400 + (200 - 400) / 2 })
    assert.deepEqual(
      calculateChildPosition('bottom', moveTo(800, 100)(buttonRect), menuRect, viewportRect, { gap: 8 }),
      { top: 100 + 100 + 8, left: 800 + (200 - 400) })
    assert.deepEqual(
      calculateChildPosition('bottom', moveTo(50, 100)(buttonRect), menuRect, viewportRect),
      { top: 100 + 100, left: 50 })
  })

  it('fallback to the center if possible on the right/bottom edge', () => {
    const menuRect = { width: 470, height: 200 }
    const narrowViewport = {
      width: 650, height: 650
    }
    const buttonRect = { top: 450, left: 343, width: 10, height: 100 }

    // In this case, button rectangle left and width is sum up to 343 + 10 = 350
    // So ideally, it should draw menu ending at 350 viewport
    // So if we want to draw menu that have 470 length to end right with 350 left from viewport
    // that's will come up with left start of the menu should be (350 - 470) = (some minus number)
    // In this case, it should fallback to draw center instead
    const actual = calculateChildPosition('bottom right', buttonRect, menuRect, viewportRect, { gap: 8 })
    const expected = calculateChildPosition('bottom center', buttonRect, menuRect, viewportRect, { gap: 8 })
    assert.deepEqual(actual, expected)
  })

  it('fallback to center if possible on the left/top edge', () => {
    const menuRect = { width: 470, height: 200 }
    const narrowViewport = {
      width: 650, height: 650
    }
    const buttonRect = { top: 450, left: 343, width: 10, height: 100 }

    // In this case, button rectangle left is 343
    // So ideally, it should draw menu ending at 343 left
    // So if we want to draw menu that have 470 length to end right with 343 left from viewport
    // that's will come up with right end of the menu should be (343 + 470) = 813, which exceeds the viewport
    // In this case, it should fallback to draw center instead
    const actual = calculateChildPosition('bottom left', buttonRect, menuRect, narrowViewport, { gap: 8 })
    const expected = calculateChildPosition('bottom center', buttonRect, menuRect, narrowViewport, { gap: 8 })
    assert.deepEqual(actual, expected)
  })

  it('fallback to another edge if center is not enough on the right/bottom edge', () => {
    const menuRect = { width: 400, height: 200 }
    const narrowViewport = {
      width: 700, height: 650
    }
    const buttonRect = { top: 450, left: 190, width: 10, height: 100 }

    // In this case, button rectangle left and width is sum up to 343 + 10 = 350
    // So ideally, it should draw menu ending at 200 viewport-x
    // So if we want to draw menu that have 400 length to end right with 200 left from viewport
    // that's will come up with left start of the menu should be (200 - 400) = (some minus number)
    // In this case, it should fallback to draw center instead
    // But if center is still minus, it should again fallback to left
    const actual = calculateChildPosition('bottom right', buttonRect, menuRect, viewportRect, { gap: 8 })
    const expected = calculateChildPosition('bottom left', buttonRect, menuRect, viewportRect, { gap: 8 })
    assert.deepEqual(actual, expected)
  })

  it('fallback to another edge if center is not enough on the top/left edge', () => {
    const menuRect = { width: 400, height: 200 }
    const narrowViewport = {
      width: 700, height: 650
    }
    const buttonRect = { top: 450, left: 190, width: 10, height: 100 }

    // In this case, button rectangle left and width is sum up to 343 + 10 = 350
    // So ideally, it should draw menu ending at 200 viewport-x
    // So if we want to draw menu that have 400 length to end right with 200 left from viewport
    // that's will come up with left start of the menu should be (200 - 400) = (some minus number)
    // In this case, it should fallback to draw center instead
    // But if center is still minus, it should again fallback to left
    const actual = calculateChildPosition('bottom left', buttonRect, menuRect, viewportRect, { gap: 8 })
    const expected = calculateChildPosition('bottom right', buttonRect, menuRect, viewportRect, { gap: 8 })
    assert.deepEqual(actual, expected)
  })
})
```

```js
// index.js
import strategies from './strategies'

function calculateChildPosition (strategyName, parentRect, childRect, viewportRect, { gap = 0 } = { }) {
  return strategies[strategyName](parentRect, childRect, viewportRect, { gap })
}

module.exports = calculateChildPosition
module.exports.calculateChildPosition = calculateChildPosition
```

## The calculation

The mathematics behinds this calculation considers a single digit. It makes use of these variables:

- __<var>v<sub>p</sub></var>__ Viewport distance of the parent.
- __<var>v<sub>c</sub></var>__ Viewport distance of the child.
- __<var>l<sub>p</sub></var>__ Length of the parent.
- __<var>l<sub>c</sub></var>__ Length of the child.
- __<var>k<sub>p</sub></var>__ Anchor coefficient of the parent, where 0 is the edge near the viewport and 1 is the other edge.
- __<var>k<sub>c</sub></var>__ Anchor coefficient of the child, where 0 is the edge near the viewport and 1 is the other edge.

This function established a relation so that the anchor point between the child and the parents are aligned:

<img src="https://raw.githubusercontent.com/taskworld/react-overlay-popup/master/docs/magic.png" />

```js
// calculate.js
export function calculate (vp, lp, lc, kp, kc) {
  return vp + kp * lp - kc * lc
}

export default calculate
```


## Adding fallback

We are now considering the size of the viewport.

- For primary axis, the element will overflow the viewport, it will snap to the other direction.
- For secondary axis, it will try a different alignment.

```js
// calculateWithFallback.js
import calculate from './calculate.js'

export function calculateWithFallback (vp, lp, lc, kp, kc, vm, Δv) {
  var primary = kp !== kc
  var vc = calculate(vp, lp, lc, kp, kc) + Δv

  if (primary) {
    // For primary axis, bounce to the other edge.
    if ((kp > 0.5 && vc + lc > vm) || (kp < 0.5 && vc < 0)) {
      const vcʹ = calculate(vp, lp, lc, 1 - kp, 1 - kc) - Δv
      if ((kp < 0.5 && vcʹ + lc > vm) || (kp > 0.5 && vcʹ < 0)) {
        return vc
      } else {
        return vcʹ
      }
    } else {
      return vc
    }
  } else {
    const isGoThroughtFirstEdge = vc => vc < 0
    const isGoThroughSecondEdge = (vc) => vc + lc > vm
    // For secondary axis, try to adjust position.
    if (isGoThroughtFirstEdge(vc)) {
      const fallbackCenter = calculate(vp, lp, lc, 0.5, 0.5) + Δv
      return !isGoThroughtFirstEdge(fallbackCenter) ? fallbackCenter : calculate(vp, lp, lc, 0, 0) + Δv
    } else if (isGoThroughSecondEdge(vc)) {
      const fallbackCenter = calculate(vp, lp, lc, 0.5, 0.5) + Δv
      return !isGoThroughSecondEdge(fallbackCenter) ? fallbackCenter : calculate(vp, lp, lc, 1, 1) + Δv
    } else {
      return vc
    }
  }
}

export default calculateWithFallback
```

## Strategy creation

```js
// strategies.js
import calculateWithFallback from './calculateWithFallback'

function createStrategy (parentX, childX, parentY, childY, gapX, gapY) {
  return function (parentRect, childRect, viewportRect, options) {
    var childWidth = childRect.width
    var childHeight = childRect.height

    var left = calculateWithFallback(
      parentRect.left,
      parentRect.width,
      childRect.width,
      parentX,
      childX,
      viewportRect.width,
      gapX * options.gap
    )
    var top = calculateWithFallback(
      parentRect.top,
      parentRect.height,
      childRect.height,
      parentY,
      childY,
      viewportRect.height,
      gapY * options.gap
    )
    return { left, top }
  }
}

export const strategies = { }

strategies['top left'] = createStrategy(0, 0, 0, 1, 0, -1)
strategies['top'] = strategies['top center'] = createStrategy(0.5, 0.5, 0, 1, 0, -1)
strategies['top right'] = createStrategy(1, 1, 0, 1, 0, -1)

strategies['bottom left'] = createStrategy(0, 0, 1, 0, 0, 1)
strategies['bottom'] = strategies['bottom center'] = createStrategy(0.5, 0.5, 1, 0, 0, 1)
strategies['bottom right'] = createStrategy(1, 1, 1, 0, 0, 1)

strategies['left top'] = createStrategy(0, 1, 0, 0, -1, 0)
strategies['left'] = strategies['left center'] = createStrategy(0, 1, 0.5, 0.5, -1, 0)
strategies['left bottom'] = createStrategy(0, 1, 1, 1, -1, 0)

strategies['right top'] = createStrategy(1, 0, 0, 0, 1, 0)
strategies['right'] = strategies['right center'] = createStrategy(1, 0, 0.5, 0.5, 1, 0)
strategies['right bottom'] = createStrategy(1, 0, 1, 1, 1, 0)

export default strategies
```
