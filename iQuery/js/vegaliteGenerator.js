let VegaliteGenerator = {
	width: { min: 50, max: 700 },
	height: { min: 50, max: 700 },
	currentZoomRatio: 1,
	specification: null,

	generateSpecification: function(resize = null, stopApplyingConstriants = false) {
		const self = this;
		let isDensityPlotSelected = ShowMe.isDensityPlotSelected();
		let isTrendLinesSelected = ShowMe.isTrendLinesSelected();

		if (isDensityPlotSelected)
			self.generateDensityPlotSpecification(resize, stopApplyingConstriants);

		if (isTrendLinesSelected)
			self.generateTrendLineSpecification(resize, stopApplyingConstriants);

		if (!isDensityPlotSelected && !isTrendLinesSelected)
			self.generateNormalSpecification(resize, stopApplyingConstriants);
	},
	generateDensityPlotSpecification: function(resize, stopApplyingConstriants) {
		const self = this;
		
		// set stopGeneratingSpec
		if (Shelves.areEmpty()) // to avoid bugs
			return;

		if (stopApplyingConstriants)
			DensityPlot.stopGeneratingSpec = false;

		if (!stopApplyingConstriants)
			DensityPlot.applyConstraints();

		// update visualization
		if (!DensityPlot.stopGeneratingSpec) {
			self.clearSpecification();
			self.setDimensions(resize);
			DensityPlot.init();
			DensityPlot.filterData();
			DensityPlot.findMinMax();
			DensityPlot.generateAllGroupCombinations();
			DensityPlot.generateProbDistForEachGroup();
			DensityPlot.modifyVegaLiteSpecification();
		}
	},
	generateTrendLineSpecification: function(resize, stopApplyingConstriants) {
		const self = this;
		
		// set stopGeneratingSpec
		if (Shelves.areEmpty()) // to avoid bugs
			return;

		if (stopApplyingConstriants)
			TrendLines.stopGeneratingSpec = false;
		
		if (!stopApplyingConstriants)
			TrendLines.applyConstraints();

		// update visualization
		if (!TrendLines.stopGeneratingSpec) {
			self.clearSpecification();
			self.setDimensions(resize);
			TrendLines.init();
			TrendLines.filterData();
			TrendLines.findMinMax();
			TrendLines.generateAllGroupCombinations();
			TrendLines.computeRegressionParamForEachGroup();
			TrendLines.generatePointsOnTrendLineForEachGroup();
			TrendLines.modifyVegaLiteSpecification();
		}
	},
	generateNormalSpecification: function(resize, stopApplyingConstriants) {
		const self = this;

		self.clearSpecification();
		self.setDimensions(resize);
		self.setEncoding();
		self.setFilter();

		if (!stopApplyingConstriants)
			self.applyConstraints(); // may block vis update

		self.adjustTooltipEncoding();
	},

	// functions for creating specification

	clearSpecification: function() {
		const self = this;
		let rawData = Database.data;

		self.specification = {
			data: { values: rawData },
			transform: [],
			width: null,
			height: null,
		    mark: 'point',
		    encoding: {}
		}
	},
	setDimensions: function(resize, specification = null) {
		const self = this;
		let dimensions = { width: null, height: null };
		let currentSpecification = (specification !== null) ? specification : self.specification;
		
		self.setBaseDimension(dimensions);
		self.setZoomingLevel(resize, dimensions);
		self.relaxWidthRestriction(dimensions);
		self.relaxHeightRestriction(dimensions);

		if ('width' in dimensions)
			currentSpecification.width = dimensions.width;
		if ('height' in dimensions)
			currentSpecification.height = dimensions.height;
	},
	setBaseDimension: function(dimensions) {
		let isRowOccupied = !Shelf.row.isEmpty();
		let isColumnOccupied = !Shelf.column.isEmpty();
		let isFacetedChart = (isRowOccupied || isColumnOccupied);
		let isSingleChart = !isFacetedChart;

		if (isFacetedChart) {
			let canvasWidth = 200;
			let canvasHeight = 200;

			dimensions.width = canvasWidth;
			dimensions.height = canvasHeight;
		}

		if (isSingleChart) {
			let visualizationPaneContentWidth = $('#visualization-pane .content').width();
			let visualizationPaneContentHeight = $('#visualization-pane .content').height();
			let canvasWidth = (visualizationPaneContentWidth * 0.8 - 30 < 20) ? 20 : (visualizationPaneContentWidth * 0.8 - 30);
			let canvasHeight = (visualizationPaneContentHeight * 0.8 - 30 < 20) ? 20 : (visualizationPaneContentHeight * 0.8 - 30);

			dimensions.width = (canvasWidth < canvasHeight) ? canvasWidth : canvasHeight;
			dimensions.height = (canvasWidth < canvasHeight) ? canvasWidth : canvasHeight;
		}
	},
	setZoomingLevel: function(resize, dimensions) {
		const self = this;
		let currentZoomRatio = self.currentZoomRatio;
		let maxWidth = self.width.max;
		let minWidth = self.width.min;

		let clickedIncreaseSizeButton = (resize == 'increase');
		let exceedMaxSizeAfterIncreaseSize = dimensions.width * (currentZoomRatio + 0.2) < maxWidth;
		let clickedDecreaseSizeButton = (resize == 'reduce');
		let belowMinSizeAfterDecreaseSize = dimensions.width * (currentZoomRatio - 0.2) > minWidth;

		if (clickedIncreaseSizeButton && exceedMaxSizeAfterIncreaseSize)
			currentZoomRatio = currentZoomRatio + 0.2;

		if (clickedDecreaseSizeButton && belowMinSizeAfterDecreaseSize)
			currentZoomRatio = currentZoomRatio - 0.2;

		dimensions.width = dimensions.width * currentZoomRatio;
		dimensions.height = dimensions.height * currentZoomRatio;
		self.currentZoomRatio = currentZoomRatio;
	},
	relaxWidthRestriction: function(dimensions) {
		const self = this;
		let isXAxisOccupied = !Shelf.xAxis.isEmpty();
		let xAttribute = isXAxisOccupied ? Shelf.xAxis.getCapsuleData() : null;
		let isXAttributeNominal = isXAxisOccupied ? (xAttribute.type == 'nominal') : false;
		let xAttributeHasTooManyCategories = isXAxisOccupied ? (Database.attributeMetadata[xAttribute.attributeName].numberOfUniqueValues > 10) : false;

		// x has too many categories
		if (isXAttributeNominal && xAttributeHasTooManyCategories)
			delete dimensions.width;
	},
	relaxHeightRestriction: function(dimensions) {
		const self = this;
		let isYAxisOccupied = !Shelf.yAxis.isEmpty();
		let yAttribute = isYAxisOccupied ? Shelf.yAxis.getCapsuleData(): null;
		let isYAttributeNominal = isYAxisOccupied ? (yAttribute.type == 'nominal') : false;
		let yAttributeHasTooManyCategories = isYAxisOccupied ? (Database.attributeMetadata[yAttribute.attributeName].numberOfUniqueValues > 10) : false;

		// y has too many categories
		if (isYAttributeNominal && yAttributeHasTooManyCategories)
			delete dimensions.height;
	},
	setEncoding: function(specification = null) {
		const self = this;

		for (let shelfName in Shelf)
			self.setOneEncoding(shelfName, specification)
	},
	setOneEncoding: function(shelfName, specification = null) {
		if (Shelf[shelfName].isEmpty())
			return;

		const self = this;
		let currentSpecification = (specification !== null) ? specification : self.specification;
		let capsuleContainerEl = $(Shelf[shelfName].className + ' .container')[0];
		let capsuleData = d3.select(capsuleContainerEl).datum();

		let encodingName = Shelf[shelfName].encodingName;
		let attributeName = capsuleData.attributeName;
		let attributeType = capsuleData.type;
		let attributeAggregate = capsuleData.aggregate;
		let attributeTimeUnit = capsuleData.timeUnit;
		let isAutoGenerated = capsuleData.isAutoGenerated;
		let attributeMaxbins = capsuleData.maxbins;

		let isNumberOfRecordsOnShelf = (attributeName == 'Number of Records' && isAutoGenerated);
		let isQuantitaiveVariable = (attributeType == 'quantitative' && !isNumberOfRecordsOnShelf);
		let isTemporalVariable = (attributeType == 'temporal');
		let isAttributeOriginallyNominal = (attributeName in Database.categoryToColourDictForEachNominalAttr);
		
		if (isNumberOfRecordsOnShelf) // count
			currentSpecification.encoding[encodingName] = {field: '*', type: 'quantitative', aggregate: 'count' }
		else if (isQuantitaiveVariable && attributeAggregate != 'none' && attributeAggregate != 'bin') // quantitative
			currentSpecification.encoding[encodingName] = { field: attributeName, type: attributeType, aggregate: attributeAggregate };
		else if (isQuantitaiveVariable && attributeAggregate == 'bin' && attributeMaxbins == 'none') // bin quantitative
			currentSpecification.encoding[encodingName] = { field: attributeName, type: attributeType, bin: {} };
		else if (isQuantitaiveVariable && attributeAggregate == 'bin' && attributeMaxbins != 'none') // bin quantitative
			currentSpecification.encoding[encodingName] = { field: attributeName, type: attributeType, bin: { maxbins: attributeMaxbins } };
		else if (isTemporalVariable && attributeTimeUnit != 'none') // temporal
			currentSpecification.encoding[encodingName] = { field: attributeName, type: attributeType, timeUnit: attributeTimeUnit };
		else if (isAttributeOriginallyNominal && shelfName == 'colour') // handle colour
			currentSpecification.encoding[encodingName] = { field: attributeName, type: attributeType, scale: generateColourScale() };
		else
			currentSpecification.encoding[encodingName] = { field: attributeName, type: attributeType };

		// hacky!! best way is to filter all data points to see what exists
		function generateColourScale() {
			let categoryToColourDict = Database.categoryToColourDictForEachNominalAttr[attributeName];
			let allCategories = Object.keys(categoryToColourDict).sort();
			let filteredCategories = []
			let colourCodeList = [];
			let filterName = attributeName + ':nominal';
			let checkedItemList = allCategories;
			let needToRemoveMissingValues = false;

			if (filterName in Filter) {
				checkedItemList = Filter[filterName].getCheckedItemList();
				needToRemoveMissingValues = Filter[filterName].isMissingValueButtonSelected();
			}
			for (let i = 0; i < allCategories.length; i++) {
				let currentCategory = allCategories[i];
				let currentCategoryFoundInCheckedItemList = checkedItemList.indexOf(currentCategory) != -1;
				if (currentCategory == '##missing' && needToRemoveMissingValues) continue;
				if (!currentCategoryFoundInCheckedItemList) continue;
				filteredCategories.push(currentCategory);
			}
			for (let i = 0; i < filteredCategories.length; i++) {
				let currentCategory = filteredCategories[i];
				let currentColourCode = categoryToColourDict[currentCategory];
				colourCodeList.push(currentColourCode);
			}

			return {
				domain: filteredCategories,
				range: colourCodeList 
			};
		}
	},
	setFilter: function(specification = null) {
		const self = this;
		let currentSpecification = (specification !== null) ? specification : self.specification;

		for (let filterName in Filter) {
			let filterSpecification = { filter: Filter[filterName].filterSpecification };
			let filterMissingValueSpec = { filter: 'datum["' + Filter[filterName].attributeName + '"] != null' };
			let needToRemoveMissingValues = Filter[filterName].removeMissing && ('range' in Filter[filterName].filterSpecification); // missing value already handled for list

			if (needToRemoveMissingValues) {
				currentSpecification.transform.push(filterSpecification);
				currentSpecification.transform.push(filterMissingValueSpec);
			}
			if (!needToRemoveMissingValues)
				currentSpecification.transform.push(filterSpecification);
		}
	},
	adjustTooltipEncoding: function(specification = null) {
		const self = this;
		let allEncodings = [];
		let tooltipShelfIsOccupied = !Shelf['tooltip'].isEmpty();
		let currentSpecification = (specification !== null) ? specification : self.specification;

		if (tooltipShelfIsOccupied) {
			// get all encodings
			allEncodings.push(currentSpecification.encoding['tooltip']);
			
			for (let currentEncodingName in currentSpecification.encoding)
				if (currentEncodingName != 'tooltip')
					allEncodings.push(currentSpecification.encoding[currentEncodingName]);

			// adjust tooltip
			currentSpecification.encoding['tooltip'] = allEncodings;
		}
	},
	applyConstraints: function(specification = null) {
		const self = this;
		let currentSpecification = (specification !== null) ? specification : self.specification;

		for (let i = 0; i < Constraints.length; i++) {
			let currentIfConditions = Constraints[i].if;
			let currentThenCondition = Constraints[i].then;
			let currentCallback = Constraints[i].callback;
			let hasCallback = ('callback' in Constraints[i]);

			if (satisfyIfCondition(currentIfConditions)) {
				modifySpecification(currentThenCondition);

				if (hasCallback)
					currentCallback();
			}
		}

		function satisfyIfCondition(ifConditions) {
			let satisfyAnyOneCondition = false;
			let allSpecificationEncodings = currentSpecification.encoding;

			for (let i = 0; i < ifConditions.length; i++) {
				let allRequiredEncodings = ifConditions[i].encoding;
				let satisfyCurrentIfCondition = true;

				// check if current if condition is satisfied
				for (let currentEncodingType in allRequiredEncodings) {
					let currentSpecificationEncoding = allSpecificationEncodings[currentEncodingType];
					let currentRequiredEncoding = allRequiredEncodings[currentEncodingType];
					let isCurrentEncodingTypeInRequiredEncoding = (currentRequiredEncoding !== null)
					let isCurrentEncodingTypeInSpecification = (currentEncodingType in allSpecificationEncodings);
					
					// require to be empty but specification is not empty
					if (!isCurrentEncodingTypeInRequiredEncoding && isCurrentEncodingTypeInSpecification)
						satisfyCurrentIfCondition = false;

					// require not empty but specification is empty
					if (isCurrentEncodingTypeInRequiredEncoding && !isCurrentEncodingTypeInSpecification)
						satisfyCurrentIfCondition = false;

					// not empty, check if all requirements are met
					if (isCurrentEncodingTypeInRequiredEncoding && isCurrentEncodingTypeInSpecification) {
						for (currentEncodingProp in currentRequiredEncoding) {
							let isCurrentEncodingPropInSpecificationEncoding = (currentEncodingProp in currentSpecificationEncoding);
							let isCurrentEncodingPropInRequiredEncoding = (currentRequiredEncoding[currentEncodingProp] !== null);
							let isDiffInEncodingProp = (currentSpecificationEncoding[currentEncodingProp] !== currentRequiredEncoding[currentEncodingProp]);

							if (currentEncodingProp == 'bin') // bin is a special case
								isDiffInEncodingProp = false;

							if ((isCurrentEncodingPropInRequiredEncoding && isCurrentEncodingPropInSpecificationEncoding && isDiffInEncodingProp) ||
								(isCurrentEncodingPropInRequiredEncoding && !isCurrentEncodingPropInSpecificationEncoding) ||
								(!isCurrentEncodingPropInRequiredEncoding && isCurrentEncodingPropInSpecificationEncoding)) { satisfyCurrentIfCondition = false; break; }
						}
					}
				}

				// if satisfied one condition, no further checking is required
				if (satisfyCurrentIfCondition) {
					satisfyAnyOneCondition = true;
					break;
				}
			}

			return satisfyAnyOneCondition;
		}

		function modifySpecification(thenCondition) {
			if ('width' in thenCondition) modifyWidth(thenCondition);
			if ('height' in thenCondition) modifyHeight(thenCondition);
			if ('mark' in thenCondition) modifyMark(thenCondition);
			if ('encoding' in thenCondition) modifyEncoding(thenCondition);
		}

		function modifyWidth(thenCondition) {
			if (thenCondition.width === null)
				delete currentSpecification.width;
			if (thenCondition.width !== null)
				currentSpecification.width = thenCondition['width'];
		}

		function modifyHeight(thenCondition) {
			if (thenCondition.height === null)
				delete currentSpecification.height;
			if (thenCondition.height !== null)
				currentSpecification.height = thenCondition['height'];
		}

		function modifyMark(thenCondition) {
			if (thenCondition.mark === null)
				delete currentSpecification.mark;
			if (thenCondition.mark !== null)
				currentSpecification.mark = thenCondition['mark'];
		}

		function modifyEncoding(thenCondition) {
			let allRequiredEncodings = thenCondition.encoding;
			let allSpecificationEncodings = currentSpecification.encoding;

			for (currentEncodingType in allRequiredEncodings) {
				let currentRequiredEncoding = allRequiredEncodings[currentEncodingType];
				let currentSpecificationEncoding = allSpecificationEncodings[currentEncodingType];
				let requiredHasCurrentEncodingType = (currentRequiredEncoding !== null);
				let specificationHasCurrentEncodingType = (currentEncodingType in allSpecificationEncodings);

				// encoding present only in current specification, delete encoding
				if (!requiredHasCurrentEncodingType && specificationHasCurrentEncodingType)
					delete currentSpecificationEncoding;

				// encoding present in both required and current specification, // add new, update or remove property
				if (requiredHasCurrentEncodingType && specificationHasCurrentEncodingType) {
					for (currentEncodingProp in currentRequiredEncoding) {
						if (currentRequiredEncoding[currentEncodingProp] !== null)
							currentSpecificationEncoding[currentEncodingProp] = currentRequiredEncoding[currentEncodingProp];
						if (currentRequiredEncoding[currentEncodingProp] === null)
							delete currentSpecificationEncoding[currentEncodingProp]; 
					}
				}

				// encoding present only in required specification, add new encoding and add new properties
				if (requiredHasCurrentEncodingType && !currentRequiredEncoding) {
					allSpecificationEncodings[currentEncodingType] = {};
					currentSpecificationEncoding = allSpecificationEncodings[currentEncodingType];

					for (currentEncodingProp in currentRequiredEncoding)
						if (currentRequiredEncoding[currentEncodingProp] !== null)
							currentSpecificationEncoding[currentEncodingProp] = currentRequiredEncoding[currentEncodingProp];
				}
			}
		}
	}
}