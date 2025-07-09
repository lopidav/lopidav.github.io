$( document ).ready(()=>{
  // $("#addInput").on('click', function(e){
  // var oText = $("#inputCode").val();
  addRow()
  // console.log(oText);
  // $("#outputCode").val(oText);
// });
})

var inputDivs;

function doStuff() {
  console.log("doing stuff");
  inputDivs = document.getElementById('inputs');
  checkIfAddRow();
  calculate();
}

function checkIfAddRow() {
  var allFilled = true;
  [...inputDivs.lastElementChild.children].forEach(element => {
    allFilled = allFilled && element.value !=="";
  });
  if (allFilled) addRow();
}
function addRow() {
  var newRow = document.createElement('div');
  document.getElementById('inputs').appendChild(newRow);
  newRow.innerHTML = document.getElementById('temp').innerHTML;
}

function calculate() {
  var rows = [];
  rows = [...inputDivs.children].map(x=>[...x.children].map(y=>y.value)).filter(x=>x.every(y=>y!="")).map(x=>x.map(y=>+y));
  if (rows.length < 2) return;
  console.log("calculating")
  var temp;
  var points = [];
  for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        temp = getMinecraftXZRayIntersection(rows[i][0],rows[i][1],degreesToRadians(rows[i][2]-5.6),rows[j][0],rows[j][1],degreesToRadians(rows[j][2]-5.6));
        if (temp) points.push(temp);
      }
    }
  var result = getGeometricMedian(points);
  document.getElementById('results').innerHTML = result ? `x: ${Math.round(result.x)}  z: ${Math.round(result.z)}` : error;
}

function getMinecraftXZRayIntersection(x1, z1, angle1, x2, z2, angle2) {
    // Calculate the direction components (dx, dz) for each ray based on the Minecraft angle convention.
    // In this convention (0=Z+, 90=X-):
    // dx = -sin(angle) (for X-axis component)
    // dz = cos(angle) (for Z-axis component)
    const dx1 = -Math.sin(angle1);
    const dz1 = Math.cos(angle1);
    const dx2 = -Math.sin(angle2);
    const dz2 = Math.cos(angle2);

    // The denominator (D) of the system of equations.
    // This determines if the lines are parallel.
    // D = (dx1 * dz2) - (dz1 * dx2)
    const D = dx1 * dz2 - dz1 * dx2;

    // A small epsilon value to handle floating point inaccuracies when checking for parallelism.
    // Rays are considered parallel if D is very close to zero.
    const EPSILON = 1e-9;

    // Check if the rays are parallel or collinear.
    // If D is very close to zero, the rays are parallel, meaning they will never
    // intersect uniquely, or they are coincident (overlapping).
    if (Math.abs(D) < EPSILON) {
        return null; // No unique intersection point (rays are parallel or coincident)
    }

    // Calculate t1 (parameter for ray 1)
    // This represents the distance along ray 1 to the intersection point.
    // Corrected numerator for t1: (x2 - x1) * dz2 - (z2 - z1) * dx2
    const numT1 = (x2 - x1) * dz2 - (z2 - z1) * dx2;
    const t1 = numT1 / D;

    // Calculate t2 (parameter for ray 2)
    // This represents the distance along ray 2 to the intersection point.
    // Corrected numerator for t2: (x2 - x1) * dz1 - (z2 - z1) * dx1
    const numT2 = (x2 - x1) * dz1 - (z2 - z1) * dx1;
    const t2 = numT2 / D;

    // Check if the intersection point lies on the forward direction of both rays.
    // For a ray, the parameter 't' must be non-negative (t >= 0).
    // If t is negative, the intersection occurs "behind" the ray's origin.
    if (t1 < 0 || t2 < 0) {
        return null; // The lines intersect, but the rays (forward paths) do not.
    }

    // Calculate the intersection point using the parametric equation of the first ray.
    // (Using either ray's parameters will yield the same point, so we pick one).
    const intersectionX = x1 + t1 * dx1;
    const intersectionZ = z1 + t1 * dz1;

    return { x: intersectionX, z: intersectionZ };
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function getGeometricMedian(points, tolerance = 1e-6, maxIterations = 1000) {
    if (!points || points.length === 0) {
        return null;
    }

    // If there's only one point, it is the geometric median.
    if (points.length === 1) {
        return { x: points[0].x, z: points[0].z };
    }

    // Initialize the geometric median guess with the centroid (mean of all points).
    let currentMedian = { x: 0, z: 0 };
    for (const p of points) {
        currentMedian.x += p.x;
        currentMedian.z += p.z;
    }
    currentMedian.x /= points.length;
    currentMedian.z /= points.length;

    let iteration = 0;
    let converged = false;

    while (iteration < maxIterations && !converged) {
        let sumWeightedX = 0;
        let sumWeightedZ = 0;
        let sumWeights = 0;

        for (const p of points) {
            const dist = euclideanDistance(p, currentMedian);

            // Handle the case where currentMedian is exactly one of the points.
            // Add a small epsilon to prevent division by zero and ensure stability.
            const weight = 1 / (dist > 0 ? dist : 1e-12); // Use a tiny value instead of 0

            sumWeightedX += p.x * weight;
            sumWeightedZ += p.z * weight;
            sumWeights += weight;
        }

        const nextMedian = {
            x: sumWeightedX / sumWeights,
            z: sumWeightedZ / sumWeights
        };

        // Check for convergence
        const change = euclideanDistance(currentMedian, nextMedian);
        if (change < tolerance) {
            converged = true;
        }

        currentMedian = nextMedian;
        iteration++;
    }

    return currentMedian;
}
function euclideanDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dz * dz);
}