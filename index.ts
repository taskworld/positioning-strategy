export interface Dimension {
  width: number
  height: number
}

export interface Offset {
  top: number
  left: number
}

type Axis<T extends string> = {
  placements: Record<
    T,
    (
      parentStart: number,
      parentLength: number,
      childLength: number,
      gap: number
    ) => number
  >
  avoidOverlap: boolean
}

const primaryAxis: Axis<'start' | 'end'> = {
  placements: {
    start: (parentStart, parentLength, childLength, gap) =>
      parentStart - gap - childLength,
    end: (parentStart, parentLength, childLength, gap) =>
      parentStart + parentLength + gap,
  },
  avoidOverlap: true,
}

const secondaryAxis: Axis<'start' | 'end' | 'center'> = {
  placements: {
    start: (parentStart, parentLength, childLength, gap) => parentStart,
    end: (parentStart, parentLength, childLength, gap) =>
      parentStart - childLength + parentLength,
    center: (parentStart, parentLength, childLength, gap) =>
      parentStart - childLength / 2 + parentLength / 2,
  },
  avoidOverlap: false,
}

const Direction: Record<
  'horizontal' | 'vertical',
  { start: (rect: Offset) => number; length: (rect: Dimension) => number }
> = {
  horizontal: {
    start: (rect) => rect.left,
    length: (rect) => rect.width,
  },
  vertical: {
    start: (rect) => rect.top,
    length: (rect) => rect.height,
  },
}

/**
 * Adjust the raw (suggested) position to keep the entire popup onscreen.
 */
function adjustPosition(
  suggestedPosition: number,
  childLength: number,
  viewportLength: number
): number {
  return Math.max(0, Math.min(viewportLength - childLength, suggestedPosition))
}

/**
 * Find the length of overlapping section between two ranges.
 */
function overlappingLength(
  parentStart: number,
  parentLength: number,
  childStart: number,
  childLength: number
): number {
  return Math.max(
    0,
    Math.min(childStart + childLength, parentStart + parentLength) -
    Math.max(childStart, parentStart)
  )
}

