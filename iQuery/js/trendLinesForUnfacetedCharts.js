const TrendLinesForUnfacetedCharts = {
	newSpecification: {},
	scatterplotSpecification: {},
	trendLineSpecifications: [],

	initSpecification: function() {
		const self = this;

		self.newSpecification = { layer: [] };
	},
	initScatterplotSpecification: function() {
		const self = this;
		let scatterplotSpecification = {};

		scatterplotSpecification.data = {};
		scatterplotSpecification.data.values = null;
		scatterplotSpecification.mark = 'point';
		scatterplotSpecification.encoding = {};
		
		self.initScatterplotXYSpec(scatterplotSpecification);
		self.initScatterplotSplittingAttrSpec(scatterplotSpecification);
		self.initScatterplotNonSplittingAttrSpec(scatterplotSpecification);
		self.initScatterplotTooltipSpec(scatterplotSpecification);
		self.scatterplotSpecification = scatterplotSpecification;
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
	addScatterplotData: function() {
		const self = this;
		let xAxisAttribute = TrendLines.xAxisAttribute;
		let yAxisAttribute = TrendLines.yAxisAttribute;
		let splittingAttributes = TrendLines.splittingAttributes;
		let nonSplittingAttributes = TrendLines.nonSplittingAttributes;
		let scatterplotData = [];

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
				scatterplotData.push(currentPointObject);
			}
		}

		self.scatterplotSpecification.data.values = scatterplotData;
	},
	addScatterplotSpecification: function() {
		const self = this;
		let newSpecification = self.newSpecification;
		let scatterplotSpecification = self.scatterplotSpecification;

		newSpecification.layer.push(scatterplotSpecification);
	},
	initTrendLineSpecifications: function () {
		const self = this;
		let splittingAttributes = TrendLines.splittingAttributes;
		let trendLineSpecifications = [];

		for (let i = 0; i < TrendLines.allGroups.length; i++) {
			let currentGroup = TrendLines.allGroups[i];
			let currentTrendLineSpecification = {};

			currentTrendLineSpecification.data = {};
			currentTrendLineSpecification.data.values = null;
			currentTrendLineSpecification.mark = null;
			currentTrendLineSpecification.encoding = {};
			
			self.initTrendLineXYSpec(currentTrendLineSpecification);
			self.initTrendLineMarkSpec(currentTrendLineSpecification, currentGroup);
			self.initTrendLineTooltipSpec(currentTrendLineSpecification);
			trendLineSpecifications.push(currentTrendLineSpecification);
		}

		self.trendLineSpecifications = trendLineSpecifications;
	},
	initTrendLineXYSpec: function(trendLineSpecification) {
		trendLineSpecification.encoding.x = { field: 'x', type: 'quantitative' };
		trendLineSpecification.encoding.y = { field: 'y', type: 'quantitative' };
	},
	initTrendLineMarkSpec: function(trendLineSpecification, currentGroup) {
		let splittingAttributes = TrendLines.splittingAttributes;
		let colorShelfHasSplitAttr = splittingAttributes !== null && 'color' in splittingAttributes;
		let currentMarkSpecification = { type: 'line' };

		if (colorShelfHasSplitAttr) {
			let colourShelfAttribute = currentGroup.splittingAttributes.color.name;
			let currentGroupColourValue = currentGroup.splittingAttributes.color.value;
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
	addTrendLineData: function() {
		const self = this;
		let splittingAttributes = TrendLines.splittingAttributes;
		let trendLineSpecifications = self.trendLineSpecifications;

		for (let i = 0; i < TrendLines.allGroups.length; i++) {
			let currentGroup = TrendLines.allGroups[i];
			let currentTrendLineSpecification = trendLineSpecifications[i];
			let currentPointsOnTrendLine = currentGroup.pointsOnTrendLine;

			for (let j = 0; j < currentPointsOnTrendLine.length; j++) 
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
					}

					if (!currentSplittingAttribute.isQuantitativeBin)
						currentPointsOnTrendLine[j][encodingName] = currentGroupValue;
				}

			currentTrendLineSpecification.data.values = currentPointsOnTrendLine;
		}
	},
	addTrendLineSpecifications: function() {
		const self = this;
		let newSpecification = self.newSpecification;
		let trendLineSpecifications = self.trendLineSpecifications;

		for (let i = 0; i < trendLineSpecifications.length; i++)
			newSpecification.layer.push(trendLineSpecifications[i]);
	},
	modifySpecificationWidthAndHeight: function() {
		const self = this;
		let width = VegaliteGenerator.specification.width;
		let height = VegaliteGenerator.specification.height;

		self.newSpecification.width = width;
		self.newSpecification.height = height;
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