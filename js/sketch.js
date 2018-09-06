function setup() {
  const { windowWidth, windowHeight } = config

  const mainCanvas = createCanvas(windowWidth, windowHeight)
  mainCanvas.parent('#sketch-holder')
  background(255)
}

function draw() {
  const {
    foundationBase: { depth, breadth },
    IZP,
    type,
    coneData
  } = config

  background(255)
  stroke(0)
  fill(0)

  const baseCanvas = new BaseCanvas(breadth, depth)
  const {
    fCenterX,
    fCenterY,
    fLength,
    fDepthPixels
  } = baseCanvas.getFoundation()

  const graphCanvas = new GraphCanvas(
    fCenterX,
    fCenterY + 2,
    type,
    IZP,
    breadth,
    fLength,
    fDepthPixels
  )

  const dataTable = new DataTable(
    graphCanvas.endX + 50,
    baseCanvas.groundY,
    coneData,
    fDepthPixels
  )

  baseCanvas.render()
  graphCanvas.render()
  dataTable.render()
}
