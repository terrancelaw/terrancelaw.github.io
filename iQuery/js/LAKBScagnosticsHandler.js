const LAKBScagnosticsHandler = {
	binType: "hexagon",
	startBinGridSize: 10,
	scagnosticScores: null,

	init: function() {
		const self = LAKBScagnosticsHandler;

		self.scagnosticScores = {};
	},
	generateVisSpecMetadata: function(visSpec, scagnosticType) {
		const self = LAKBScagnosticsHandler;
		let xAttribute = visSpec.x.attributeName;
		let yAttribute = visSpec.y.attributeName;
		let requiredInfo = {};
		let visSpecMetadata = null;

		requiredInfo.xAttribute = xAttribute;
		requiredInfo.yAttribute = yAttribute;
		requiredInfo.scagnosticType = scagnosticType;
		visSpecMetadata = self.computeQualityScoreAndThreshold(requiredInfo);
		visSpecMetadata.shortDescriptionHTML = self.generateShortDescriptionHTML(requiredInfo);
		visSpecMetadata.renderThumbnail = self.renderThumbnail;

		return visSpecMetadata;
	},
	renderThumbnail: function(svgEl, thumbnailData) {
		const self = LAKBScagnosticsHandler;
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
		const self = LAKBScagnosticsHandler;
		let xAttribute = requiredInfo.xAttribute;
		let yAttribute = requiredInfo.yAttribute;
		let scagnosticType = requiredInfo.scagnosticType;

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
			let scagnosticScores = self.tryComputeScagnostics(xAttribute, yAttribute);
			let qualityScore = scagnosticScores[scagnosticType + 'Score'];
			let threshold = self.getThreshold(scagnosticType);

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
		let scagnosticType = requiredInfo.scagnosticType;
		let shortDescriptionHTML = 'Plot of <span style="font-family:Arial;color:#707070">' + xAttribute + '</span> and ' + 
								   '<span style="font-family:Arial;color:#707070">' + yAttribute + '</span> looks ' + 
								   '<span style="font-family:Arial;color:#707070">' + scagnosticType + '</span>';

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

	// optimizer

	tryComputeScagnostics: function(xAttribute, yAttribute) {
		// preparation
		const self = LAKBScagnosticsHandler;
		let alreadyComputed = (xAttribute in self.scagnosticScores) && (yAttribute in self.scagnosticScores[xAttribute]);
		if (alreadyComputed) return self.scagnosticScores[xAttribute][yAttribute];

		// really compute
		let filteredData = LookAheadDatabase.filteredData;
		let points = self.generatePoints(filteredData, xAttribute, yAttribute);
		let scag = null, scagnosticScores = null;

		if (points.length === 0)
			scagnosticScores = {
				outlyingScore: 0, skewedScore: 0, sparseScore: 0,
				clumpyScore: 0, striatedScore: 0, convexScore: 0,
				skinnyScore: 0, stringyScore: 0, monotonicScore: 0
			};

		if (points.length !== 0) {
			scag = scagnostics(points, self.binType, self.startBinGridSize);
			scagnosticScores = {
				outlyingScore: scag.outlyingScore, skewedScore: scag.skewedScore, sparseScore: scag.sparseScore,
				clumpyScore: scag.clumpyScore, striatedScore: scag.striatedScore, convexScore: scag.convexScore,
				skinnyScore: scag.skinnyScore, stringyScore: scag.stringyScore, monotonicScore: scag.monotonicScore
			};
		}
		
		// store
		if (!(xAttribute in self.scagnosticScores)) self.scagnosticScores[xAttribute] = {};
		if (!(yAttribute in self.scagnosticScores)) self.scagnosticScores[yAttribute] = {};
		self.scagnosticScores[xAttribute][yAttribute] = scagnosticScores;
		self.scagnosticScores[yAttribute][xAttribute] = scagnosticScores;
		return scagnosticScores;
	},
	generatePoints: function(filteredData, xAttribute, yAttribute) {
		let points = [];

		for (let i = 0; i < filteredData.length; i++) {
			let currentRow = filteredData[i];
			let xValue = (currentRow[xAttribute] !== null) ? +currentRow[xAttribute] : null;
			let yValue = (currentRow[yAttribute] !== null) ? +currentRow[yAttribute] : null;
			points.push([ xValue, yValue ])
		}

		return points;
	},

	// helpers

	getThreshold: function(scagnosticType) {
		if (scagnosticType == 'outlying') return 0.7;
		if (scagnosticType == 'skewed') return 0.85;
		if (scagnosticType == 'sparse') return 0.7;
		if (scagnosticType == 'clumpy') return 0.8;
		if (scagnosticType == 'striated') return 0.7;
		if (scagnosticType == 'convex') return 0.7;
		if (scagnosticType == 'skinny') return 0.7;
		if (scagnosticType == 'stringy') return 0.8;
		if (scagnosticType == 'monotonic') return 0.7;
	}
}