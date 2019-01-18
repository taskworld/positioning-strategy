# positioning-strategy [![](https://img.shields.io/codecov/c/github/taskworld/positioning-strategy.svg)](https://codecov.io/gh/taskworld/positioning-strategy/src/master/README.md)

The [`positioning-strategy`](https://www.npmjs.com/package/positioning-strategy) module implements a function to calculate where to position an element relative to another element.

## API

This module exports a single function, `calculateChildPosition`.

### calculateChildPosition(strategyName, parentRect, childDimension, viewportDimension, options)

Returns an object representing where to position a child element relative to a parent element.

It takes the following arguments:

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

- `options` An optional object. Optional.

  - `gap` How much distance between the child and the parent.

Returns an object representing where to position the child. It contains these properties:

- `left` The distance from the left edge of the viewport to the element.
- `top` The distance from the top edge of the viewport to the element.

```js
// index.test.js
import calculateChildPosition from './'
import expect from 'expect'

const viewportRect = { width: 80, height: 20 }
const buttonRect = { top: 10, left: 38, width: 4, height: 2 }
const moveTo = (left, top) => rect => ({ ...rect, top, left })
const moveBy = (dx, dy) => rect => ({
  ...rect,
  top: rect.top + dy,
  left: rect.left + dx,
})

describe('strategies', () => {
  const testStrategy = (strategyName, expectedResult) => {
    const menuRect = { width: 12, height: 6 }
    it(`${strategyName}`, () => {
      const args = [
        strategyName,
        buttonRect,
        menuRect,
        viewportRect,
        { gap: 1 },
      ]
      assertVisual(args, expectedResult)
    })
  }

  testStrategy(
    'bottom left',
    `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------------------------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------------------------------------------------
`
  )

  testStrategy(
    'bottom center',
    `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------------------------------------------------
----------------------------------############----------------------------------
----------------------------------############----------------------------------
----------------------------------############----------------------------------
----------------------------------############----------------------------------
----------------------------------############----------------------------------
----------------------------------############----------------------------------
--------------------------------------------------------------------------------
`
  )

  testStrategy(
    'bottom right',
    `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------------------------------------------------
------------------------------############--------------------------------------
------------------------------############--------------------------------------
------------------------------############--------------------------------------
------------------------------############--------------------------------------
------------------------------############--------------------------------------
------------------------------############--------------------------------------
--------------------------------------------------------------------------------
`
  )

  testStrategy(
    'left top',
    `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-------------------------############-@@@@--------------------------------------
-------------------------############-@@@@--------------------------------------
-------------------------############-------------------------------------------
-------------------------############-------------------------------------------
-------------------------############-------------------------------------------
-------------------------############-------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
  )

  testStrategy(
    'right bottom',
    `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-------------------------------------------############-------------------------
-------------------------------------------############-------------------------
-------------------------------------------############-------------------------
-------------------------------------------############-------------------------
--------------------------------------@@@@-############-------------------------
--------------------------------------@@@@-############-------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
  )

  testStrategy(
    'right center',
    `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-------------------------------------------############-------------------------
-------------------------------------------############-------------------------
--------------------------------------@@@@-############-------------------------
--------------------------------------@@@@-############-------------------------
-------------------------------------------############-------------------------
-------------------------------------------############-------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
  )
})

describe('primary axis', function() {
  const menuRect = { width: 12, height: 10 }

  it('bounces to the other direction on overflow', () => {
    assertVisual(
      [
        'bottom left',
        moveBy(0, 5)(buttonRect),
        menuRect,
        viewportRect,
        { gap: 1 },
      ],
      // Despite the "bottom left" strategy,
      // there is not enough space at the bottom.
      // Therefore, the menu gets bounced to the top.
      `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------------------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
    )
  })
  it('tries to keep menu fully on-screen', () => {
    assertVisual(
      ['bottom left', buttonRect, menuRect, viewportRect, { gap: 1 }],
      // Even though gap 1 is requested, but it would push the menu above the viewport.
      `
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------############------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
    )
  })
})

