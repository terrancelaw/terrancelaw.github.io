function FilterTemplate(attributeName, attributeType) {
	const self = this;

	self.attributeName = attributeName;
	self.attributeType = attributeType;
	self.filterName = attributeName + ':' + attributeType;
	self.filterSpecification = { field: attributeName };
	self.removeMissing = false;
	self.capsuleEl = null;
	self.slider = null;
}

FilterTemplate.prototype.createCapsule = createCapsule;
FilterTemplate.prototype.createRangeCapsule = createRangeCapsule;
FilterTemplate.prototype.createListCapsule = createListCapsule;
FilterTemplate.prototype.allowResizing = allowResizing;
FilterTemplate.prototype.storeCapsuleEl = storeCapsuleEl;
FilterTemplate.prototype.removeCapsule = removeCapsule;

FilterTemplate.prototype.changeAttributeType = changeAttributeType;
FilterTemplate.prototype.changeAttributeName = changeAttributeName;
FilterTemplate.prototype.changeMissingValueButton = changeMissingValueButton;
FilterTemplate.prototype.startPreview = startPreview;
FilterTemplate.prototype.endPreview = endPreview;

FilterTemplate.prototype.updateSpecificationForList = updateSpecificationForList;
FilterTemplate.prototype.updateSpecificationForSlider = updateSpecificationForSlider;
FilterTemplate.prototype.updateSpecificationForMissingValue = updateSpecificationForMissingValue;

FilterTemplate.prototype.populateCapsuleContent = populateCapsuleContent;

FilterTemplate.prototype.generateCategories = generateCategories;
FilterTemplate.prototype.checkAllCheckboxes = checkAllCheckboxes;
FilterTemplate.prototype.uncheckAllCheckboxes = uncheckAllCheckboxes;
FilterTemplate.prototype.checkSelectedItems = checkSelectedItems;
FilterTemplate.prototype.getCheckedItemList = getCheckedItemList;
FilterTemplate.prototype.isMissingValueButtonSelected = isMissingValueButtonSelected;

FilterTemplate.prototype.initSlider = initSlider;
FilterTemplate.prototype.initSliderHandleValues = initSliderHandleValues;
FilterTemplate.prototype.initDragSliderBehaviour = initDragSliderBehaviour;
FilterTemplate.prototype.updateSliderMinMax = updateSliderMinMax;
FilterTemplate.prototype.updateSliderValues = updateSliderValues;
FilterTemplate.prototype.updateSliderStep = updateSliderStep;
FilterTemplate.prototype.updateSliderHandles = updateSliderHandles;
FilterTemplate.prototype.updateSliderMinMaxText = updateSliderMinMaxText;

FilterTemplate.prototype.installCapsuleBehaviour = installCapsuleBehaviour;
FilterTemplate.prototype.installMouseEnterSelectAllButtonBehaviour = installMouseEnterSelectAllButtonBehaviour;
FilterTemplate.prototype.installMouseEnterSelectNoneButtonBehaviour = installMouseEnterSelectNoneButtonBehaviour;
FilterTemplate.prototype.installMouseEnterRemoveButtonBehaviour = installMouseEnterRemoveButtonBehaviour;
FilterTemplate.prototype.installChangeListOptionBehaviour = installChangeListOptionBehaviour;
FilterTemplate.prototype.installClickMissingValueButtonBehaviour = installClickMissingValueButtonBehaviour;
FilterTemplate.prototype.installClickRemoveButtonBehaviour = installClickRemoveButtonBehaviour;
FilterTemplate.prototype.installClickSelectAllButtonBehaviour = installClickSelectAllButtonBehaviour;
FilterTemplate.prototype.installClickSelectNoneButtonBehaviour = installClickSelectNoneButtonBehaviour;

function createCapsule(isPreview = false) {
	const self = this;

	if (self.attributeType == 'quantitative' ||
		self.attributeType == 'temporal') {
		self.createRangeCapsule();
		self.storeCapsuleEl();
		self.allowResizing();
	}

	if (self.attributeType == 'ordinal' || 
		self.attributeType == 'nominal') {
		self.createListCapsule();
		self.storeCapsuleEl();
		self.allowResizing();
	}

	if (isPreview)
		self.startPreview();
}

