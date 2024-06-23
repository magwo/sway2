// import { StringSink } from 'as-string-sink';
import { END_WIDTH_FACTOR, Plant, PlantSegment } from '../../../../procedural/plant';
import { PlantGeneData } from '../../../../procedural/plant-genes';
import { EIGTH_CIRCLE, QUARTER_CIRCLE } from '../../../../procedural/position';
import { createRadialArrowsLeafPath, createSimpleLeafPath } from './leaves-svg';

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
  return `M ${baseRightX} ${baseRightY} L ${endRightX} ${endRightY} A 0.01 .01 0 0 0 ${endLeftX} ${endLeftY} L ${baseLeftX} ${baseLeftY} Z`;
}

export function renderPlantBranchesPath(plant: Plant): string {
  // TODO: Try to increase performance by re-using a large array that is kept
  // at a constant size, presumably by setting length large and keeping the actual
  // NOTE: Arrays with primitive same-type objects may exhibit fast slice due to memcpy.
  // used length in a separate variable.
  // TODO: Plants are described in SI units (meters), so scale accordingly
  const result = renderSegmentsRecursively(plant.rootSegment);
  // console.log("Branches path is length", result.length);
  return result;
}

export function renderSegmentsRecursively(segment: PlantSegment): string {
  // TODO: Maybe don't use a big path for these things. Instead use g objects and transforms
  // which should be much more performant to update. Apply gradient to g
  // Plants are described in SI units (meters), so scale accordingly
  // PRE_OPT: 87-90 ms
  // POST inlining: 75-78ish ms (conclusion: most of the time is spent handling strings?)
  // POST local string plus: no big change
  // With string plussing: heap 78-247 MB, ~4 minor GC per plant
  // With literal: heap 46-236 MB, 4 minor GC per plant, slightly faster
  // With concat: heap 45-224 MB, 4 minor GC per plant, slightly slower
  let path = '';//segmentBranchPath(segment);
  for (const subSegment of segment.branches) {
    if (
      subSegment.type === 'root' ||
      subSegment.type === 'branch' ||
      subSegment.type === 'main_branch'
    ) {
      path += renderSegmentsRecursively(subSegment);
    }
  }
  path += segmentBranchPath(segment);
  return path;
}

function leaf(segment: PlantSegment, genes: PlantGeneData) {
  const pos = segment.position;
  const rot = (segment.rotation)*360/6.283;
  const path = `<path d="${createRadialArrowsLeafPath(genes.leafSubCount, genes.leafSubPointyness, genes.leafElongation, genes.leafDefects)}" />`;
  const cmMultiplier = 1 / 100;
  return `<g transform="translate(${pos.x}, ${pos.y}) scale(${segment.length * genes.leafSize * cmMultiplier}) rotate(${rot})">${path}</g>`;
}

export function renderLeaves(plant: Plant): string {
  return renderLeavesRecursively(plant.rootSegment, plant.genes.data);
}

export function renderLeavesRecursively(segment: PlantSegment, genes: PlantGeneData): string {
  let markup = '';
  for (const subSegment of segment.branches) {
    if (subSegment.type === 'leaf') {
      markup += leaf(subSegment, genes);
    }
    markup += renderLeavesRecursively(subSegment, genes);
  }
  return markup;
}

export function updateLeaves(plant: Plant, nativeElement: SVGGElement) {
  // console.log("Native elem is", nativeElement);
  updateLeavesRecursively(0, plant.rootSegment, plant.genes.data, nativeElement);
}
function updateLeavesRecursively(nodeCounter: number, segment: PlantSegment, genes: PlantGeneData, nativeElement: SVGGElement): number {
  // TODO: Could move this into a, maybe, more performant integration with PlantSegments
  if (segment.type === 'leaf') {
    const pos = segment.position;
    const rot = segment.rotation*360/6.283;
    const cmMultiplier = 1 / 100;
    // const transform = `translate(${pos.x}, ${pos.y}) scale(${segment.length * genes.leafSize * cmMultiplier}) rotate(${rot})`;
    const pathElem = nativeElement.children[nodeCounter] as SVGPathElement;
    // console.log(pathElem.transform.baseVal);
    // THIS IS ABOUT TWICE AS FAST:
    pathElem.transform.baseVal.getItem(0).setTranslate(pos.x, pos.y);
    pathElem.transform.baseVal.getItem(1).setScale(segment.length * genes.leafSize * cmMultiplier, segment.length * genes.leafSize * cmMultiplier);
    pathElem.transform.baseVal.getItem(2).setRotate(rot, 0, 0);
    // nativeElement.children[nodeCounter].setAttribute('transform', transform);
    nodeCounter += 1;
  }
  for (let i=0; i<segment.branches.length; i++) {
    const subSegment = segment.branches[i];
    if(nativeElement.children) {
      nodeCounter = updateLeavesRecursively(nodeCounter, subSegment, genes, nativeElement);
    }
  }
  return nodeCounter;
}



function flower(segment: PlantSegment) {
  if (segment.length <= 0) {
    return '';
  }
  const pos = segment.position;
  const rot = segment.rotation*360/6.283;
  return `<g transform="translate(${pos.x}, ${pos.y}) scale(${1 + segment.length / 20}) rotate(${rot})"><text text-anchor="middle" dominant-baseline="central">🌸</text></g>`;
  // return `<circle cx="${pos.x}" cy="${pos.y}" r="0.5" />`;
}

export function renderFlowers(plant: Plant): string {
  return renderFlowersRecursively(plant.rootSegment, plant.genes.data);
}

export function renderFlowersRecursively(segment: PlantSegment, genes: PlantGeneData): string {
  let markup = '';
  for (const subSegment of segment.branches) {
    if (subSegment.type === 'flower') {
      markup += flower(subSegment);
    }
    markup += renderFlowersRecursively(subSegment, genes);
  }
  return markup;
}


function fruit(segment: PlantSegment, genes: PlantGeneData) {
  if (segment.length <= 0) {
    return '';
  }
  const pos = segment.position;
  const rot = segment.rotation*360/6.283;
  return `<g transform="translate(${pos.x}, ${pos.y}) scale(${1 + segment.length / 20}) rotate(${rot})"><text text-anchor="middle" dominant-baseline="hanging">${genes.fruitType}</text></g>`;
  // return `<circle cx="${pos.x}" cy="${pos.y}" r="0.5" />`;
}

export function renderFruits(plant: Plant): string {
  return renderFruitsRecursively(plant.rootSegment, plant.genes.data);
}

export function renderFruitsRecursively(segment: PlantSegment, genes: PlantGeneData): string {
  let markup = '';
  for (const subSegment of segment.branches) {
    if (subSegment.type === 'fruit') {
      markup += fruit(subSegment, genes);
    }
    markup += renderFruitsRecursively(subSegment, genes);
  }
  return markup;
}
