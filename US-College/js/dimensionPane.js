let DimensionPane = {
	selectedAttribute: null,
	notSelectedCategories: [], // for keeping selection
	selectedCategories: [],

	init: function() {
		const self = this;

		self.installClickSelectAllButtonBehaviour();
		self.installClickSelectNoneButtonBehaviour();
	},
	populate: function(keepSelection = false) {
		const self = this;
		
		self.populateAttributes(keepSelection);
		self.populateCategoryList(keepSelection);
	},
	initEvents: function() {
		const self = this;

		self.initHoverAttriuteBehaviour();
		self.initClickAttributeBehaviour();
		self.initHoverCategoryBehaviour();
		self.initClickCategoryBehaviour();
	},
	showLoader: function() {
		$('#dimension-pane .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#dimension-pane .loader')
			.css('display', '');
	},
	updateSelectedAttribute: function() {
		const self = this;
		self.selectedAttribute = $('#dimension-pane .attributes.content .attribute.selected').text();
	},
	updateSelectedCategoryList: function() {
		const self = this;
		let selectedCategories = [];
		let notSelectedCategories = [];

		$('#dimension-pane .categories.content .category').each(function() {
			let category = $(this).text();
			let categoryIsSelected = $(this).hasClass('selected');

			if (categoryIsSelected)
				selectedCategories.push(category);
			if (!categoryIsSelected)
				notSelectedCategories.push(category);
		});

		self.selectedCategories = selectedCategories;
		self.notSelectedCategories = notSelectedCategories;
	},

	// init

	installClickSelectAllButtonBehaviour: function() {
		const self = this;

		$('#dimension-pane .footer .select-none.button')
			.on('click', onClickSelectNoneButton);

		function onClickSelectNoneButton() {
			$('#dimension-pane .categories.content .category')
				.removeClass('selected');

			VisPane.showLoader();
			DimensionHightlightPane.showLoader();
			MeasureHighlightPane.showLoader();
			self.updateSelectedCategoryList();

			setTimeout(function() {
				MeanOperator.compute();
				VisPane.update();
				DimensionHightlightPane.update();
				MeasureHighlightPane.update();

				VisPane.hideLoader();
				DimensionHightlightPane.hideLoader();
				MeasureHighlightPane.hideLoader();
			}, 50);
		}
	},
	installClickSelectNoneButtonBehaviour: function() {
		const self = this;

		$('#dimension-pane .footer .select-all.button')
			.on('click', onClickSelectAllButton);

		function onClickSelectAllButton() {
			$('#dimension-pane .categories.content .category')
				.addClass('selected');

			VisPane.showLoader();
			DimensionHightlightPane.showLoader();
			MeasureHighlightPane.showLoader();
			self.updateSelectedCategoryList();

			setTimeout(function() {
				MeanOperator.compute();
				VisPane.update();
				DimensionHightlightPane.update();
				MeasureHighlightPane.update();

				VisPane.hideLoader();
				DimensionHightlightPane.hideLoader();
				MeasureHighlightPane.hideLoader();
			}, 50);
		}
	},

	// populate

	populateAttributes: function(keepSelection) {
		const self = this;
		let dimensionPaneAttributesContentHTML = '';
		let selectedAttribute = keepSelection ? self.selectedAttribute : null;

		for (let attributeName in Database.allAttributeMetadata) {
			let attributeIsCategorical = (Database.allAttributeMetadata[attributeName].type == 'categorical');
			let attributeIsExcluded = (Database.checkIfAttributeIsExcluded(attributeName) || attributeName == 'Period');
			let attributeNameSpanHTML = '<span>' + attributeName + '</span>';
			let currentAttributeHTML = '<div class="attribute">' + attributeNameSpanHTML + '</div>';

			if (attributeIsExcluded || !attributeIsCategorical)
				continue;
			if (selectedAttribute === null)
				selectedAttribute = attributeName;
			if (selectedAttribute == attributeName)
				currentAttributeHTML = '<div class="attribute selected">' + attributeNameSpanHTML + '</div>';

			dimensionPaneAttributesContentHTML += currentAttributeHTML;
		}

		// save
		$('#dimension-pane .attributes.content').html(dimensionPaneAttributesContentHTML);
		if (!keepSelection) self.selectedAttribute = selectedAttribute;
		self.adjustCategoriesContentHeight();
	},
	populateCategoryList: function(keepSelection) {
		const self = this;
		let selectedAttribute = self.selectedAttribute;
		let selectedCategories = [];
		let notSelectedCategories = keepSelection ? self.notSelectedCategories : [];
		let dimensionPaneCategoriesContentHTML = '';
		let selectedAttributeUniqueValues = FilterHandler.getUniqueValues(selectedAttribute);

		for (let i = 0; i < selectedAttributeUniqueValues.length; i++) {
			let currentCategory = selectedAttributeUniqueValues[i];
			let currentCategoryInUnselectedList = notSelectedCategories.indexOf(currentCategory) != -1;
			let currentCategoryHTML = '<div class="category">' + 
										'<span>' + currentCategory + '</span>' + 
									  '</div>';

			if ((keepSelection && !currentCategoryInUnselectedList) || !keepSelection) {
				selectedCategories.push(currentCategory);
				currentCategoryHTML = '<div class="category selected">' + 
										'<span>' + currentCategory + '</span>' + 
									  '</div>';
			}
			
			dimensionPaneCategoriesContentHTML += currentCategoryHTML;
		}

		// save
		$('#dimension-pane .categories.content').html(dimensionPaneCategoriesContentHTML);
		self.selectedCategories = selectedCategories;
		if (!keepSelection) self.notSelectedCategories = [];
	},
	adjustCategoriesContentHeight: function() {
		let dimensionPaneAttributesContentHeight = $('#dimension-pane .attributes.content').height() + 18; // 18 is margin
		let otherDivHeight = dimensionPaneAttributesContentHeight + dimensionPaneHeaderHeight + dimensionPaneFooterHeight;
		let dimensionPaneCategoriesContentHeight = 'calc(100% - ' + otherDivHeight + 'px)';

		$('#dimension-pane .categories.content')
			.height(dimensionPaneCategoriesContentHeight);
	},

	// initEvents

	initHoverAttriuteBehaviour: function() {
		$('#dimension-pane .content .attribute span')
			.on('mouseenter', onMouseenterAttribute)
			.on('mouseleave', onMouseleaveAttribute);

		function onMouseenterAttribute() {
			let isAttributeNameOverflow = Helpers.isXOverflow(this);
			let tooltipText = $(this).html();

			if (isAttributeNameOverflow)
				Tooltip.show(this, 26, -9, tooltipText);
		}

		function onMouseleaveAttribute() {
			Tooltip.remove();
		}
	},
	initClickAttributeBehaviour: function() {
		const self = this;

		$('#dimension-pane .attributes.content .attribute')
			.on('click', onClickAttribute);

		function onClickAttribute() {
			let attributeName = $(this).text();
			let currentAttributeIsSelected = $(this).hasClass('selected');

			if (!currentAttributeIsSelected) {
				$('#dimension-pane .attributes.content .attribute').removeClass('selected');
				$(this).addClass('selected');

				VisPane.showLoader();
				DimensionHightlightPane.showLoader();
				MeasureHighlightPane.showLoader();
				self.updateSelectedAttribute();
				self.populateCategoryList();
				self.initHoverCategoryBehaviour();
				self.initClickCategoryBehaviour();

				setTimeout(function() {
					MeanOperator.compute();
					VisPane.update();
					DimensionHightlightPane.update();
					MeasureHighlightPane.update();

					VisPane.hideLoader();
					DimensionHightlightPane.hideLoader();
					MeasureHighlightPane.hideLoader();
				}, 50);
			}
		}
	},
	initHoverCategoryBehaviour: function() {
		$('#dimension-pane .content .category span')
			.on('mouseenter', onMouseenterCategory)
			.on('mouseleave', onMouseleaveCategory);

		function onMouseenterCategory() {
			let isCategoryOverflow = Helpers.isXOverflow(this);
			let tooltipText = $(this).html();

			if (isCategoryOverflow)
				Tooltip.show(this, 26, -9, tooltipText);
		}

		function onMouseleaveCategory() {
			Tooltip.remove();
		}
	},
	initClickCategoryBehaviour: function() {
		const self = this;

		$('#dimension-pane .categories.content .category')
			.on('click', onClickCategory);

		function onClickCategory() {
			let category = $(this).text();
			let currentCategoryIsSelected = $(this).hasClass('selected');

			if (currentCategoryIsSelected)
				$(this).removeClass('selected');
			if (!currentCategoryIsSelected)
				$(this).addClass('selected');

			VisPane.showLoader();
			DimensionHightlightPane.showLoader();
			MeasureHighlightPane.showLoader();
			self.updateSelectedCategoryList();

			setTimeout(function() {
				MeanOperator.compute();
				VisPane.update();
				DimensionHightlightPane.update();
				MeasureHighlightPane.update();
				
				VisPane.hideLoader();
				DimensionHightlightPane.hideLoader();
				MeasureHighlightPane.hideLoader();
			}, 50);
		}
	}
}