function createRangeCapsule() {
	const self = this;
	let filterName = self.filterName;
	let capsuleHTML = '<div class="container">' +
						'<div class="capsule" filter-name="' + filterName + '">' +
							'<div class="filter-header">' +
								'<span class="attribute-type"><span class="fa"></span></span>' +
								'<span class="attribute-name"></span>' +
								'<span class="fa fa-times" data-tooltip="Remove"></span>' +
							'</div>' +
							'<div class="range filter-content">' +
								'<span class="min-text">min</span>' +
								'<input class="slider" type="text"/>' +
								'<span class="max-text">max</span>' +
							'</div>' +
							'<div class="range filter-footer">' +
								'<span class="filter-button"><span class="fa fa-filter"></span>Filter Missing Values</span>' +
							'</div>' +
						'</div>' +
					  '</div>';

	$('.shelf.filter')
		.append(capsuleHTML);
}

function createListCapsule() {
	const self = this;
	let filterName = self.filterName;
	let capsuleHTML = '<div class="container">' +
						'<div class="capsule" filter-name="' + filterName + '">' +
							'<div class="filter-header">' +
								'<span class="attribute-type"><span class="fa"></span></span>' +
								'<span class="attribute-name"></span>' +
								'<span class="far fa-square" data-tooltip="Select None"></span>' +
								'<span class="far fa-check-square" data-tooltip="Select All"></span>' +
								'<span class="fa fa-times" data-tooltip="Remove"></span>' +
							'</div>' +
							'<div class="list filter-content"></div>' +
							'<div class="list filter-footer">' +
								'<span class="filter-button"><span class="fa fa-filter"></span>Filter Missing Values</span>' +
							'</div>' +
						'</div>' +
					  '</div>';

	$('.shelf.filter')
		.append(capsuleHTML);
}

function allowResizing() {
	const self = this;

	$(self.capsuleEl)
		.resizable({
			handles: 's',
			create: function(event, ui) {
				$('.ui-resizable-s').css('cursor','ns-resize');
    		}
		});
}

function storeCapsuleEl() {
	const self = this;

	self.capsuleEl = $('.shelf.filter div:last-child .capsule')[0];
}

function removeCapsule() {
	const self = this;
	
	$(self.capsuleEl).closest('.container').remove();
	delete Filter[self.filterName];
}

function changeAttributeType() {
	const self = this;

	if (self.attributeType == 'quantitative')
		$(self.capsuleEl).find('.filter-header .attribute-type .fa')
			.addClass('fa-hashtag');

	if (self.attributeType == 'temporal')
		$(self.capsuleEl).find('.filter-header .attribute-type .fa')
			.addClass('fa-calendar');

	if (self.attributeType == 'ordinal' || self.attributeType == 'nominal')
		$(self.capsuleEl).find('.filter-header .attribute-type .fa')
			.addClass('fa-font');
}

function changeAttributeName() {
	const self = this;

	$(self.capsuleEl).find('.filter-header .attribute-name')
		.html(self.attributeName);
}

function changeMissingValueButton(selectMissingValueButton) {
	let self = this;

	if (selectMissingValueButton)
		$(self.capsuleEl).find('.filter-footer .filter-button')
			.addClass('selected');

	if (!selectMissingValueButton)
		$(self.capsuleEl).find('.filter-footer .filter-button')
			.removeClass('selected');
}

function startPreview() {
	const self = this;

	$(self.capsuleEl)
		.addClass('preview');
}

function endPreview() {
	const self = this;

	$(self.capsuleEl)
		.removeClass('preview');
}

function updateSpecificationForList() {
	const self = this;
	let needToRemoveMissing = self.removeMissing;
	let allCheckedOptions = [];

	$(self.capsuleEl).find('.list.filter-content .category').each(function() {
		let isCurrentCheckboxChecked = $(this).find('input[type="checkbox"]').is(':checked');
		let currentCheckboxValue = $(this).find('input[type="checkbox"]').val();

		if (isCurrentCheckboxChecked)
			allCheckedOptions.push(currentCheckboxValue);
	});

	if (!needToRemoveMissing && allCheckedOptions.length != 0) allCheckedOptions.push(null); // allow null values
	self.filterSpecification.oneOf = allCheckedOptions;
}

function updateSpecificationForSlider() {
	const self = this;
	let minHandleValue = self.slider.bootstrapSlider("getValue")[0];
	let maxHandleValue = self.slider.bootstrapSlider("getValue")[1];
	let currentRange = [ minHandleValue, maxHandleValue ];

	self.filterSpecification.range = currentRange;
}