function createAxis<T extends string>(
  axisType: Axis<T>,
  preferredPlacement: T
) {
  return function (
    parentStart: number,
    parentLength: number,
    childLength: number,
    gap: number,
    viewportLength: number
  ): number {
    const results: Array<{
      position: number
      adjustment: number
      deviation: number
      overlap: number
    }> = []

    const preferredPosition = axisType.placements[preferredPlacement](
      parentStart,
      parentLength,
      childLength,
      gap
    )

    // Try all the possible placements
    for (const placement in axisType.placements) {
      const suggestedPosition = axisType.placements[placement](
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
      const overlap = overlappingLength(
        parentStart,
        parentLength,
        adjustedPosition,
        childLength
      )
      results.push({
        position: adjustedPosition,
        adjustment: adjustment,
        deviation: deviation,
        overlap: overlap,
      })
    }

    return results.sort(
      (a, b) =>
        // Prefer a placement that doesn’t require any adjustment...
        (a.adjustment > 0 ? 1 : 0) - (b.adjustment > 0 ? 1 : 0) ||
        // ...that has the least/most overlapping area...
        (a.overlap - b.overlap) * (axisType.avoidOverlap ? 1 : -1) ||
        // ...that is closest to the preferred position...
        a.deviation - b.deviation ||
        // ...with minimal amount of adjustment needed to stay fully onscreen
        a.adjustment - b.adjustment
    )[0].position
  }
}

const fallbackPrimaryAxis = createAxis(primaryAxis, 'end')
const fallbackSecondaryAxis = createAxis(secondaryAxis, 'start')

function createStrategy(
  xAxis: ReturnType<typeof createAxis>,
  yAxis: ReturnType<typeof createAxis>
) {
  return function (
    parentRect: Offset & Dimension,
    childRect: Dimension,
    viewportRect: Dimension,
    options: { gap: number }
  ) {
    function calculate(
      direction: (typeof Direction)[keyof typeof Direction],
      calculatePosition: ReturnType<typeof createAxis>
    ) {
      return calculatePosition(
        direction.start(parentRect),
        direction.length(parentRect),
        direction.length(childRect),
        options.gap,
        direction.length(viewportRect)
      )
    }
    const suggestedPosition = {
      left: calculate(Direction.horizontal, xAxis),
      top: calculate(Direction.vertical, yAxis),
    }
    const choices = [
      suggestedPosition,
      {
        left: calculate(Direction.horizontal, fallbackSecondaryAxis),
        top: calculate(Direction.vertical, fallbackPrimaryAxis),
      },
      {
        left: calculate(Direction.horizontal, fallbackPrimaryAxis),
        top: calculate(Direction.vertical, fallbackSecondaryAxis),
      },
    ].map((position) => {
      const deviation =
        Math.pow(position.left - suggestedPosition.left, 2) +
        Math.pow(position.top - suggestedPosition.top, 2)
      const overlappedArea =
        overlappingLength(
          parentRect.left,
          parentRect.width,
          position.left,
          childRect.width
        ) *
        overlappingLength(
          parentRect.top,
          parentRect.height,
          position.top,
          childRect.height
        )
      return {
        position,
        deviation,
        overlappedArea,
      }
    })
    return choices.sort(
      (a, b) => a.overlappedArea - b.overlappedArea || a.deviation - b.deviation
    )[0].position
  }
}

const strategies = {
  top: createStrategy(
    createAxis(secondaryAxis, 'center'),
    createAxis(primaryAxis, 'start')
  ),
  bottom: createStrategy(
    createAxis(secondaryAxis, 'center'),
    createAxis(primaryAxis, 'end')
  ),
  left: createStrategy(
    createAxis(primaryAxis, 'start'),
    createAxis(secondaryAxis, 'center')
  ),
  right: createStrategy(
    createAxis(primaryAxis, 'end'),
    createAxis(secondaryAxis, 'center')
  ),
  'top left': createStrategy(
    createAxis(secondaryAxis, 'start'),
    createAxis(primaryAxis, 'start')
  ),
  'top center': createStrategy(
    createAxis(secondaryAxis, 'center'),
    createAxis(primaryAxis, 'start')
  ),
  'top right': createStrategy(
    createAxis(secondaryAxis, 'end'),
    createAxis(primaryAxis, 'start')
  ),
  'bottom left': createStrategy(
    createAxis(secondaryAxis, 'start'),
    createAxis(primaryAxis, 'end')
  ),
  'bottom center': createStrategy(
    createAxis(secondaryAxis, 'center'),
    createAxis(primaryAxis, 'end')
  ),
  'bottom right': createStrategy(
    createAxis(secondaryAxis, 'end'),
    createAxis(primaryAxis, 'end')
  ),
  'left top': createStrategy(
    createAxis(primaryAxis, 'start'),
    createAxis(secondaryAxis, 'start')
  ),
  'left center': createStrategy(
    createAxis(primaryAxis, 'start'),
    createAxis(secondaryAxis, 'center')
  ),
  'left bottom': createStrategy(
    createAxis(primaryAxis, 'start'),
    createAxis(secondaryAxis, 'end')
  ),
  'right top': createStrategy(
    createAxis(primaryAxis, 'end'),
    createAxis(secondaryAxis, 'start')
  ),
  'right center': createStrategy(
    createAxis(primaryAxis, 'end'),
    createAxis(secondaryAxis, 'center')
  ),
  'right bottom': createStrategy(
    createAxis(primaryAxis, 'end'),
    createAxis(secondaryAxis, 'end')
  ),
}

export function calculateChildPosition(
  strategyName: keyof typeof strategies,
  parentRect: Offset & Dimension,
  childRect: Dimension,
  viewportRect: Dimension,
  options: { gap: number } = { gap: 0 }
) {
  return strategies[strategyName](parentRect, childRect, viewportRect, options)
}

export default calculateChildPosition
