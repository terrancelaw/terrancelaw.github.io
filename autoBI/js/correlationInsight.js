const CorrelationInsight = {
	insightList: null,
	visList: null,
	threshold: 0.5,

	search: function() {
		const self = this;
		let insightList = [];
		let quantitativeAttrList = Database.getAttributeList('quantitative');

		for (let i = 0; i < quantitativeAttrList.length; i++)
			for (let j = 0; j < quantitativeAttrList.length; j++) {
				let currentAttribute = quantitativeAttrList[i];
				let otherAttribute = quantitativeAttrList[j];

				if (currentAttribute !== otherAttribute) {
					let dataColumns = self.getDataColumns(currentAttribute, otherAttribute);
					let correlation = pearsonCorrelation(dataColumns.attribute1, dataColumns.attribute2);

					if (Math.abs(correlation) > self.threshold)
						insightList.push({
							type: 'correlation',
							quantitativeAttrList: [ currentAttribute, otherAttribute ],
							temporalAttrList: [],
							ordinalAttrList: [],
							nominalAttrList: [],
							data: { 
								correlation: correlation 
							}
						});
				}
			}

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
				score: Math.abs(currentInsight.data.correlation)
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

	getDataColumns: function(attribute1, attribute2) {
		let data = Database.data;
		let dataColumn1 = [];
		let dataColumn2 = [];

		for (let i = 0; i < data.length; i++) {
			let currentRow = data[i];
			let attribute1Value = currentRow[attribute1];
			let attribute2Value = currentRow[attribute2];
			let attribute1ValueIsMissing = (attribute1Value === null);
			let attribute2ValueIsMissing = (attribute2Value === null);

			if (!attribute1ValueIsMissing && !attribute2ValueIsMissing) {
				dataColumn1.push(+attribute1Value);
				dataColumn2.push(+attribute2Value);
			}
		}

		return {
			attribute1: dataColumn1,
			attribute2: dataColumn2
		};
	},

	// generateVis

	generateDescription: function(insight) {
		let attribute1 = insight.quantitativeAttrList[0];
		let attribute2 = insight.quantitativeAttrList[1];
		let positiveCorrelation = insight.data.correlation > 0;
		let negativeCorrelation = insight.data.correlation < 0;

		if (positiveCorrelation)
			return '<span class="attribute-name">' + attribute1 + '</span>' + ' and ' + 
				   '<span class="attribute-name">' + attribute2 + '</span>' + 
				   ' seem to be highly positively correlated.';
		
		if (negativeCorrelation) 
			return '<span class="attribute-name">' + attribute1 + '</span>' + ' and ' + 
				   '<span class="attribute-name">' + attribute2 + '</span>' + 
				   ' seem to be highly negatively correlated.';
	},
	generateVLSpec: function(insight) {
		let VLSpec = {
		  	$schema: "https://vega.github.io/schema/vega-lite/v4.json",
		  	data: { values: Database.data },
		  	width: 200,
		  	height: 200,
		  	mark: { type: 'circle', tooltip: true },
		  	encoding: {
		  	  x: { field: insight.quantitativeAttrList[0], type: "quantitative" },
		  	  y: { field: insight.quantitativeAttrList[1], type: "quantitative" }
		  	}
		}

		return VLSpec;
	}
}