function updateSpecificationForMissingValue() {
	const self = this;
	let isCurrentFilterList = ('oneOf' in self.filterSpecification);
	let isFilterButtonSelected = $(self.capsuleEl).find('.filter-footer .filter-button')
		.hasClass('selected');

	if (isFilterButtonSelected)
		self.removeMissing = true;
	if (!isFilterButtonSelected)
		self.removeMissing = false;
	if (isCurrentFilterList)
		self.updateSpecificationForList();
}

function populateCapsuleContent() {
	const self = this;
	let attributeName = self.attributeName;
	let attributeType = self.attributeType;

	if (attributeType == 'quantitative' || attributeType == 'temporal') {
		let min = Database.rangeAndDecimalForEachQuantAttr[attributeName].range[0];
		let max = Database.rangeAndDecimalForEachQuantAttr[attributeName].range[1];
		let realMaxNumberOfDecimal = Database.rangeAndDecimalForEachQuantAttr[attributeName].maxNumberOfDecimal;
		let maxNumberOfDecimal = (realMaxNumberOfDecimal > 2) ? 2 : realMaxNumberOfDecimal;
		let step = 1 / Math.pow(10, maxNumberOfDecimal);

		self.initSlider();
		self.initSliderHandleValues();
		self.updateSliderMinMax(min, max);
		self.updateSliderValues([ min, max ]);
		self.updateSliderStep(step);
		self.updateSliderHandles();
		self.updateSliderMinMaxText();
		self.updateSpecificationForSlider();
	}

	if (attributeType == 'ordinal' ||  attributeType == 'nominal') {
		self.generateCategories(attributeName);
		self.updateSpecificationForList();
	}
}

function generateCategories() {
	const self = this;
	let categoryList = Database.uniqueValuesForEachAttribute[self.attributeName];

	for (let i = 0; i < categoryList.length; i++) {
		let currentCategory = categoryList[i];
		let currentCategoryHTML = '<div class="category">' + 
									'<label class="custom-checkbox">' +
										currentCategory +
										'<input type="checkbox" value="' + currentCategory + '" checked>' +
	 			 						'<span class="checkmark"></span>' +
 			 						'</label>' +
								  '</div>';

		$(self.capsuleEl).find('.filter-content')
			.append(currentCategoryHTML);
	}
}

function uncheckAllCheckboxes() {
	const self = this;

	$(self.capsuleEl).find('.list.filter-content .category').each(function() {
		$(this).find('input[type="checkbox"]').prop('checked', false);
	});
}

function checkAllCheckboxes() {
	const self = this;

	$(self.capsuleEl).find('.list.filter-content .category').each(function() {
		$(this).find('input[type="checkbox"]').prop('checked', true);
	});
}

function checkSelectedItems(selectedItemList) {
	const self = this;

	$(self.capsuleEl).find('.list.filter-content input[type="checkbox"]').each(function() {
		let currentItemValue = $(this).val();
		let currentItemInSelectedList = selectedItemList.indexOf(currentItemValue) != -1;

		if (currentItemInSelectedList)
			$(this).prop('checked', true);
		if (!currentItemInSelectedList)
			$(this).prop('checked', false);
	});
}

function getCheckedItemList() {
	const self = this;
	let checkedItemList = [];

	$(self.capsuleEl).find('.list.filter-content input[type="checkbox"]:checked').each(function() {
		let currentItemValue = $(this).val();

		checkedItemList.push(currentItemValue);
	});

	return checkedItemList;
}

function isMissingValueButtonSelected() {
	const self = this;
	let isSelected = $(self.capsuleEl).find('.filter-footer .filter-button')
		.hasClass('selected');

	return isSelected;
}

function initSlider() {
	const self = this;

	self.slider = $(self.capsuleEl).find('.filter-content .slider')
		.bootstrapSlider({
			tooltip: "hide",
			min: 0,
			max: 10,
			value: [ 2, 8 ]
		});
}

