const TrendLinesForFacetedCharts = {
	allLayers: [], // [ { encodingName: { name, value } ... } ] (array of layer objects)
	newSpecification: {},

	initSpecification: function() {
		const self = this;
		let newSpecification = {};

		newSpecification.data = {};
		newSpecification.data.values = [];
		newSpecification.facet = {};
		newSpecification.spec = {};
		newSpecification.spec.layer = [];

		self.initFacetSpecification(newSpecification);
		self.newSpecification = newSpecification;
	},
	initFacetSpecification: function(newSpecification) {
		let splittingAttributes = TrendLines.splittingAttributes;
		let rowIsOccupied = 'row' in splittingAttributes;
		let columnIsOccupied = 'column' in splittingAttributes;

		if (rowIsOccupied && !splittingAttributes.row.isQuantitativeBin) 
			newSpecification.facet.row = {
				field: 'row',
				type: 'nominal',
				axis: { title: splittingAttributes.row.name }
			};

		if (rowIsOccupied && splittingAttributes.row.isQuantitativeBin) 
			newSpecification.facet.row = {
				field: 'row',
				type: 'nominal',
				axis: { title: splittingAttributes.row.name },
				sort: TrendLines.getSortedRanges(splittingAttributes.row)
			};

		if (columnIsOccupied && !splittingAttributes.column.isQuantitativeBin)
			newSpecification.facet.column = {
				field: 'column',
				type: 'nominal',
				axis: { title: splittingAttributes.column.name }
			};

		if (columnIsOccupied && splittingAttributes.column.isQuantitativeBin)
			newSpecification.facet.column = {
				field: 'column',
				type: 'nominal',
				axis: { title: splittingAttributes.column.name },
				sort: TrendLines.getSortedRanges(splittingAttributes.column)
			};
	},
	addData: function() {
		const self = this;
		let data = [];

		self.addScatterplotData(data);
		self.addTrendLineData(data);
		self.newSpecification.data.values = data;
	},
	addScatterplotData: function(data) {
		let xAxisAttribute = TrendLines.xAxisAttribute;
		let yAxisAttribute = TrendLines.yAxisAttribute;
		let splittingAttributes = TrendLines.splittingAttributes;
		let nonSplittingAttributes = TrendLines.nonSplittingAttributes;

		let isTooltipShelfEmpty = Shelf.tooltip.isEmpty();
		let tooltipShelfData = Shelf.tooltip.getCapsuleData();

		for (let i = 0; i < TrendLines.allGroups.length; i++) {
			let currentGroup = TrendLines.allGroups[i];

			for (let j = 0; j < currentGroup.objects.length; j++) {
				let currentRow = currentGroup.objects[j];
				let currentPointObject = {};

				// splitting
				for (let encodingName in currentGroup.splittingAttributes) {
					let currentSplittingAttribute = splittingAttributes[encodingName];
					let currentGroupValue = currentGroup.splittingAttributes[encodingName].value;

					if (currentSplittingAttribute.isQuantitativeBin) {
						let currentBinIndex = currentGroupValue;
						let currentLowerBound = currentSplittingAttribute.min + currentBinIndex * currentSplittingAttribute.binSize;
						let currentUpperBound = currentLowerBound + currentSplittingAttribute.binSize;

						if (currentLowerBound.countDecimals() > 2) currentLowerBound = currentLowerBound.toFixed(2);
						if (currentUpperBound.countDecimals() > 2) currentUpperBound = currentUpperBound.toFixed(2);
						currentPointObject[encodingName] = currentLowerBound + ' - ' + currentUpperBound;
					}

					if (!currentSplittingAttribute.isQuantitativeBin)
						currentPointObject[encodingName] = currentGroupValue;
				}

				// non splitting
				for (let encodingName in nonSplittingAttributes)
					currentPointObject[nonSplittingAttributes[encodingName].name] = currentRow[nonSplittingAttributes[encodingName].name];

				// others
				if (!isTooltipShelfEmpty)
					currentPointObject[tooltipShelfData.attributeName] = currentRow[tooltipShelfData.attributeName];

				currentPointObject.x = currentRow[xAxisAttribute.name];
				currentPointObject.y = currentRow[yAxisAttribute.name];
				currentPointObject.objectType = 'point';
				data.push(currentPointObject);
			}
		}
	},
	addTrendLineData: function(data) {
		const self = this;
		let splittingAttributes = TrendLines.splittingAttributes;

		for (let i = 0; i < TrendLines.allGroups.length; i++) {
			let currentGroup = TrendLines.allGroups[i];
			let currentPointsOnTrendLine = currentGroup.pointsOnTrendLine;

			for (let j = 0; j < currentPointsOnTrendLine.length; j++) {
				for (let encodingName in currentGroup.splittingAttributes) {
					let currentSplittingAttribute = splittingAttributes[encodingName];
					let currentGroupValue = currentGroup.splittingAttributes[encodingName].value;

					if (currentSplittingAttribute.isQuantitativeBin) {
						let currentBinIndex = currentGroupValue;
						let currentLowerBound = currentSplittingAttribute.min + currentBinIndex * currentSplittingAttribute.binSize;
						let currentUpperBound = currentLowerBound + currentSplittingAttribute.binSize;

						if (currentLowerBound.countDecimals() > 2) currentLowerBound = currentLowerBound.toFixed(2);
						if (currentUpperBound.countDecimals() > 2) currentUpperBound = currentUpperBound.toFixed(2);
						currentPointsOnTrendLine[j][encodingName] = currentLowerBound + ' - ' + currentUpperBound;
						currentPointsOnTrendLine[j].objectType = 'line';
					}

					if (!currentSplittingAttribute.isQuantitativeBin) {
						currentPointsOnTrendLine[j][encodingName] = currentGroupValue;
						currentPointsOnTrendLine[j].objectType = 'line';
					}
				}

				data.push(currentPointsOnTrendLine[j]);
			}
		}
	},
	findAllLayers: function() {
		const self = this;
		let splittingAttributes = TrendLines.splittingAttributes;
		let splittingAttributeArray = [];
		let numberOfLayers = 1;
		let allLayers = [];

		// init
		for (let encodingName in splittingAttributes)
			if (encodingName != 'row' && encodingName != 'column')
				splittingAttributeArray.push(splittingAttributes[encodingName]);

		for (let i = 0; i < splittingAttributeArray.length; i++) {
			let currentSplittingAttribute = splittingAttributeArray[i];
			let currentMagicNumber = 1;

			if (i > 0) 
				for (let j = 0; j < i; j++) 
					currentMagicNumber *= splittingAttributeArray[j].allGroups.length;

			currentSplittingAttribute.magicNumber = currentMagicNumber;
			numberOfLayers *= currentSplittingAttribute.allGroups.length;
		}

		for (let i = 0; i < numberOfLayers; i++)
			allLayers.push({});

		// create allLayer
		for (let i = 0; i < splittingAttributeArray.length; i++) {
			let currentSplittingAttribute = splittingAttributeArray[i];
			let currentSplittingAttrGroupIndex = -1;
			let currentSplittingAttrGroup = null;
			let currentMagicNumber = currentSplittingAttribute.magicNumber;

			for (let j = 0; j < numberOfLayers; j++) {
				let attributeObject = {};

				if (j % currentMagicNumber == 0) { // get currentSplittingAttrGroup
					currentSplittingAttrGroupIndex++;
					currentSplittingAttrGroupIndex = currentSplittingAttrGroupIndex % currentSplittingAttribute.allGroups.length;
					currentSplittingAttrGroup = currentSplittingAttribute.allGroups[currentSplittingAttrGroupIndex];
				}

				attributeObject.name = currentSplittingAttribute.name;
				attributeObject.value = currentSplittingAttrGroup;
				allLayers[j][currentSplittingAttribute.encodingName] = attributeObject;
			}
		}

		self.allLayers = allLayers;
	},
	initScatterplotSpecification: function() {
		const self = this;
		let scatterplotSpecification = {};

		scatterplotSpecification.transform = [ { filter: { field: "objectType", equal: "point" } } ];
		scatterplotSpecification.mark = "point";
		scatterplotSpecification.encoding = {};

		self.initScatterplotXYSpec(scatterplotSpecification);
		self.initScatterplotSplittingAttrSpec(scatterplotSpecification);
		self.initScatterplotNonSplittingAttrSpec(scatterplotSpecification);
		self.initScatterplotTooltipSpec(scatterplotSpecification);
		self.newSpecification.spec.layer.push(scatterplotSpecification);
	},
	initScatterplotXYSpec: function(scatterplotSpecification) {
		let xAxisAttribute = TrendLines.xAxisAttribute;
		let yAxisAttribute = TrendLines.yAxisAttribute;

		scatterplotSpecification.encoding.x = { field: 'x', type: 'quantitative', axis: { title: xAxisAttribute.name } };
		scatterplotSpecification.encoding.y = { field: 'y', type: 'quantitative', axis: { title: yAxisAttribute.name } };

		if (xAxisAttribute.isTemporal) {
			scatterplotSpecification.encoding.x.axis.format = 'd';
			scatterplotSpecification.encoding.x.scale = {};
			scatterplotSpecification.encoding.x.scale.domain = [ xAxisAttribute.min, xAxisAttribute.max ];
		}

		if (yAxisAttribute.isTemporal) {
			scatterplotSpecification.encoding.y.axis.format = 'd';
			scatterplotSpecification.encoding.y.scale = {};
			scatterplotSpecification.encoding.y.scale.domain = [ yAxisAttribute.min, yAxisAttribute.max ];
		}
	},
	initScatterplotSplittingAttrSpec: function(scatterplotSpecification) {
		const self = this;
		let splittingAttributes = TrendLines.splittingAttributes;

		for (let encodingName in splittingAttributes)
			if (encodingName != 'row' && encodingName != 'column') {
				let currentSplittingAttr = splittingAttributes[encodingName];
				let attributeName = currentSplittingAttr.name;
				let categoryList = currentSplittingAttr.allGroups;
				let colorScale = (encodingName == 'color') ? self.generateColourScale(attributeName, categoryList) : null;
				let title = currentSplittingAttr.name;

				if (!currentSplittingAttr.isQuantitativeBin && colorScale === null)
					scatterplotSpecification.encoding[encodingName] = {
						field: encodingName,
						type: 'nominal',
						axis: { title: title }
					};

				if (!currentSplittingAttr.isQuantitativeBin && colorScale !== null)
					scatterplotSpecification.encoding[encodingName] = {
						field: encodingName,
						type: 'nominal',
						axis: { title: title },
						scale: colorScale
					};
				
				if (currentSplittingAttr.isQuantitativeBin)
					scatterplotSpecification.encoding[encodingName] = {
						field: encodingName,
						type: 'nominal',
						axis: { title: title },
						sort: TrendLines.getSortedRanges(currentSplittingAttr)
					};
			}
	},
	initScatterplotNonSplittingAttrSpec: function(scatterplotSpecification) {
		let nonSplittingAttributes = TrendLines.nonSplittingAttributes;

		for (let encodingName in nonSplittingAttributes) {
			let shelfName = (encodingName == 'color') ? 'colour' : encodingName;
			VegaliteGenerator.setOneEncoding(shelfName, scatterplotSpecification);
		}
	},
	initScatterplotTooltipSpec: function(scatterplotSpecification) {
		let isTooltipShelfEmpty = Shelf.tooltip.isEmpty();

		if (!isTooltipShelfEmpty) {
			VegaliteGenerator.setOneEncoding('tooltip', scatterplotSpecification);
			VegaliteGenerator.adjustTooltipEncoding(scatterplotSpecification);
		}
	},
	initTrendLineSpecifications: function(scatterplotSpecification) {
		const self = this;
		let splittingAttributes = TrendLines.splittingAttributes;

		for (let i = 0; i < self.allLayers.length; i++) {
			let currentLayerConfig = self.allLayers[i];
			let currentTrendLineSpecification = {};

			currentTrendLineSpecification.transform = null;
			currentTrendLineSpecification.mark = "line";
			currentTrendLineSpecification.encoding = {};

			self.initTrendLineFilterSpec(currentTrendLineSpecification, currentLayerConfig);
			self.initTrendLineXYSpec(currentTrendLineSpecification);
			self.initTrendLineMarkSpec(currentTrendLineSpecification, currentLayerConfig);
			self.initTrendLineTooltipSpec(currentTrendLineSpecification);
			self.newSpecification.spec.layer.push(currentTrendLineSpecification);
		}
	},
	initTrendLineFilterSpec: function(trendLineSpecification, layerConfig) {
		let splittingAttributes = TrendLines.splittingAttributes;

		trendLineSpecification.transform = [ { filter: { field: "objectType", equal: "line" } } ];

		for (let encodingName in layerConfig) {
			let currentGroupValue = layerConfig[encodingName].value;
			let currentFilterObject = { filter: { field: encodingName, equal: currentGroupValue } };
			let currentSplittingAttribute = splittingAttributes[encodingName];

			if (currentSplittingAttribute.isQuantitativeBin) {
				let currentBinIndex = currentGroupValue;
				let currentLowerBound = currentSplittingAttribute.min + currentBinIndex * currentSplittingAttribute.binSize;
				let currentUpperBound = currentLowerBound + currentSplittingAttribute.binSize;

				if (currentLowerBound.countDecimals() > 2) currentLowerBound = currentLowerBound.toFixed(2);
				if (currentUpperBound.countDecimals() > 2) currentUpperBound = currentUpperBound.toFixed(2);
				currentFilterObject.filter.equal = currentLowerBound + ' - ' + currentUpperBound;
			}

			trendLineSpecification.transform.push(currentFilterObject);
		}	
	},
	initTrendLineXYSpec: function(trendLineSpecification) {
		trendLineSpecification.encoding.x = { field: 'x', type: 'quantitative' };
		trendLineSpecification.encoding.y = { field: 'y', type: 'quantitative' };
	},
	initTrendLineMarkSpec: function(trendLineSpecification, layerConfig) {
		let splittingAttributes = TrendLines.splittingAttributes;
		let colorShelfHasSplitAttr = splittingAttributes !== null && 'color' in splittingAttributes;
		let currentMarkSpecification = { type: 'line' };

		if (colorShelfHasSplitAttr) {
			let colourShelfAttribute = layerConfig.color.name;
			let currentGroupColourValue = layerConfig.color.value;
			let isAttrOriginallyNominal = colourShelfAttribute in Database.categoryToColourDictForEachNominalAttr;
			let currentGroupColourCode = null;

			if (isAttrOriginallyNominal)
				currentGroupColourCode = Database.categoryToColourDictForEachNominalAttr[colourShelfAttribute][currentGroupColourValue];
			if (!isAttrOriginallyNominal)
				currentGroupColourCode = TrendLines.categoryToColourDict[currentGroupColourValue];

			currentMarkSpecification.stroke = currentGroupColourCode;
		}

		trendLineSpecification.mark = currentMarkSpecification;
	},
	initTrendLineTooltipSpec: function(trendLineSpecification) {
		let splittingAttributes = TrendLines.splittingAttributes;

		if (splittingAttributes === null)
			trendLineSpecification.encoding.tooltip = { value: false };
		if (splittingAttributes !== null)
			trendLineSpecification.encoding.tooltip = [];

		for (let encodingName in splittingAttributes) {
			let currentSplittingAttribute = splittingAttributes[encodingName];
			let newEncodingSpecification = { field: encodingName, type: 'nominal', axis: { title: currentSplittingAttribute.name } };
			trendLineSpecification.encoding.tooltip.push(newEncodingSpecification);
		}
	},
	modifySpecificationWidthAndHeight: function() {
		const self = this;
		let width = VegaliteGenerator.specification.width;
		let height = VegaliteGenerator.specification.height;

		self.newSpecification.spec.layer[0].width = width;
		self.newSpecification.spec.layer[0].height = height;
	},
	generateColourScale: function(attributeName, categoryList) { // assuming no missing values in categoryList
		let isOriginallyNominal = (attributeName in Database.categoryToColourDictForEachNominalAttr);
		let categoryToColourDict = isOriginallyNominal ? Database.categoryToColourDictForEachNominalAttr[attributeName] : null;
		let colourCodeList = [];

		if (!isOriginallyNominal)
			return null;

		for (let i = 0; i < categoryList.length; i++) {
			let currentCategory = categoryList[i];
			let currentColourCode = categoryToColourDict[currentCategory];
			colourCodeList.push(currentColourCode);
		}
		return {
			domain: categoryList,
			range: colourCodeList
		};
	}
}