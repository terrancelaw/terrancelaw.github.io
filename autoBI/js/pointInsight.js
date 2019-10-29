const PointInsight = {
	insightList: null,
	visList: null,
	threshold: null,

	search: function() {
		const self = this;
		let dataByAttrByCategory = self.getDataByAttrByCategory()
		let countInsightList = self.generateCountInsights(dataByAttrByCategory);
		let measureInsightList = self.generateMeasureInsights(dataByAttrByCategory);
		let insightList = countInsightList.concat(measureInsightList);
		self.insightList = insightList;
	},
	generateVis: function() {
		const self = this;
		let insightList = self.insightList;
		let visList = [];

		for (let i = 0; i < insightList.length; i++) {
			let currentInsight = insightList[i];
			let description = self.generateDescription(currentInsight);
			let VLSpec = self.generateVLSpec(currentInsight);
			
			visList.push({
				insightSpec: currentInsight,
				VLSpec: VLSpec,
				description: description,
				score: Math.abs(currentInsight.data.score)
			});
		}

		self.visList = visList;
	},
	storeVis: function() {
		const self = this;
		let visList = self.visList;

		InsightHandler.visList = InsightHandler.visList.concat(visList);
	},

	// search

	getDataByAttrByCategory: function() {
		let data = Database.data;
		let nominalAttrList = Database.getAttributeList('nominal');
		let ordinalAttrList = Database.getAttributeList('ordinal');
		let attributeList = nominalAttrList.concat(ordinalAttrList);
		let dataByAttrByCategory = {};

		for (let i = 0; i < attributeList.length; i++) {
			let attributeName = attributeList[i];
			let dataByCategory = d3.nest()
				.key(function(d) { return d[attributeName] })
				.object(data);

			dataByAttrByCategory[attributeName] = dataByCategory;
		}
		
		return dataByAttrByCategory;
	},
	generateCountInsights: function(dataByAttrByCategory) {
		const self = this;
		let countInsightList = [];

		for (let attributeName in dataByAttrByCategory) {
			let attributeType = Database.attributeMetadata[attributeName].type;
			let dataByCategory = dataByAttrByCategory[attributeName];
			let countByCategory = self.getValueByCategory(dataByCategory);
			[ maxCount, maxCategory ]= self.getMax(countByCategory);
			let secondMaxCount = self.getSecondMax(countByCategory, maxCount);

			if (maxCount / secondMaxCount >= 2)
				countInsightList.push({
					type: 'count',
					quantitativeAttrList: [],
					temporalAttrList: [],
					ordinalAttrList: (attributeType == 'ordinal') ? [ attributeName ] : [],
					nominalAttrList: (attributeType == 'nominal') ? [ attributeName ] : [],
					data: { maxCategory: maxCategory, score: (maxCount / secondMaxCount) / 3 }
				});
		}

		return countInsightList;
	},
	generateMeasureInsights: function(dataByAttrByCategory) {
		const self = this;
		let quantitativeAttrList = Database.getAttributeList('quantitative');
		let measureInsightList = [];

		for (let attributeName in dataByAttrByCategory) {
			let attributeType = Database.attributeMetadata[attributeName].type;
			let dataByCategory = dataByAttrByCategory[attributeName];

			for (let i = 0; i < quantitativeAttrList.length; i++) {
				let quantitativeAttr = quantitativeAttrList[i];
				let meanByCategory = self.getValueByCategory(dataByCategory, quantitativeAttr);
				[ maxMean, maxCategory ]= self.getMax(meanByCategory);
				let secondMaxMean = self.getSecondMax(meanByCategory, maxMean);

				if (maxMean / secondMaxMean >= 2)
					measureInsightList.push({
						type: 'mean',
						quantitativeAttrList: [ quantitativeAttr ],
						temporalAttrList: [],
						ordinalAttrList: (attributeType == 'ordinal') ? [ attributeName ] : [],
						nominalAttrList: (attributeType == 'nominal') ? [ attributeName ] : [],
						data: { 
							maxCategory: maxCategory, 
							score: (maxMean / secondMaxMean) / 3 
						}
					});
			}
		}

		return measureInsightList;
	},
	getValueByCategory: function(dataByCategory, quantitativeAttr = null) {
		let valueByCategory = {};

		if (quantitativeAttr === null)
			for (let category in dataByCategory) {
				let count = dataByCategory[category].length;
				valueByCategory[category] = count;
			}
		if (quantitativeAttr !== null)
			for (let category in dataByCategory) {
				let mean = computeMean(dataByCategory[category], quantitativeAttr);
				valueByCategory[category] = mean;
			}

		return valueByCategory;
	},
	getMax: function(valueByCategory) {
		let maxValue = -Infinity;
		let maxCategory = null;

		for (let category in valueByCategory) {
			let value = valueByCategory[category];

			if (value > maxValue) {
				maxValue = value;
				maxCategory = category; 
			}
		}

		return [ maxValue, maxCategory ];
	},
	getSecondMax: function(valueByCategory, maxValue) {
		let secondMaxValue = -Infinity;

		for (let category in valueByCategory) {
			let value = valueByCategory[category];

			if (value > secondMaxValue && value < maxValue)
				secondMaxValue = value;
		}

		return secondMaxValue;
	},

	// generateVis

	generateDescription: function(insight) {
		let categoricalAttr = (insight.ordinalAttrList.length == 0) ? insight.nominalAttrList[0] : insight.ordinalAttrList[0];
		let quantitativeAttr = (insight.quantitativeAttrList == 0) ? [] : insight.quantitativeAttrList[0]

		if (insight.type == 'count')
			return '<span class="category-name">' + insight.data.maxCategory + '</span>' + 
				   ' seems to have many more records in the data.';

		if (insight.type == 'mean')
			return '<span class="category-name">' + insight.data.maxCategory + '</span>' + 
				   ' seems to have a much higher average for ' + 
				   '<span class="attribute-name">' + quantitativeAttr + '</span>.';
	},
	generateVLSpec: function(insight) {
		let categoricalAttr = (insight.ordinalAttrList.length == 0) ? insight.nominalAttrList[0] : insight.ordinalAttrList[0];
		let quantitativeAttr = (insight.quantitativeAttrList == 0) ? [] : insight.quantitativeAttrList[0]
		let categoricalAttrType = (insight.ordinalAttrList.length != 0) ? 'ordinal' : 'nominal';

		if (insight.type == 'count')
			return {
			  	$schema: "https://vega.github.io/schema/vega-lite/v4.json",
			  	data: { values: Database.data },
			  	width: 200,
			  	mark: { type: 'bar', tooltip: true },
			  	encoding: {
					x: { field: '*', type: 'quantitative', aggregate: 'count' },
			  	  	y: { field: categoricalAttr, type: categoricalAttrType, sort: '-x', axis: { labelLimit: 50 } }
			  	}
			}
		if (insight.type == 'mean')
			return {
			  	$schema: "https://vega.github.io/schema/vega-lite/v4.json",
			  	data: { values: Database.data },
			  	width: 200,
			  	mark: { type: 'bar', tooltip: true },
			  	encoding: {
			  	  	x: { field: quantitativeAttr, type: 'quantitative', aggregate: 'mean' },
			  	  	y: { field: categoricalAttr, type: categoricalAttrType, sort: '-x', axis: { labelLimit: 50 } }
			  	}
			}
	}
}