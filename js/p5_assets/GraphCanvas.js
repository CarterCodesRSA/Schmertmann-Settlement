class GraphCanvas {
  constructor(
    startX,
    startY,
    type = "square",
    IZP = 0.75,
    breadth = 5,
    foundationLength,
    depthPixelsPerM
  ) {
    this.foundationLength = foundationLength;
    this.startX = startX;
    this.startY = startY;
    this.endX = interpolatePercentile(this.startX, width - this.startX, 0.7);
    this.endY = this.startY + depthPixelsPerM * breadth * 4;
    this.breadth = breadth;
    this.IZP = IZP;
    // Divide length of x-axis by 10 pieces + 1 for spacing on the end
    this.baseTenthPixelsX = (this.endX - this.startX) / 11;
    // multiple IZP by 10 to make a something we can multiple our base unit pixels again. 0.75 -> 7.5
    this.IzpX = this.startX + this.baseTenthPixelsX * this.IZP * 10;

    switch (type) {
      case "strip": {
        this.xFactor = 0.2;
        // interpolate 1/8th of the length of Y axis
        // 1/4 = Breadth/2 out of max 4
        this.IzpYFactor = 0.25;
        this.IzpY = this.interpFactorYAxis(this.IzpYFactor);
        // 1 = 4 * breadth
        this.yFactor = 1;
        this.izpLabelOffset = 50;
        break;
      }
      case "square": {
        this.xFactor = 0.1;
        // interpolate 1/8th of the length of Y axis
        // 1/8 = Breadth/2 out of max 4
        this.IzpYFactor = 0.125;
        this.IzpY = this.interpFactorYAxis(this.IzpYFactor);
        // 1/2 = 2 * Breadth out of max 4.
        this.yFactor = 0.5;
        this.izpLabelOffset = 75;
        break;
      }
    }

    // this.yFactorPos = this.interpFactorYAxis(this.yFactor)
    this.yFactorPos =
      this.startY +
      depthPixelsPerM * breadth * interpolatePercentile(0, 4, this.yFactor);
    this.xFactorPos = this.interpFactorXAxis(this.xFactor);
    this.yFactorBreadthMultiplier = interpolatePercentile(0, 4, this.yFactor);

    this.yLength = this.yFactorPos - this.startY;
  }

  interpFactorXAxis(factor) {
    return interpolate(0, 1, this.startX, this.endX * 0.95, factor);
  }

  interpFactorYAxis(factor) {
    return interpolate(0, 1, this.startY, this.endY * 0.9, factor);
  }

  renderLines() {
    line(this.xFactorPos, this.startY, this.IzpX, this.IzpY);
    line(this.IzpX, this.IzpY, this.startX, this.yFactorPos);

    // horizontal guide lines from 2/4B and IZP-Y to end of canvas
    // line(this.startX, this.yFactorPos, width, this.yFactorPos)
    // line(this.startX, this.IzpY, width, this.IzpY)
  }

  renderLabels() {
    fill(0);
    strokeWeight(0);
    // X Factor
    text(this.xFactor, this.xFactorPos - 10, this.startY - 5);
    // IZP label
    text(this.IZP, this.IzpX + 5, this.IzpY + 5);
    // Y Factor
    text(
      `${this.breadth * this.yFactorBreadthMultiplier}m (${
        this.yFactorBreadthMultiplier
      }B)`,
      this.startX - 75,
      this.yFactorPos + 5
    );

    // IZP Y-intercept label
    const IZPYFactorToBreadth = interpolatePercentile(0, 4, this.IzpYFactor);
    const IZPYLabel = `${this.breadth *
      IZPYFactorToBreadth}m (${IZPYFactorToBreadth}B)`;

    text(IZPYLabel, this.startX - this.izpLabelOffset, this.IzpY + 5);
    // Graph zero
    text(0, this.startX - 15, this.startY - 5);
  }

  renderCanvas() {
    stroke(0);
    strokeWeight(2);
    line(this.startX, this.startY, this.endX, this.startY);
    line(this.startX, this.startY, this.startX, this.endY);

    for (
      let a = this.startX + this.baseTenthPixelsX;
      a < this.endX - 1;
      a += this.baseTenthPixelsX
    ) {
      line(a, this.startY + 5, a, this.startY - 5);
    }
  }

  render() {
    this.renderCanvas();
    this.renderLines();
    this.renderLabels();
  }
}
