function interpolate(baseMin, baseMax, projectMin, projectMax, initialValue) {
  const initialPositionRatio = initialValue / (baseMax - baseMin);
  const projectPosition =
    (projectMax - projectMin) * initialPositionRatio + projectMin;
  return projectPosition;
}

const interpolatePercentile = (projectMin, projectMax, initialValue) =>
  (projectMax - projectMin) * initialValue + projectMin;

const limitMax = (inputValue, max) => (inputValue < max ? inputValue : max);

const calculateIzpMax = (overburden, appLoad) =>
  0.5 + 0.1 * (appLoad / overburden) ** 0.5;

const capitalize = word => word.charAt(0).toUpperCase() + word.substr(1);

const getMaxValueFromNestedArray = (arr, innerPosition) => {
  let highestNumber = 0;

  if (arr.length === 1) {
    return arr[0][innerPosition];
  } else {
    arr.map(innerArray => {
      if (innerArray[innerPosition] > highestNumber) {
        highestNumber = innerArray[innerPosition];
      }
      return;
    });

    return highestNumber;
  }
};
function addExtraDataPoints(updatedConfig) {
  const {
    foundationBase: { depth, breadth },
    type,
    coneData
  } = updatedConfig;
  console.log("updatedConfig: ", updatedConfig);

  for (a = 0; a < coneData.length; a++) {
    if (coneData[a][0] < depth && coneData[a + 1][0] > depth) {
      coneData.splice(a + 1, 0, [depth, coneData[a + 1][1]]);
    }
    const maxDepth =
      type === "square" ? breadth * 2 + depth : breadth * 4 + depth;
    if (coneData[a][0] < maxDepth && coneData[a + 1][0] > maxDepth) {
      coneData.splice(a + 1, 0, [maxDepth, coneData[a + 1][1]]);
    }
    const midDepth = (type == "square" ? breadth / 2 : breadth) + depth;
    if (coneData[a][0] < midDepth && coneData[a + 1][0] > midDepth) {
      coneData.splice(a + 1, 0, [midDepth, coneData[a + 1][1]]);
    }
  }
  return coneData;
}

function calculateOverburden(updatedConfig) {
  var {
    foundationBase: { depth, breadth },
    satDensity,
    dryDensity,
    type,
    waterTable
  } = updatedConfig;

  let q0, s0;
  const buoyantWeight = satDensity - 10;

  switch (type) {
    case "square": {
      if (waterTable < depth) {
        q0 = buoyantWeight;
        s0 = buoyantWeight;
        console.log(1);
      } else if (waterTable >= depth && waterTable < breadth + depth) {
        q0 = dryDensity;
        s0 = buoyantWeight;
        console.log(2);
      } else {
        q0 = dryDensity;
        s0 = dryDensity;
        console.log(3);
      }
      const overburden = q0 * depth + s0 * (breadth / 2);
      return { overburden: Number(overburden), q0: q0 * depth };
    }
    case "strip":
      if (waterTable < depth) {
        q0 = buoyantWeight;
        s0 = buoyantWeight;
        console.log(4);
      } else if (waterTable >= depth && waterTable < breadth + depth) {
        q0 = dryDensity;
        s0 = buoyantWeight;
        console.log(5);
      } else {
        q0 = dryDensity;
        s0 = dryDensity;
        console.log(6);
      }
      const overburden = q0 * depth + s0 * breadth;
      return { overburden: Number(overburden), q0: q0 * depth };
  }
}

function getIZPValueForEachLayer(updatedConfig) {
  const tableData = {
    layer: [],
    Delta_Z: [],
    qcVal: [],
    EcVal: [],
    IzVal: [],
    sumVal: []
  };

  const {
    foundationBase: { breadth, depth },
    type,
    IZP,
    coneData
  } = updatedConfig;
  console.log("updatedConfig: ", updatedConfig);

  //addExtraDataPoints(type, depth, coneData)

  const yValues = [];
  const xValues = [];

  //Defining the major points of the graph
  const startPoint = [type == "square" ? 0.1 : 0.2, 0],
    midPoint = [IZP, type == "square" ? breadth / 2 : breadth],
    endPoint = [0, type == "square" ? 2 * breadth : 4 * breadth];

  //determine y values to provide x value pair
  var previousDepth = 0;

  for (a = 0; a < coneData.length; a++) {
    if (!previousDepth) {
      var midDelta = coneData[a][0] / 2;
      tableData.Delta_Z.push(parseFloat(coneData[a][0].toFixed(3)));
      yValues.push(midDelta);
      previousDepth = coneData[a][0];
      continue;
    }
    var midDelta = (coneData[a][0] - previousDepth) / 2 + previousDepth;
    tableData.Delta_Z.push(
      parseFloat((coneData[a][0] - previousDepth).toFixed(3))
    );
    previousDepth = coneData[a][0];
    yValues.push(midDelta);
  }
  for (b = 0; b < yValues.length; b++) {
    yValues[b] = Number((yValues[b] - depth).toFixed(3));
  }
  //checked and working
  startGradient = (midPoint[1] - startPoint[1]) / (midPoint[0] - startPoint[0]);
  startYVal = startPoint[1] - startGradient * startPoint[0];
  endGradient = (endPoint[1] - midPoint[1]) / (endPoint[0] - midPoint[0]);
  endYVal = midPoint[1] - endGradient * midPoint[0];

  let xVal;

  for (x = 0; x < yValues.length; x++) {
    if (yValues[x] < 0) {
      xVal = 0;
    } else if (yValues[x] > 0 && yValues[x] < midPoint[1]) {
      xVal = (yValues[x] - startYVal) / startGradient;
    } else if (yValues[x] > midPoint[1] && yValues[x] < endPoint[1]) {
      xVal = (yValues[x] - endYVal) / endGradient;
    } else if (yValues[x] > endPoint[1]) {
      xVal = 0;
    }

    xVal = parseFloat(xVal.toFixed(3));
    xValues.push(xVal);

    //this will add the layer value to the table
    tableData.layer.push(x + 1);
  }
  tableData.IzVal = xValues;

  tableData.qcVal = Object.values(coneData).map(([depth, qc]) => qc);
  tableData.EcVal = tableData.qcVal.map(qc =>
    parseFloat((qc * (type === "square" ? 2.5 : 3.5)).toFixed(3))
  );

  for (x = 0; x < tableData.layer.length; x++) {
    tableData.sumVal.push(
      parseFloat(
        (
          (tableData.IzVal[x] * tableData.Delta_Z[x]) /
          tableData.EcVal[x]
        ).toFixed(5)
      )
    );
  }

  console.log("This is tableData: ", tableData);
  return tableData;
}

function calculateSettlement(q0, appLoad, sum) {
  const c1 = 1 - 0.5 * (q0 / appLoad);
  const settlement = c1 * appLoad * sum;
  return settlement;
}
