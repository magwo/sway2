import { END_WIDTH_FACTOR, Plant, PlantSegment } from '../../../procedural/plant';

function approxEqual(n1: number, n2: number) {
  return Math.abs(n1 - n2) < 0.000001;
}

function segmentBranchPath(segment: PlantSegment): string {
  // Manually optimized, inlined vector code
  // Should get good savings due to avoiding massive amounts of sin/cos calls
  // due to using right angles (replaced by +/- x/y), as well as many function calls
  const position = segment.position;
  const rotation = segment.rotation;
  const length = segment.length;
  const width = segment.width;
  const vx = Math.cos(rotation);
  const vy = Math.sin(rotation);

  if (length <= 0 || width <= 0) {
    return '';
  }

  let baseRightX, baseRightY, baseLeftX, baseLeftY;
  if (segment.type === 'main_branch') {
    const parentPosition = segment.parent!.position;
    const parentRotation = segment.parent!.rotation;
    const parentLength = segment.parent!.length
    const parentWidth = segment.parent!.width;
    const parentVx = Math.cos(parentRotation);
    const parentVy = Math.sin(parentRotation);

    baseRightX = parentPosition.x + parentVx * parentLength + -parentVy * parentWidth * END_WIDTH_FACTOR;
    baseRightY = parentPosition.y + parentVy * parentLength + parentVx * parentWidth * END_WIDTH_FACTOR;
    baseLeftX = parentPosition.x + parentVx * parentLength + parentVy * parentWidth * END_WIDTH_FACTOR;
    baseLeftY = parentPosition.y + parentVy * parentLength + -parentVx * parentWidth * END_WIDTH_FACTOR;
  } else if(segment.type === 'root') {
    baseRightX = position.x + width;
    baseRightY = position.y;
    baseLeftX = position.x - width;
    baseLeftY = position.y;
  } else {
    baseRightX = position.x + -vy * width;
    baseRightY = position.y + vx * width;
    baseLeftX = position.x + vy * width;
    baseLeftY = position.y + -vx * width;
  }

  const endRightX = position.x + vx * length + -vy * width * END_WIDTH_FACTOR;
  const endRightY = position.y + vy * length + vx * width * END_WIDTH_FACTOR;

  const endLeftX = position.x + vx * length + vy * width * END_WIDTH_FACTOR;
  const endLeftY = position.y + vy * length + -vx * width * END_WIDTH_FACTOR;

  // const baseRight = segment.getBaseRight();
  //   segment.type !== 'main_branch'
  //     ? segment.getBaseRight()
  //     : segment.parent!.getEndRight();
  // const endRight = segment.getEndRight();
  // const endLeft = segment.getEndLeft();
  // const baseLeft = segment.getBaseLeft();
  //   segment.type !== 'main_branch'
  //     ? segment.getBaseLeft()
  //     : segment.parent!.getEndLeft();

  // if (!approxEqual(baseRightX, baseRight.x)) {
  //   console.log('baseRight not accurate', baseRightX, baseRightY, baseRight.x, baseRight.y);
  // }
  // if (!approxEqual(baseLeftX, baseLeft.x)) {
  //   console.log('baseLeft not accurate', baseLeftX, baseLeftY, baseLeft.x, baseLeft.y);
  // }
  // if (!approxEqual(endRightX, endRight.x)) {
  //   console.log('endRight not accurate', endRightX, endRightY, endRight.x, endRight.y);
  // }
  // if (!approxEqual(endLeftX, endLeft.x)) {
  //   console.log('endLeft not accurate', endLeftX, endLeftY, endLeft.x, endLeft.y);
  // }
  // if (!approxEqual(endRightX, endRight.x)) {
  //   console.log('endRight not accurate', endRightX, endRightY, endRight.x, endRight.y);
  // }

  // return ''.concat('M ', baseRightX.toString(), ' ', baseRightY.toString(), ' L ' , endRightX.toString(), ' ', endRightY.toString(), ' ', endLeftX.toString(), ' ', endLeftY.toString(), ' ', baseLeftX.toString(), ' ', baseLeftY.toString(), 'Z');
  return `M ${baseRightX} ${baseRightY} L ${endRightX} ${endRightY} ${endLeftX} ${endLeftY} ${baseLeftX} ${baseLeftY} Z`;
//   let str = 'M ';
//   str += baseRightX;
//   str += ' ';
//   str += baseRightY;
//   str += ' L ';
//   str += endRightX;
//   str += ' ';
//   str += endRightY;
//   str += ' ';
//   str += endLeftX;
//   str += ' ';
//   str += endLeftY;
//   str += ' ';
//   str += baseLeftX;
//   str += ' ';
//   str += baseLeftY;
//   str += 'Z';
// return str;
}

export function renderPlantBranchesPath(plant: Plant): string {
  // TODO: Plants are described in SI units (meters), so scale accordingly
  return renderSegmentsRecursively(plant.rootSegment);
}

export function renderSegmentsRecursively(segment: PlantSegment): string {
  // Plants are described in SI units (meters), so scale accordingly
  // PRE_OPT: 87-90 ms
  // POST inlining: 75-78ish ms (conclusion: most of the time is spent handling strings?)
  // POST local string plus: no big change
  // With string plussing: heap 78-247 MB, ~4 minor GC per plant
  // With literal: heap 46-236 MB, 4 minor GC per plant, slightly faster
  // With concat: heap 45-224 MB, 4 minor GC per plant, slightly slower
  let path = segmentBranchPath(segment);
  for (const subSegment of segment.branches) {
    if (
      subSegment.type === 'root' ||
      subSegment.type === 'branch' ||
      subSegment.type === 'main_branch'
    ) {
      path += renderSegmentsRecursively(subSegment);
    }
  }
  // path += segmentBranchPath(segment);
  return path;
}

function flower(segment: PlantSegment) {
  const pos = segment.position;
  return `<circle cx="${pos.x}" cy="${pos.y}" r="0.5" />`;
}

export function renderFlowers(plant: Plant): string {
  return renderFlowersRecursively(plant.rootSegment);
}

export function renderFlowersRecursively(segment: PlantSegment): string {
  let markup = '';
  for (const subSegment of segment.branches) {
    if (subSegment.type === 'flower') {
      markup += flower(subSegment);
    }
    markup += renderFlowersRecursively(subSegment);
  }
  return markup;
}