describe('secondary axis', function() {
  const menuRect = { width: 40, height: 5 }

  it('works normally when there’s no overflowing', () => {
    assertVisual(
      ['bottom', buttonRect, menuRect, viewportRect],
      `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------------------------@@@@--------------------------------------
--------------------########################################--------------------
--------------------########################################--------------------
--------------------########################################--------------------
--------------------########################################--------------------
--------------------########################################--------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
    )
  })
  it('aligns the right edge, when there is not enough space to the right', () => {
    assertVisual(
      ['bottom', moveBy(30, 0)(buttonRect), menuRect, viewportRect],
      `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------@@@@--------
--------------------------------------------------------------------@@@@--------
--------------------------------########################################--------
--------------------------------########################################--------
--------------------------------########################################--------
--------------------------------########################################--------
--------------------------------########################################--------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
    )
  })
  it('aligns the left edge, when there is not enough space to the left', () => {
    assertVisual(
      ['bottom', moveBy(-30, 0)(buttonRect), menuRect, viewportRect],
      `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------@@@@--------------------------------------------------------------------
--------@@@@--------------------------------------------------------------------
--------########################################--------------------------------
--------########################################--------------------------------
--------########################################--------------------------------
--------########################################--------------------------------
--------########################################--------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
    )
  })
  it('center-aligns if there is not enough space when right-aligned', () => {
    assertVisual(
      ['bottom right', moveBy(-16, 0)(buttonRect), menuRect, viewportRect],
      `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
----------------------@@@@------------------------------------------------------
----------------------@@@@------------------------------------------------------
----########################################------------------------------------
----########################################------------------------------------
----########################################------------------------------------
----########################################------------------------------------
----########################################------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
    )
  })
  it('center-aligns if there is not enough space when left-aligned', () => {
    assertVisual(
      ['bottom left', moveBy(16, 0)(buttonRect), menuRect, viewportRect],
      `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
------------------------------------------------------@@@@----------------------
------------------------------------------------------@@@@----------------------
------------------------------------########################################----
------------------------------------########################################----
------------------------------------########################################----
------------------------------------########################################----
------------------------------------########################################----
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
    )
  })
  it('left-aligns if there is not enough space when right-aligned and center-aligning would still cause an overflow', () => {
    assertVisual(
      ['bottom right', moveBy(-24, 0)(buttonRect), menuRect, viewportRect],
      `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------@@@@--------------------------------------------------------------
--------------@@@@--------------------------------------------------------------
--------------########################################--------------------------
--------------########################################--------------------------
--------------########################################--------------------------
--------------########################################--------------------------
--------------########################################--------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
    )
  })
  it('right-aligns if there is not enough space when left-aligned and center-aligning would still cause an overflow', () => {
    assertVisual(
      ['bottom left', moveBy(24, 0)(buttonRect), menuRect, viewportRect],
      `
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------@@@@--------------
--------------------------------------------------------------@@@@--------------
--------------------------########################################--------------
--------------------------########################################--------------
--------------------------########################################--------------
--------------------------########################################--------------
--------------------------########################################--------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
`
    )
  })
})

function assertVisual(args, expectedResult) {
  const [, parentRect, childDimension, viewportDimension, ,] = args
  const childPosition = calculateChildPosition(...args)
  let output = '\n'
  for (let i = 0; i < viewportDimension.height; i++) {
    for (let j = 0; j < viewportDimension.width; j++) {
      const inParent =
        parentRect.top <= i &&
        i < parentRect.top + parentRect.height &&
        parentRect.left <= j &&
        j < parentRect.left + parentRect.width
      const inChild =
        childPosition.top <= i &&
        i < childPosition.top + childDimension.height &&
        childPosition.left <= j &&
        j < childPosition.left + childDimension.width
      output += inParent ? '@' : inChild ? '#' : '-'
    }
    output += '\n'
  }
  return expect(output).toBe(expectedResult)
}
```

```js
// index.js
import strategies from './strategies'

function calculateChildPosition(
  strategyName,
  parentRect,
  childRect,
  viewportRect,
  { gap = 0 } = {}
) {
  return strategies[strategyName](parentRect, childRect, viewportRect, { gap })
}

module.exports = calculateChildPosition
module.exports.calculateChildPosition = calculateChildPosition
```

## The calculation

```js
// strategies.js
export const strategies = {}

