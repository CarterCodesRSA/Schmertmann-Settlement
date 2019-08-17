class DataTable {
	constructor(startX, startY, coneData, pxPerDepthM) {
		this.maxLength = 200
		this.pxPerDepthM = pxPerDepthM
		this.startX = startX
		this.startY = startY
		this.endX = this.startX + this.maxLength
		this.coneData = coneData
		this.coneDataMaxNM =
			this.coneData.length &&
			this.coneData.reduce((item, acc) => (item > acc ? item : acc))[1]
	}

	renderCells() {
		let cumulativeY = 0
		let prevDepth = 0

		this.coneData.map(depthItem => {
			const depth = depthItem[0]
			const deltaDepth = (prevDepth ? depth - prevDepth : depth).toFixed(1)
			const nM = depthItem[1]
			const relCellLength = (this.maxLength * nM) / this.coneDataMaxNM
			const relCellDepth = this.pxPerDepthM * deltaDepth
			const cellStartY = this.startY + cumulativeY

			noFill(0)
			strokeWeight(2)
			rect(this.startX, cellStartY, relCellLength, relCellDepth)

			strokeWeight(0)
			fill(0)
			text(
				`${nM} N/m`,
				this.startX + relCellLength + 5,
				cellStartY + relCellDepth / 2 + 5
			)

			text(`${depth} m`, this.startX - 50, cellStartY + relCellDepth + 5)

			cumulativeY += relCellDepth
			prevDepth = depth
		})
	}

	render() {
		this.renderCells()
	}
}
