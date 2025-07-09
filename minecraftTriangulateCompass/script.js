$( document ).ready(()=>{
  // $("#addInput").on('click', function(e){
  // var oText = $("#inputCode").val();
  // addRow()
  // console.log(oText);
  // $("#outputCode").val(oText);
// });
})

var inputDivs;

function doStuff() {
  console.log("doing stuff");
  // inputDivs = document.getElementById('inputs');
  // checkIfAddRow();
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
  // rows = [...inputDivs.children].map(x=>[...x.children].map(y=>y.value)).filter(x=>x.every(y=>y!="")).map(x=>x.map(y=>+y));
  rows = document.getElementById('input').value.split`
`.map(x=>{
  if (!x) return;
  if (x[0] == `/`) {
    var y = x.split` `;
    return [+y[6],+y[8],+y[9]]
  }
  return x.split` `.map(y=>+y);
}).filter(x=>x && x.length == 3);
  if (rows.length < 2) return;
  console.log("calculating")
  console.log(rows)
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
    console.log(D,x1, z1, angle1, x2, z2, angle2);
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

    return { x: intersectionX, z: intersectionZ, weight: ((x1 - x2)**2 +(z1 - z2)**2)**.5 * Math.abs(D)};
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function getGeometricMedian(points, tolerance = 1e-6, maxIterations = 1000) {
    if (!points || points.length === 0) {
        return null;
    }

    // Filter out points with invalid weights and ensure weights are numbers
    const validPoints = points.map(p => ({
        x: p.x,
        z: p.z,
        weight: (typeof p.weight === 'number' && p.weight > 0) ? p.weight : 1
    }));

    // If there's only one valid point, it is the geometric median.
    if (validPoints.length === 1) {
        return { x: validPoints[0].x, z: validPoints[0].z };
    }

    // Initialize the geometric median guess with the weighted centroid (mean of all points).
    let currentMedian = { x: 0, z: 0 };
    let totalInitialWeight = 0;
    for (const p of validPoints) {
        currentMedian.x += p.x * p.weight;
        currentMedian.z += p.z * p.weight;
        totalInitialWeight += p.weight;
    }
    currentMedian.x /= totalInitialWeight;
    currentMedian.z /= totalInitialWeight;

    let iteration = 0;
    let converged = false;

    while (iteration < maxIterations && !converged) {
        let sumWeightedX = 0;
        let sumWeightedZ = 0;
        let sumWeights = 0;

        for (const p of validPoints) {
            const dist = euclideanDistance(p, currentMedian);

            // The 'base' weight for the Weiszfeld algorithm is 1/distance.
            // We multiply this by the point's intrinsic weight.
            // Add a small epsilon to prevent division by zero and ensure stability.
            const baseWeight = 1 / (dist > 0 ? dist : 1e-12);
            const combinedWeight = p.weight * baseWeight;

            sumWeightedX += p.x * combinedWeight;
            sumWeightedZ += p.z * combinedWeight;
            sumWeights += combinedWeight;
        }

        // If sumWeights is zero (e.g., all points are at the currentMedian and dist=0),
        // it means we've converged or are stuck. Break to prevent division by zero.
        if (sumWeights === 0) {
            converged = true; // Effectively converged to a point
            break;
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

function parseTP(str) {
    var y = str.split` `;
    return [+y[6],+y[8],+y[9]]
}