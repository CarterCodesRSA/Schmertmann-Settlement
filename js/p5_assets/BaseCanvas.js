class BaseCanvas {
  constructor(foundationBreadth = 5, foundationDepth = 1) {
    this.fBreadth = foundationBreadth;
    this.fDepth = foundationDepth;
    this.groundXStart = width * 0.05;
    this.groundY = height * 0.1;
    this.groundXEnd = width * (1 - 0.05);
    this.fStartX = 100;
    this.foundationDepthPx = 95;
    this.foundationBreadthPx = 250;
  }

  getFoundation() {
    return {
      fCenterX: this.fStartX + this.foundationBreadthPx / 2,
      fCenterY: this.foundationDepthPx + this.groundY,
      fLength: limitMax(
        this.foundationDepthPx * this.fBreadth,
        this.foundationBreadthPx
      ),
      fDepthPixels: this.foundationDepthPx / this.fDepth
    };
  }

  renderGround() {
    stroke(140, 90, 0);
    strokeWeight(2);
    line(this.groundXStart, this.groundY, this.groundXEnd, this.groundY);

    fill(140, 90, 0);
    strokeWeight(0);
    textSize(15);
    text("Surface Level", this.groundXEnd - 100, this.groundY - 5);
  }

  renderFoundation() {
    stroke(155);
    fill(155);
    strokeWeight(2);
    rect(
      this.fStartX,
      this.groundY,
      this.foundationBreadthPx,
      this.foundationDepthPx
    );

    fill(0);
    strokeWeight(0);
    textSize(15);
    text(
      `${this.fDepth}m`,
      this.fStartX - 45,
      this.groundY + this.foundationDepthPx / 2 + 5
    );
  }

  render() {
    this.renderFoundation();
    this.renderGround();
  }
}
