import { Plant, PlantSegment } from "../../../procedural/plant";


function flower(segment: PlantSegment) {

}


function segmentBranchPath(segment: PlantSegment) {
  const baseRight = segment.type !== 'main_branch' ? segment.getBaseRight() : segment.parent!.getEndRight();
  const endRight = segment.getEndRight();
  const endLeft = segment.getEndLeft();
  const baseLeft = segment.type !== 'main_branch' ? segment.getBaseLeft() : segment.parent!.getEndLeft();
  return `M ${baseRight.x} ${baseRight.y} L ${endRight.x} ${endRight.y} L ${endLeft.x} ${endLeft.y} ${baseLeft.x} ${baseLeft.y} Z`;
}

export function renderPlantBranchesPath(plant: Plant): string {
  // TODO: Plants are described in SI units (meters), so scale accordingly
  return renderSegmentsRecursively(plant.rootSegment);
}

export function renderSegmentsRecursively(segment: PlantSegment): string {
  // Plants are described in SI units (meters), so scale accordingly
  let path = segmentBranchPath(segment);
  for (const subSegment of segment.branches) {
    path += renderSegmentsRecursively(subSegment);
  }
  return path;
}