function initSliderHandleValues() {
	let self = this;
	let minHandleLeft = $(self.capsuleEl).find('.filter-content .slider .min-slider-handle').position().left;
	let minHandleValue = self.slider.bootstrapSlider("getValue")[0];
	let maxHandleLeft = $(self.capsuleEl).find('.filter-content .slider .max-slider-handle').position().left;
	let maxHandleValue = self.slider.bootstrapSlider("getValue")[1];

	// add the lines and the values
	$(self.capsuleEl).find('.filter-content .slider')
		.prepend("<div class='min-handle-line'></div>");
	$(self.capsuleEl).find('.filter-content .slider')
		.prepend("<div class='max-handle-line'></div>");
	$(self.capsuleEl).find('.filter-content .slider')
		.prepend("<span class='min-handle-text'></span>");
	$(self.capsuleEl).find('.filter-content .slider')
		.prepend("<span class='max-handle-text'></span>");

	// init the lines and the values
	$(self.capsuleEl).find('.filter-content .min-handle-line')
		.css("left", minHandleLeft);
	$(self.capsuleEl).find('.filter-content .max-handle-line')
		.css("left", maxHandleLeft);
	$(self.capsuleEl).find('.filter-content .min-handle-text')
		.css("left", minHandleLeft)
		.html(minHandleValue);
	$(self.capsuleEl).find('.filter-content .max-handle-text')
		.css("left", maxHandleLeft)
		.html(maxHandleValue);
}

function initDragSliderBehaviour() {
	const self = this;
	let changeSliderTimer = null;

	self.slider.bootstrapSlider("on", "change", function() {
		PreviewMode.confirm();
		self.updateSliderHandles();
		self.updateSpecificationForSlider();

		// update vis after sliding is done
		clearTimeout(changeSliderTimer);
		changeSliderTimer = setTimeout(onSliding, 200);		
	});

	function onSliding() {
		VisualizationPane.showLoader();
		VisualizationPane.allowUpdating();
		VegaliteGenerator.generateSpecification(); // may block vis update
		VisualizationPane.tryUpdating();

		// look ahead
		LookAheadEventHandler.listenEvent();
	}
}

function updateSliderMinMax(min, max) {
	let self = this;

	self.slider.bootstrapSlider("setAttribute", "min", min);
	self.slider.bootstrapSlider("setAttribute", "max", max);
}

function updateSliderValues(range) {
	let self = this;

	self.slider.bootstrapSlider("setValue", range);
}

function updateSliderStep(step) {
	let self = this;

	self.slider.bootstrapSlider("setAttribute", "step", step);
}

function updateSliderHandles() {
	const self = this;
	let minHandleLeft = $(self.capsuleEl).find('.filter-content .slider .min-slider-handle').position().left;
	let minHandleValue = self.slider.bootstrapSlider("getValue")[0];
	let maxHandleLeft = $(self.capsuleEl).find('.filter-content .slider .max-slider-handle').position().left
	let maxHandleValue = self.slider.bootstrapSlider("getValue")[1];

	$(self.capsuleEl).find('.filter-content .min-handle-line')
		.css("left", minHandleLeft);
	$(self.capsuleEl).find('.filter-content .max-handle-line')
		.css("left", maxHandleLeft);
	$(self.capsuleEl).find('.filter-content .min-handle-text')
		.css("left", minHandleLeft)
		.html(minHandleValue);
	$(self.capsuleEl).find('.filter-content .max-handle-text')
		.css("left", maxHandleLeft)
		.html(maxHandleValue);
}

function updateSliderMinMaxText() {
	let self = this;
	let minValue = self.slider.bootstrapSlider("getAttribute", "min");
	let maxValue = self.slider.bootstrapSlider("getAttribute", "max");

	$(self.capsuleEl).find('.filter-content .min-text').html(minValue);
	$(self.capsuleEl).find('.filter-content .max-text').html(maxValue);
}

function installCapsuleBehaviour() {
	let self = this;

	if (self.attributeType == 'quantitative' ||
		self.attributeType == 'temporal') {
		self.installMouseEnterRemoveButtonBehaviour();

		self.initDragSliderBehaviour();
		self.installClickRemoveButtonBehaviour();
		self.installClickMissingValueButtonBehaviour();
	}

	if (self.attributeType == 'ordinal' || 
		self.attributeType == 'nominal') {
		self.installMouseEnterSelectAllButtonBehaviour();
		self.installMouseEnterSelectNoneButtonBehaviour();
		self.installMouseEnterRemoveButtonBehaviour();

		self.installChangeListOptionBehaviour();
		self.installClickRemoveButtonBehaviour();
		self.installClickSelectAllButtonBehaviour();
		self.installClickSelectNoneButtonBehaviour();
		self.installClickMissingValueButtonBehaviour();
	}
}

