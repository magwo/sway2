// import { StringSink } from 'as-string-sink';
import { END_WIDTH_FACTOR, Plant, PlantSegment } from '../../../../procedural/plant';
import { PlantGeneData } from '../../../../procedural/plant-genes';
import { EIGTH_CIRCLE, QUARTER_CIRCLE } from '../../../../procedural/position';
import { createRadialArrowsLeafPath, createSimpleLeafPath } from './leaves-svg';

function approxEqual(n1: number, n2: number) {
  return Math.abs(n1 - n2) < 0.000001;
}

function segmentBranchPath(segment: PlantSegment): string {
  // TODO: Try adding curvature support
  return `M 0 5 L 10 ${5*END_WIDTH_FACTOR} L 10 ${-5*END_WIDTH_FACTOR} L -0 -5 L 0 5`;
}

export function renderPlantBranchesMarkup(plant: Plant): string {
  // console.log("WQQIW");
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
  let markup = '';//segmentBranchPath(segment);
  for (const subSegment of segment.branches) {
    if (
      subSegment.type === 'root' ||
      subSegment.type === 'branch' ||
      subSegment.type === 'main_branch'
    ) {
      markup += renderSegmentsRecursively(subSegment);
    }
  }
  const pos = segment.position;
  const rot = (segment.rotation)*360/6.283;
  const scaleX = segment.width * 0.1;
  const scaleY = segment.length * 0.1;
  markup += `<path transform="translate(${pos.x}, ${pos.y}) rotate(${rot}) scale(${scaleY}, ${scaleX})" d="${segmentBranchPath(segment)}" />`;
  return markup;
}

// 🍀
function leaf(segment: PlantSegment, genes: PlantGeneData) {
  if (segment.length <= 0) {
    return '';
  }
  const pos = segment.position;
  const rot = (segment.rotation)*360/6.283;
  
  // const path = `<path d="${createSimpleLeafPath()}" />`;
  const path = `<path d="${createRadialArrowsLeafPath(genes.leafSubCount, genes.leafSubPointyness, genes.leafElongation, genes.leafDefects)}" />`;
  
  const cmMultiplier = 1 / 100;
  return `<g transform="translate(${pos.x}, ${pos.y}) scale(${segment.length * genes.leafSize * cmMultiplier}) rotate(${rot})">${path}</g>`;
  // return `<g transform="translate(${pos.x}, ${pos.y}) scale(${1 + segment.length / 20}) rotate(${rot})"><text text-anchor="middle" dominant-baseline="text-top">🍀</text></g>`;
  // return `<circle cx="${pos.x}" cy="${pos.y}" r="0.5" />`;
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
