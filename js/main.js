const config = {
	windowWidth: 1000,
	windowHeight: 1000,
	foundationBase: {
		depth: 2,
		breadth: 4,
		length: 4
	},
	IZP: 0.75,
	type: 'square',
	satDensity: 0,
	appLoad: 0,
	overburden: 0,
	waterTable: 0,
	coneData: []
}

window.onload = function() {
	const topRowEl = document.getElementById('top-row')
	const bottomRowEl = document.getElementById('bottom-row')
	const rootRows = [bottomRowEl, topRowEl]
	const dataTableRowsEl = document.getElementById('dataTableRows')
	// Retrieves all inputs under the general fields div (Excluding Cone Table)
	const generalFieldInputs = document.querySelectorAll('#general-fields input')

	const addConeInputFields = () =>
		rootRows.map(rootRowEl => {
			// Create new div
			const divEl = document.createElement('div')
			divEl.className = 'column is-1'
			divEl.setAttribute('data-field-type', 'custom')
			// Create new input
			const inputEl = document.createElement('input')
			inputEl.className = 'input is-small'
			inputEl.setAttribute('type', 'text')
			inputEl.setAttribute('id', 'depth-range')
			// Append to input to div
			divEl.appendChild(inputEl)
			// Add to root element from array
			rootRowEl.appendChild(divEl)
		})

	const removeLastConeInputField = () => {
		if (
			topRowEl.children.length > 2 &&
			topRowEl.lastChild.hasAttribute('data-field-type')
		) {
			topRowEl.removeChild(topRowEl.lastChild)
			bottomRowEl.removeChild(bottomRowEl.lastChild)
		}
	}

	const processConeInputs = () => {
		const depthInputs = Array.from(document.querySelectorAll('#top-row input'))
		const qcInputs = Array.from(document.querySelectorAll('#bottom-row input'))
		const coneData = []

		for (let a = 0; a < depthInputs.length; a++) {
			const depthValue = parseFloat(depthInputs[a].value)
			const qcValue = parseFloat(qcInputs[a].value)

			// check if any field is blank, exit the function if true and prevent update
			if (!depthValue || !qcValue) {
				return
			}
			coneData.push([depthValue, qcValue])
		}
		return coneData.sort((a, b) => a[0] - b[0])
	}

	const processForm = () => {
		const getGeneralFormValues = () => {
			// Convert generalFieldInputs to array and loop over each item and adds it as a key-value pair in an object
			return Array.from(generalFieldInputs).reduce((acc, item) => {
				// split the ID of the input field by a hyphen
				const inputLabel = item.id.split('-')

				let objectLabel
				// if the inputLabel array is length 1 = there is no hyphen, and we simply use the ID as the destination object key
				if (inputLabel.length === 1) {
					objectLabel = inputLabel[0]
				} else {
					// if the length is > 1, we loop through the parts of the split array ['app', 'load']
					// for every iteration after the first, we are appending the word to a string with the first letter capitalized.
					// e.g app-load becomes appLoad - sat-density becomes satDensity
					objectLabel = inputLabel.reduce(
						(acc, item) => (acc += acc === '' ? item : capitalize(item)),
						''
					)
				}
				// we append the accumulator object with a new key-value pair from our object label and input value
				return { ...acc, [objectLabel]: parseFloat(item.value) }
			}, {})
		}

		const determineType = (length, breadth) => {
			const selector_Strip = document.getElementById('foundationTypeStrip')
				.checked

			const selector_Square = document.getElementById('foundationTypeSquare')
				.checked

			if (selector_Square) {
				return 'square'
			}

			if (selector_Strip) {
				return 'strip'
			}
		}

		const fieldValues = getGeneralFormValues()

		const coneDataInputs = processConeInputs()

		// descructure our keys for validation and merge with global config
		const {
			appLoad,
			breadth,
			depth,
			dryDensity,
			length,
			satDensity,
			waterTable
		} = fieldValues

		/*
      Check for validation here with the variables declared above
    */

		// check if any inputs are blank, exit the function if so
		// all blank fields values are NaN because they are being parsed to float on line 95.
		// if (Object.values(fieldValues).includes(NaN)) {
		// 	return
		// }

		// calculate type
		const type = determineType(length, breadth)
		console.log('type: ', type)

		// calculate overburden
		const { overburden, q0 } = calculateOverburden({
			foundationBase: { depth, breadth, length },
			satDensity,
			dryDensity,
			type,
			waterTable
		})
		console.log('q0: ', q0)
		console.log('overburden: ', overburden)

		// calculate IZP
		const IZP = parseFloat(calculateIzpMax(overburden, appLoad).toFixed(3))

		//update coneData
		const coneData = addExtraDataPoints({
			foundationBase: { depth, breadth },
			coneData: coneDataInputs,
			type
		})

		// update our config with variables we declared above in the correct shape
		// Object.assign takes in an object and updates it with all subsequent objects passed in as paramaters.
		// Object.assign(objectToUpdate, newObject, { someKey: someValue })

		const tableData = getIZPValueForEachLayer({
			foundationBase: { breadth, depth },
			type,
			IZP,
			coneData
		})

		const sum = tableData.sumVal.reduce((acc, item) => (acc = acc + item))
		console.log('sum: ', sum)

		const settlement = calculateSettlement(q0, appLoad, sum)
		console.log('settlement: ', settlement)

		console.log('We Are here ')
		Object.assign(config, {
			foundationBase: { depth, length, breadth },
			appLoad,
			dryDensity,
			satDensity,
			waterTable,
			type,
			IZP,
			overburden,
			coneData,
			q0,
			tableData,
			sum,
			settlement
		})
	}

	const buildDataTable = () => {
		const { layer, Delta_Z, qcVal, EcVal, IzVal, sumVal } = config.tableData
		layer.map((item, i) => {
			const row = document.createElement('tr')
			row.innerHTML = `
      <td>${layer[i]}</td>
      <td>${Delta_Z[i]}</td>
      <td>${qcVal[i]}</td>
      <td>${EcVal[i]}</td>
      <td>${IzVal[i]}</td>
      <td>${sumVal[i]}</td>
      `
			dataTableRowsEl.appendChild(row)
		})
	}

	const initEventListeners = () => {
		document
			.getElementById('add-field')
			.addEventListener('click', addConeInputFields)

		document
			.getElementById('remove-field')
			.addEventListener('click', removeLastConeInputField)

		document
			.getElementById('foundation-values')
			.addEventListener('submit', e => {
				processForm()
				buildDataTable()
				e.preventDefault()
			})
	}
	// at the end of window.onload, initiate our event listeners
	initEventListeners()
}