function installMouseEnterSelectAllButtonBehaviour() {
	let self = this;

	$(self.capsuleEl).find('.filter-header .fa-check-square')
		.on('mouseenter', onMouseEnterSelectAllButton)
		.on('mouseleave', onMouseLeaveSelectAllButton);

	function onMouseEnterSelectAllButton() { Tooltip.show(this, 16, -9); }
	function onMouseLeaveSelectAllButton() { Tooltip.remove(); }
}

function installMouseEnterSelectNoneButtonBehaviour() {
	let self = this;

	$(self.capsuleEl).find('.filter-header .fa-square')
		.on('mouseenter', onMouseEnterSelectNoneButton)
		.on('mouseleave', onMouseLeaveSelectNoneButton);

	function onMouseEnterSelectNoneButton() { Tooltip.show(this, 32, -9); }
	function onMouseLeaveSelectNoneButton() { Tooltip.remove(); }
}

function installMouseEnterRemoveButtonBehaviour() {
	let self = this;

	$(self.capsuleEl).find('.filter-header .fa-times')
		.on('mouseenter', onMouseEnterRemoveButton)
		.on('mouseleave', onMouseLeaveRemoveButton);

	function onMouseEnterRemoveButton() { Tooltip.show(this, -3, -9); }
	function onMouseLeaveRemoveButton() { Tooltip.remove(); }
}

function installChangeListOptionBehaviour() {
	let self = this;

	$(self.capsuleEl).find('.list.filter-content input[type="checkbox"]')
		.on('change', onChangeListOption);

	function onChangeListOption() {
		PreviewMode.confirm();
		self.updateSpecificationForList();

		// update vis
		VisualizationPane.showLoader();
		VisualizationPane.allowUpdating();
		VegaliteGenerator.generateSpecification(); // may block vis update
		VisualizationPane.tryUpdating();

		// look ahead
		LookAheadEventHandler.listenEvent();
	}
}

function installClickMissingValueButtonBehaviour() {
	let self = this;

	$(self.capsuleEl).find('.filter-footer .filter-button')
		.on('click', onClickMissingValueButton);

	function onClickMissingValueButton() {
		let isFilterButtonSelected = $(this).hasClass('selected');

		PreviewMode.confirm();

		// update specification
		if (isFilterButtonSelected) $(this).removeClass('selected');
		if (!isFilterButtonSelected) $(this).addClass('selected');
		self.updateSpecificationForMissingValue();

		// update vis
		VisualizationPane.showLoader();
		VisualizationPane.allowUpdating();
		VegaliteGenerator.generateSpecification(); // may block vis update
		VisualizationPane.tryUpdating();
	}
}

function installClickRemoveButtonBehaviour() {
	let self = this;

	$(self.capsuleEl).find('.filter-header .fa-times')
		.on('click', onClickRemoveButton);

	function onClickRemoveButton() {
		PreviewMode.confirm();

		// clear capsule
		self.removeCapsule();

		// update vis
		VisualizationPane.showLoader();
		VisualizationPane.allowUpdating();
		VegaliteGenerator.generateSpecification(); // may block vis update
		VisualizationPane.tryUpdating();

		// look ahead
		LookAheadEventHandler.listenEvent();
	}
}

function installClickSelectAllButtonBehaviour() {
	let self = this;

	$(self.capsuleEl).find('.filter-header .fa-check-square')
		.on('click', onClickSelectAllButton);

	function onClickSelectAllButton() {
		PreviewMode.confirm();
		self.checkAllCheckboxes();
		self.updateSpecificationForList();

		// update vis
		VisualizationPane.showLoader();
		VisualizationPane.allowUpdating();
		VegaliteGenerator.generateSpecification(); // may block vis update
		VisualizationPane.tryUpdating();

		// look ahead
		LookAheadEventHandler.listenEvent();
	}
}

function installClickSelectNoneButtonBehaviour() {
	let self = this;

	$(self.capsuleEl).find('.filter-header .fa-square')
		.on('click', onClickSelectNoneButton);

	function onClickSelectNoneButton() {
		PreviewMode.confirm();
		self.uncheckAllCheckboxes();
		self.updateSpecificationForList();

		// update vis
		VisualizationPane.showLoader();
		VisualizationPane.allowUpdating();
		VegaliteGenerator.generateSpecification(); // may block vis update
		VisualizationPane.tryUpdating();

		// look ahead
		LookAheadEventHandler.listenEvent();
	}
}