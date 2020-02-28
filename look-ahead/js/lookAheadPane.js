const LookAheadPane = {
	minHeight: 100,

	init: function() {
		const self = this;

		self.installClickDetailButtonBehaviour();
		self.allowResizing();
	},
	clear: function() {
		$('#look-ahead-pane .content')
			.html('');
	},
	showLoader: function() {
		$('#look-ahead-pane .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#look-ahead-pane .loader')
			.css('display', '');
	},
	scrollToTop: function() {
		$('#look-ahead-pane .content')
			.scrollTop(0);
	},
	show: function() {
		const self = this;
		let needQueryExpansion = LookAheadEventHandler.needQueryExpansion;
		let filteredVisSpecList = LookAheadEventHandler.filteredVisSpecList;
		let isNothingToShow = (filteredVisSpecList.length == 0);

		if (isNothingToShow)
			self.showNothing();
		if (!isNothingToShow && needQueryExpansion)
			self.appendQueryExpansionMessage();
		for (let i = 0; i < filteredVisSpecList.length; i++)
			self.showOneRecommendation(filteredVisSpecList[i]);

		self.scrollToTop();
	},
	selectPrevious: function() {
		let selectedRecEl = $('#look-ahead-pane .content .recommendation.selected')[0];
		let previousRecEl = $('#look-ahead-pane .content .recommendation.selected').prevAll('.recommendation:not(.visualized)')[0];
		let firstRecEl = $('#look-ahead-pane .content .recommendation:not(.visualized)').first()[0];
		let lastRecEl = $('#look-ahead-pane .content .recommendation:not(.visualized)').last()[0];

		let hasSelectedRec = $(selectedRecEl).length !== 0;
		let hasPreviousRec = hasSelectedRec && $(previousRecEl).length !== 0;
		let hasRec = $(firstRecEl).length !== 0;
		let containerScrolltop = null, recTop = null, offset = null;

		// highlight
		if (!hasRec) return;
		else if (hasPreviousRec) $(previousRecEl).click();
		else if (!hasPreviousRec) $(lastRecEl).click();
		else if (hasRec && !hasSelectedRec) $(firstRecEl).click();

		// scroll
		containerScrolltop = $('#look-ahead-pane .content').scrollTop();
		recTop = $('#look-ahead-pane .content .recommendation.selected').position().top;
		offset = containerScrolltop + recTop - 20;
		$('#look-ahead-pane .content').scrollTop(offset);
	},
	selectNext: function() {
		let selectedRecEl = $('#look-ahead-pane .content .recommendation.selected')[0];
		let nextRecEl = $('#look-ahead-pane .content .recommendation.selected').nextAll('.recommendation:not(.visualized)')[0];
		let firstRecEl = $('#look-ahead-pane .content .recommendation:not(.visualized)').first()[0];

		let hasRec = $(firstRecEl).length !== 0;
		let hasSelectedRec = $(selectedRecEl).length !== 0;
		let hasNextRec = hasSelectedRec && $(nextRecEl).length !== 0;
		let containerScrolltop = null, recTop = null, offset = null;

		// highlight
		if (!hasRec) return;
		else if (hasNextRec) $(nextRecEl).click();
		else if (!hasNextRec) $(firstRecEl).click();
		else if (!hasSelectedRec) $(firstRecEl).click();

		// scroll
		containerScrolltop = $('#look-ahead-pane .content').scrollTop();
		recTop = $('#look-ahead-pane .content .recommendation.selected').position().top;
		offset = containerScrolltop + recTop - 20;
		$('#look-ahead-pane .content').scrollTop(offset);
	},
	highlight: function(selectedRecommendationEl) {
		$('#look-ahead-pane .content .recommendation')
			.removeClass('selected');
		$(selectedRecommendationEl)
			.addClass('selected');
	},
	removeHighlight: function() {
		$('#look-ahead-pane .content .recommendation')
			.removeClass('selected');
	},

	// init

	installClickDetailButtonBehaviour: function() {
		$('#look-ahead-pane .footer .detail.button')
			.on('click', clickDetailButton);

		function clickDetailButton() {
			let isDetailButtonSelected = $(this).hasClass('selected');
			let instructionClass = '#look-ahead-pane .content .recommendation .instructions';

			if (isDetailButtonSelected) {
				$(this).removeClass('selected');
				$(instructionClass).css('display', '');
			}

			if (!isDetailButtonSelected) {
				$(this).addClass('selected');
				$(instructionClass).css('display', 'none').fadeTo(400, 1);
			}
		}
	},
	allowResizing: function() {
		$('#look-ahead-pane')
			.resizable({
				handles: 's',
				create: createResizeHandle,
				resize: resizing
			});

		function createResizeHandle(event, ui) {
			$('.ui-resizable-s').css('cursor','ns-resize');
		}

		function resizing(event, ui) {
			let currentLookAheadPaneHeight = $('#look-ahead-pane').height();
			let newShelfPaneHeight = 'calc(100% - ' + (currentLookAheadPaneHeight + 10) + 'px)';
			$('#shelf-pane').css('height', newShelfPaneHeight);
		}
	},

	// show

	showNothing: function() {
		$('#look-ahead-pane .content')
			.append('<div class="nothing-text">Nothing to show</div>');
	},
	appendQueryExpansionMessage: function() {
		$('#look-ahead-pane .content')
			.append('<div class="query-expansion-text">We failed to find good recommendations that match all the chosen attributes.</div>' + 
				    '<div class="query-expansion-text">You may find these related visualizations interesting though:</div>');
	},
	showOneRecommendation: function(visSpec) {
		const self = this;
		let shortDescriptionHTML = visSpec.metadata.shortDescriptionHTML;
		let thumbnailData = visSpec.metadata.thumbnailData;
		let renderThumbnail = visSpec.metadata.renderThumbnail;
		let removedSpecification = visSpec.metadata.removedSpecification;

		self.createRecommendation();
		self.showThumbnail(thumbnailData, renderThumbnail);
		self.showTextDescription(shortDescriptionHTML);
		self.showEncodingInstructions(visSpec.specification);
		self.showFilteringInstructions(visSpec.specification);
		self.showShowMeInstructions(visSpec.specification);
		self.showRemovedShowMeSpecification(removedSpecification);
		self.showRemovedEncodingSpecification(removedSpecification);
		self.installClickConfirmButtonBehaviour();
		self.fadeInRecommendation();
		self.storeVisSpec(visSpec.specification);
	},
	createRecommendation: function() {
		let isDetailButtonSelected = $('#look-ahead-pane .footer .detail.button').hasClass('selected');
		let instructionDisplayType = isDetailButtonSelected ? 'block' : 'none';
		let recommendationHTML = '<div class="recommendation" style="display:none">' +
									'<div class="description">' + 
										'<span class="thumbnail"><svg></svg></span>' +
										'<span class="text"></span>' +
										'<span class="confirm button">' +
											'<span class="fa fa-check-circle"></span>' +
											'<span class="button-text">Click to Confirm</span>' +
										'</span>' +
									'</div>' +
									'<div class="instructions" style="display:' + instructionDisplayType + '">' +
										'<div class="instruction-title">How To:</div>' + 
									'</div>' +
								 '</div>'

		$('#look-ahead-pane .content')
			.append(recommendationHTML);
	},
	showThumbnail: function(thumbnailData, renderThumbnail) {
		let lastRecommendationEl = $('#look-ahead-pane .content .recommendation').last()[0];
		let svgEl = d3.select(lastRecommendationEl).select('svg').node();

		renderThumbnail(svgEl, thumbnailData);
	},
	showTextDescription: function(shortDescriptionHTML) {
		$('#look-ahead-pane .content .recommendation').last().find('.description .text')
			.html(shortDescriptionHTML);
	},
	showRemovedShowMeSpecification: function(removedSpecification) {
		if (!('showMe' in removedSpecification))
			return;

		const self = this;
		let showMeType = removedSpecification.showMe.type;
		let showMeIcon = self.getShowMeIcon(showMeType);
		let showMeButtonText = self.getShowMeButtonText(showMeType);
		let removedShowMeHTML = '<div class="showme removed">' +
									'<span class="title">Show Me:</span>' +
									'<span class="button">' +
										'<span class="fa fa-times"></span>' +
										'<span class="fa ' + showMeIcon + '"></span>' +
										'<span class="button-text">' + showMeButtonText + '</span>' +
									'</span>' +
						 		'</div>';

		$('#look-ahead-pane .content .recommendation').last().find('.instructions')
			.append(removedShowMeHTML);
	},
	showRemovedEncodingSpecification: function(removedSpecification) {
		const self = this;
		let removedEncodingHTML = '';

		for (let currentEncodingName in removedSpecification) {
			let isCurrentEncodingShowMe = (currentEncodingName == 'showMe');
			let currentAttribute = removedSpecification[currentEncodingName];
			let attributeName = currentAttribute.attributeName;
			let attributeType = currentAttribute.type;

			let encodingIconClass = self.getEncodingIconClass(currentEncodingName);
			let shelfName = self.getShelfName(currentEncodingName);
			let attributeTypeIconClass = self.getAttributeTypeIconClass(attributeType);
			let aggregateOrTimeUnit = '';
			let attributeNameWidth = 110;

			if (isCurrentEncodingShowMe)
				continue;
			if (currentAttribute.aggregate != 'none')
				aggregateOrTimeUnit = currentAttribute.aggregate;
			if (currentAttribute.timeUnit != 'none')
				aggregateOrTimeUnit = currentAttribute.timeUnit;
			if (aggregateOrTimeUnit !== '') {
				attributeName = '<span class="parenthesis">(</span>' + attributeName + '<span class="parenthesis">)</span>';
				attributeNameWidth = 80;
			}

			removedEncodingHTML += '<div class="encoding removed">' +
										'<span class="fa ' + encodingIconClass + '"></span>' +
										'<span class="shelf-name">' + shelfName + '</span>' + 
										'<span class="capsule">' +
											'<span class="fa fa-times"></span>' +
											'<span class="fa attribute-type ' + attributeTypeIconClass + '"></span>' +
											'<span class="aggregate-or-time-unit">' + aggregateOrTimeUnit + '</span>' +
											'<span class="attribute-name" style="width:' + attributeNameWidth + 'px">' + attributeName + '</span>' +
										'</span>' +
									'</div>';

		}

		$('#look-ahead-pane .content .recommendation').last().find('.instructions')
			.append(removedEncodingHTML);
	},
	showShowMeInstructions: function(visSpec) {
		if (!('showMe' in visSpec))
			return;

		const self = this;
		let isShowMeChanged = visSpec.showMe.added;

		if (isShowMeChanged) {
			let showMeType = visSpec.showMe.type;
			let showMeIcon = self.getShowMeIcon(showMeType);
			let showMeButtonText = self.getShowMeButtonText(showMeType);
			let showMeHTML = '<div class="showme">' +
								'<span class="title">Show Me:</span>' +
								'<span class="button">' +
									'<span class="fa ' + showMeIcon + '"></span>' +
									'<span class="button-text">' + showMeButtonText + '</span>' +
								'</span>' +
							 '</div>';

			$('#look-ahead-pane .content .recommendation').last().find('.instructions')
				.append(showMeHTML);
		}
	},
	showEncodingInstructions: function(visSpec) {
		const self = this;
		let encodingHTML = '';

		for (let currentEncodingName in visSpec) {
			let isCurrentEncodingAddedOrReplaced = visSpec[currentEncodingName].added;
			let isCurrentEncodingFilterOrShowMe = (currentEncodingName == 'filter' || currentEncodingName == 'showMe');

			if (!isCurrentEncodingFilterOrShowMe && isCurrentEncodingAddedOrReplaced) {
				let attributeName = visSpec[currentEncodingName].attributeName;
				let attributeType = visSpec[currentEncodingName].type;
				let encodingIconClass = self.getEncodingIconClass(currentEncodingName);
				let shelfName = self.getShelfName(currentEncodingName);
				let attributeTypeIconClass = self.getAttributeTypeIconClass(attributeType);
				let aggregateOrTimeUnit = '';
				let attributeNameWidth = 110;
				
				if ('aggregate' in visSpec[currentEncodingName])
					aggregateOrTimeUnit = visSpec[currentEncodingName].aggregate;
				if ('timeUnit' in visSpec[currentEncodingName])
					aggregateOrTimeUnit = visSpec[currentEncodingName].timeUnit;
				if (aggregateOrTimeUnit !== '') {
					attributeName = '<span class="parenthesis">(</span>' + attributeName + '<span class="parenthesis">)</span>';
					attributeNameWidth = 80;
				}

				encodingHTML += '<div class="encoding">' +
									'<span class="fa ' + encodingIconClass + '"></span>' +
									'<span class="shelf-name">' + shelfName + '</span>' + 
									'<span class="capsule">' +
										'<span class="fa attribute-type ' + attributeTypeIconClass + '"></span>' +
										'<span class="aggregate-or-time-unit">' + aggregateOrTimeUnit + '</span>' +
										'<span class="attribute-name" style="width:' + attributeNameWidth + 'px">' + attributeName + '</span>' +
									'</span>' +
								'</div>';

			}
		}

		$('#look-ahead-pane .content .recommendation').last().find('.instructions')
			.append(encodingHTML);
	},
	showFilteringInstructions: function(visSpec) {
		if (!('filter' in visSpec))
			return;

		const self = this;
		let changedFilter = self.getChangedFilter(visSpec.filter);
		
		if (changedFilter !== null) {
			let attributeName = changedFilter.attributeName;
			let attributeType = changedFilter.type;
			let selectedAttributeValues = changedFilter.attributeValues;
			let attributeTypeIconClass = self.getAttributeTypeIconClass(attributeType);
			let listHTML = '';
			let capsuleHTML = '';
			let filterShelfHTML = '';

			for (let i = 0; i < selectedAttributeValues.length; i++)
				listHTML += '<div class="category">' + 
								'<label class="custom-checkbox">' +
									selectedAttributeValues[i] +
									'<input type="checkbox" value="' + selectedAttributeValues[i] + '" checked disabled>' +
			 			 			'<span class="checkmark"></span>' +
			 			 		'</label>' +
							'</div>';

			capsuleHTML = '<div class="capsule">' +
							'<div class="filter-header">' +
								'<span class="attribute-type"><span class="fa ' + attributeTypeIconClass + '"></span></span>' +
								'<span class="attribute-name">' + attributeName + '</span>' +
							'</div>' +
							'<div class="list filter-content">' + listHTML + '</div>' +
						  '</div>';

			filterShelfHTML += '<div class="filter">' +
									'<span class="fa fa-filter"></span>' +
									'<span class="shelf-name">Filter</span>' + 
									capsuleHTML
								'</div>';

			$('#look-ahead-pane .content .recommendation').last().find('.instructions')
				.append(filterShelfHTML);
		}
	},
	installClickConfirmButtonBehaviour: function() {
		$('#look-ahead-pane .content .recommendation').last().find('.description .confirm.button')
			.on('click', clickConfirmButton);

		function clickConfirmButton() {
			PreviewMode.confirm();
		}
	},
	fadeInRecommendation: function() {
		$('#look-ahead-pane .content .recommendation').last()
			.fadeTo(200, 1);
	},
	storeVisSpec(visSpec) {
		let lastRecommendationEl = $('#look-ahead-pane .content .recommendation').last()[0];

		d3.select(lastRecommendationEl)
			.datum(visSpec);
	},

	// helpers

	getEncodingIconClass: function(encodingName) {
		if (encodingName == 'x') return 'fa-chart-bar';
		if (encodingName == 'y') return 'fa-chart-bar';
		if (encodingName == 'row') return 'fa-list';
		if (encodingName == 'column') return 'fa-rotate-90';
		if (encodingName == 'size') return 'fa-arrows-alt';
		if (encodingName == 'color') return 'fa-fill-drip';
		if (encodingName == 'shape') return 'fa-shapes';
		if (encodingName == 'tooltip') return 'fa-comment-alt';
	},
	getShelfName: function(encodingName) {
		if (encodingName == 'x') return 'X-axis';
		if (encodingName == 'y') return 'Y-axis';
		if (encodingName == 'row') return 'Row';
		if (encodingName == 'column') return 'Column';
		if (encodingName == 'size') return 'Size';
		if (encodingName == 'color') return 'Color';
		if (encodingName == 'shape') return 'Shape';
		if (encodingName == 'tooltip') return 'Tooltip';
	},
	getAttributeTypeIconClass: function(attributeType) {
		if (attributeType == 'temporal') return 'fa-calendar';
		if (attributeType == 'quantitative') return 'fa-hashtag';
		if (attributeType == 'nominal' || attributeType == 'ordinal') return 'fa-font';
	},
	getShowMeIcon: function(showMeType) {
		if (showMeType == 'density') return 'fa-chart-area';
		if (showMeType == 'trend') return 'fa-chart-line';
	},
	getShowMeButtonText: function(showMeType) {
		if (showMeType == 'density') return 'Density Plot';
		if (showMeType == 'trend') return 'Trend Lines';
	},
	getChangedFilter: function(filterList) {
		for (let i = 0; i < filterList.length; i++)
			if (filterList[i].added)
				return filterList[i];

		return null;
	}
}