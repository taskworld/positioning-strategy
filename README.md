
# positioning-strategy [![](https://img.shields.io/codecov/c/github/taskworld/positioning-strategy.svg)](https://codecov.io/gh/taskworld/positioning-strategy/src/master/README.md)

Function to calculate how to position an element relative to another element.

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
})
```


## The strategies.

There are 12 strategies available. A strategy is composed of “primary axis” and “secondary axis.”

| | | | | |
| --- | --- | --- | --- | --- |
| | top<br>left | top<br>center | top<br>right | |
| left<br>top | | | | right<br>top |
| left<br>center | | | | right<br>center |
| left<br>bottom | | | | right<br>bottom |
| | bottom<br>left | bottom<br>center | bottom<br>right | |

The mathematics behinds them:

<img src="https://raw.githubusercontent.com/taskworld/react-overlay-popup/master/docs/magic.png" />

Implementation:

```js
// strategies.js
function calculate (vp, lp, lc, kp, kc, Δv) {
  return vp + kp * lp - kc * lc + Δv
}

function calculateWithFallback (vp, lp, lc, kp, kc, vm, Δv) {
  var primary = kp !== kc
  var vc = calculate(vp, lp, lc, kp, kc, Δv)

  if (primary) {
    // For primary axis, bounce to the other edge.
    if ((kp > 0.5 && vc + lc > vm) || (kp < 0.5 && vc < 0)) {
      return calculate(vp, lp, lc, 1 - kp, 1 - kc, -Δv)
    } else {
      return vc
    }
  } else {
    // For secondary axis, try to adjust position.
    if (vc < 0) {
      return calculate(vp, lp, lc, 0, 0, Δv)
    } else if (vc + lc > vm) {
      return calculate(vp, lp, lc, 1, 1, Δv)
    } else {
      return vc
    }
  }
}

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

```js
// index.js
import strategies from './strategies'

function calculateChildPosition (strategyName, parentRect, childRect, viewportRect, { gap = 0 } = { }) {
  return strategies[strategyName](parentRect, childRect, viewportRect, { gap })
}

module.exports = calculateChildPosition
module.exports.calculateChildPosition = calculateChildPosition
```