const AxisType = {
  primary: {
    strategies: {
      start: (parentStart, parentLength, childLength, gap) =>
        parentStart - gap - childLength,
      end: (parentStart, parentLength, childLength, gap) =>
        parentStart + parentLength + gap,
    },
  },
  secondary: {
    strategies: {
      start: (parentStart, parentLength, childLength, gap) => parentStart,
      end: (parentStart, parentLength, childLength, gap) =>
        parentStart - childLength + parentLength,
      center: (parentStart, parentLength, childLength, gap) =>
        parentStart - childLength / 2 + parentLength / 2,
    },
  },
}

const Direction = {
  horizontal: {
    start: rect => rect.left,
    length: rect => rect.width,
  },
  vertical: {
    start: rect => rect.top,
    length: rect => rect.height,
  },
}

function axis(axisType, preferredStrategy) {
  const availableStrategyNames = Object.keys(axisType.strategies)
  return {
    calculatePosition(
      parentStart,
      parentLength,
      childLength,
      gap,
      viewportLength
    ) {
      const results = []
      const preferredPosition = axisType.strategies[preferredStrategy](
        parentStart,
        parentLength,
        childLength,
        gap
      )
      for (const strategyName of availableStrategyNames) {
        const suggestedPosition = axisType.strategies[strategyName](
          parentStart,
          parentLength,
          childLength,
          gap
        )
        const adjustedPosition = adjustPosition(
          suggestedPosition,
          childLength,
          viewportLength
        )
        const adjustment = Math.abs(suggestedPosition - adjustedPosition)
        const deviation = Math.abs(preferredPosition - adjustedPosition)
        results.push({
          position: adjustedPosition,
          adjustment: adjustment,
          deviation: deviation,
        })
      }
      return results.sort(
        (a, b) => a.adjustment - b.adjustment || a.deviation - b.deviation
      )[0].position
    },
  }
}

function adjustPosition(suggestedPosition, childLength, viewportLength) {
  return Math.max(0, Math.min(viewportLength - childLength, suggestedPosition))
}

function createStrategy(xAxis, yAxis) {
  return function(parentRect, childRect, viewportRect, options) {
    function calculate(direction, currentAxis) {
      return currentAxis.calculatePosition(
        direction.start(parentRect),
        direction.length(parentRect),
        direction.length(childRect),
        options.gap,
        direction.length(viewportRect)
      )
    }
    return {
      left: calculate(Direction.horizontal, xAxis),
      top: calculate(Direction.vertical, yAxis),
    }
  }
}

strategies['top left'] = createStrategy(
  axis(AxisType.secondary, 'start'),
  axis(AxisType.primary, 'start')
)
strategies['top'] = strategies['top center'] = createStrategy(
  axis(AxisType.secondary, 'center'),
  axis(AxisType.primary, 'start')
)
strategies['top right'] = createStrategy(
  axis(AxisType.secondary, 'end'),
  axis(AxisType.primary, 'start')
)

strategies['bottom left'] = createStrategy(
  axis(AxisType.secondary, 'start'),
  axis(AxisType.primary, 'end')
)
strategies['bottom'] = strategies['bottom center'] = createStrategy(
  axis(AxisType.secondary, 'center'),
  axis(AxisType.primary, 'end')
)
strategies['bottom right'] = createStrategy(
  axis(AxisType.secondary, 'end'),
  axis(AxisType.primary, 'end')
)

strategies['left top'] = createStrategy(
  axis(AxisType.primary, 'start'),
  axis(AxisType.secondary, 'start')
)
strategies['left'] = strategies['left center'] = createStrategy(
  axis(AxisType.primary, 'start'),
  axis(AxisType.secondary, 'center')
)
strategies['left bottom'] = createStrategy(
  axis(AxisType.primary, 'start'),
  axis(AxisType.secondary, 'end')
)

strategies['right top'] = createStrategy(
  axis(AxisType.primary, 'end'),
  axis(AxisType.secondary, 'start')
)
strategies['right'] = strategies['right center'] = createStrategy(
  axis(AxisType.primary, 'end'),
  axis(AxisType.secondary, 'center')
)
strategies['right bottom'] = createStrategy(
  axis(AxisType.primary, 'end'),
  axis(AxisType.secondary, 'end')
)

export default strategies
```
