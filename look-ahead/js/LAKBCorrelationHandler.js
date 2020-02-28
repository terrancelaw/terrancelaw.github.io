const LAKBCorrelationHandler = {
	generateVisSpecMetadata: function(visSpec) {
		const self = LAKBCorrelationHandler;
		let xAttribute = visSpec.x.attributeName;
		let yAttribute = visSpec.y.attributeName;
		let requiredInfo = {};
		let visSpecMetadata = null;

		requiredInfo.xAttribute = xAttribute;
		requiredInfo.yAttribute = yAttribute;
		visSpecMetadata = self.computeQualityScoreAndThreshold(requiredInfo);
		visSpecMetadata.shortDescriptionHTML = self.generateShortDescriptionHTML(requiredInfo);
		visSpecMetadata.renderThumbnail = self.renderThumbnail;

		return visSpecMetadata;
	},
	renderThumbnail: function(svgEl, thumbnailData) {
		const self = LAKBCorrelationHandler;
		let xAttribute = {
			name: thumbnailData.xAttribute,
			min: Database.rangeAndDecimalForEachQuantAttr[thumbnailData.xAttribute].range[0],
			max: Database.rangeAndDecimalForEachQuantAttr[thumbnailData.xAttribute].range[1]
		};
		let yAttribute = {
			name: thumbnailData.yAttribute,
			min: Database.rangeAndDecimalForEachQuantAttr[thumbnailData.yAttribute].range[0],
			max: Database.rangeAndDecimalForEachQuantAttr[thumbnailData.yAttribute].range[1]
		};

		let numberOfSamples = 20;
		let sampledPoints = self.samplePoints(numberOfSamples, xAttribute.name, yAttribute.name); // { x, y }
		let chartHeight = 50, chartWidth = 60;

		let xScale = d3.scaleLinear()
            .domain([ xAttribute.min, xAttribute.max ])
            .range([ 0, chartWidth ]);
        let yScale = d3.scaleLinear()
            .domain([ yAttribute.min, yAttribute.max ])
            .range([ chartHeight, 0 ]);

		d3.select(svgEl)
        	.style('width', chartWidth)
        	.style('height', chartHeight);
        d3.select(svgEl)
        	.selectAll('circle')
        	.data(sampledPoints)
        	.enter()
        	.append('circle')
        	.attr('cx', function(d) { return xScale(d.x); })
        	.attr('cy', function(d) { return yScale(d.y); })
        	.attr('r', 5)
        	.style('stroke', 'white')
        	.style('opacity', 0.5)
        	.style('fill', 'steelblue');
	},

	// generateVisSpecMetadata

	computeQualityScoreAndThreshold: function(requiredInfo) {
		const self = LAKBCorrelationHandler;
		let filteredData = LookAheadDatabase.filteredData;
		let xAttribute = requiredInfo.xAttribute;
		let yAttribute = requiredInfo.yAttribute;

		if (xAttribute == yAttribute)
			return {
				thumbnailData: {
					xAttribute: xAttribute,
					yAttribute: yAttribute
				},
				qualityScore: 0,
				threshold: 1
			};

		if (xAttribute != yAttribute) {
			let valueList = self.generateTwoValueList(filteredData, xAttribute, yAttribute);
			let correlation = pearsonCorrelation(valueList.x, valueList.y);
			let qualityScore = Math.abs(correlation);
			let threshold = 0.5;

			// store data
			requiredInfo.correlation = correlation;

			return {
				thumbnailData: {
					xAttribute: xAttribute,
					yAttribute: yAttribute
				},
				qualityScore: qualityScore,
				threshold: threshold
			};
		}
	},
	generateShortDescriptionHTML: function(requiredInfo) {
		const self = this;
		let xAttribute = requiredInfo.xAttribute;
		let yAttribute = requiredInfo.yAttribute;
		let correlation = requiredInfo.correlation;
		let shortDescriptionHTML = '<span style="font-family:Arial;color:#707070">' + xAttribute + '</span> and ' + 
								   '<span style="font-family:Arial;color:#707070">' + yAttribute + '</span> seems to be ';

		if (correlation > 0) shortDescriptionHTML += 'highly positively correlated.';
		if (correlation < 0) shortDescriptionHTML += 'highly negatively correlated.';

		return shortDescriptionHTML;
	},

	// renderThumbnail

	samplePoints: function(numberOfSamples, xAttribute, yAttribute) {
		let numberOfRows = Database.data.length;
		let randomIndexList = [];
		let points = [];

		for (let i = 0; i < numberOfSamples; i++) {
			let randomIndex = Math.floor(Math.random() * numberOfRows);
			randomIndexList.push(randomIndex);
		}

		for (let i = 0; i < randomIndexList.length; i++) {
			let randomIndex = randomIndexList[i];
			let randomRow = Database.data[randomIndex];
			let randomXValue = randomRow[xAttribute];
			let randomYValue = randomRow[yAttribute];
			let isXValueMissing = (randomXValue === null);
			let isYValueMissing = (randomYValue === null);

			if (!isXValueMissing && !isYValueMissing)
				points.push({ x: +randomXValue, y: +randomYValue });
		}

		return points;
	},

	// helpers

	generateTwoValueList: function(filteredData, xAttribute, yAttribute) {
		let attributeValueList = { x: [], y: [] };

		for (let i = 0; i < filteredData.length; i++) {
			let currentRow = filteredData[i];
			let isXValueMissing = (currentRow[xAttribute] === null);
			let isYValueMissing = (currentRow[yAttribute] === null);

			if (!isXValueMissing && !isYValueMissing) {
				attributeValueList.x.push(+currentRow[xAttribute]);
				attributeValueList.y.push(+currentRow[yAttribute])
			}
		}

		return attributeValueList;
	}
}