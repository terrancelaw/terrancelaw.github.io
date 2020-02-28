const LookAheadHelpers = {

	// areEventsTheSame

	areEventsTheSame: function(event1, event2) {
		const self = this;
		let hasSameSelectEvent = self.checkIfSameSelectEvents(event1, event2);
		let hasSameEncodingEvent = self.checkIfSameEncodingEvents(event1, event2);
		let hasSameFilterEvent = self.checkIfSameFilterEvents(event1, event2);
		let hasSameShowMeEvent = self.checkIfSameShowMeEvents(event1, event2);

		return (hasSameSelectEvent && hasSameEncodingEvent && hasSameFilterEvent && hasSameShowMeEvent);
	},
	checkIfSameSelectEvents: function(event1, event2) {
		const self = this;
		let selectEventInEvent1 = ('select' in event1);
		let selectEventInEvent2 = ('select' in event2);

		if ((selectEventInEvent1 && !selectEventInEvent2) || 
			(!selectEventInEvent1 && selectEventInEvent2))
			return false;

		if (selectEventInEvent1 && selectEventInEvent2)
			return Helpers.areSameObjectLists(event1.select, event2.select);

		return true;
	},
	checkIfSameEncodingEvents: function(event1, event2) {
		for (let shelfName in Shelf) {
			let currentEncodingName = Shelf[shelfName].encodingName;
			let currentEncodingEventInEvent1 = (currentEncodingName in event1);
			let currentEncodingEventInEvent2 = (currentEncodingName in event2);

			if ((currentEncodingEventInEvent1 && !currentEncodingEventInEvent2) || 
				(!currentEncodingEventInEvent1 && currentEncodingEventInEvent2))
				return false;

			if (currentEncodingEventInEvent1 && currentEncodingEventInEvent2)
				if ((event1[currentEncodingName].attributeName !== event2[currentEncodingName].attributeName) ||
					(event1[currentEncodingName].type !== event2[currentEncodingName].type) ||
					(event1[currentEncodingName].timeUnit !== event2[currentEncodingName].timeUnit) ||
					(event1[currentEncodingName].aggregate !== event2[currentEncodingName].aggregate))
					return false;
		}

		return true;
	},
	checkIfSameFilterEvents: function(event1, event2) {
		const self = this;
		let filterEventInEvent1 = ('filter' in event1);
		let filterEventInEvent2 = ('filter' in event2);

		if ((filterEventInEvent1 && !filterEventInEvent2) || 
			(!filterEventInEvent1 && filterEventInEvent2))
			return false;

		if (filterEventInEvent1 && filterEventInEvent2)
			return Helpers.areSameObjectLists(event1.filter, event2.filter);

		return true;
	},
	checkIfSameShowMeEvents: function(event1, event2) {
		let showMeEventInEvent1 = ('showMe' in event1);
		let showMeEventInEvent2 = ('showMe' in event2);

		if ((showMeEventInEvent1 && !showMeEventInEvent2) || 
			(!showMeEventInEvent1 && showMeEventInEvent2))
			return false;

		if (showMeEventInEvent1 && showMeEventInEvent2)
			if (event1.showMe !== event2.showMe)
				return false;

		return true;
	},

	// getCurrentEvent

	getSelectEvents: function() {
		const self = this;
		let selectedCapsuleData = DimensionMeasurePaneCapsules.getSelectedCapsuleData();
		let selectedAttributeList = [];

		for (let i = 0; i < selectedCapsuleData.length; i++) {
			let currentAttributeName = selectedCapsuleData[i].attributeName;
			let currentAttributeType = selectedCapsuleData[i].type;
			let currentAttributeTimeUnit = selectedCapsuleData[i].timeUnit;
			let selectedAttributeObject = {};

			if (currentAttributeType == 'temporal')
				selectedAttributeObject.timeUnit = currentAttributeTimeUnit;

			selectedAttributeObject.attributeName = currentAttributeName;
			selectedAttributeObject.type = currentAttributeType;
			selectedAttributeList.push(selectedAttributeObject);
		}

		if (selectedAttributeList.length != 0)
			return { select: selectedAttributeList };
		if (selectedAttributeList.length == 0)
			return {};
	},
	getEncodingEvents: function() {
		let encodingEvents = {};

		for (let shelfName in Shelf) {
			let isCurrentShelfOccupied = !Shelf[shelfName].isEmpty();
			let currentShelfData = Shelf[shelfName].getCapsuleData();
			let currentShelfEncodingName = Shelf[shelfName].encodingName;

			if (isCurrentShelfOccupied) {
				let currentAttributeName = currentShelfData.attributeName;
				let currentAttributeType = currentShelfData.type;
				let currentAttributeTimeUnit = currentShelfData.timeUnit;
				let currentAttributeAggregate = currentShelfData.aggregate;
				let currentAttributeObject = {};

				currentAttributeObject.attributeName = currentAttributeName;
				currentAttributeObject.type = currentAttributeType;
				currentAttributeObject.timeUnit = currentAttributeTimeUnit;
				currentAttributeObject.aggregate = currentAttributeAggregate;
				encodingEvents[currentShelfEncodingName] = currentAttributeObject;
			}
		}

		if (!jQuery.isEmptyObject(encodingEvents))
			return encodingEvents;
		if (jQuery.isEmptyObject(encodingEvents))
			return {};
	},
	getFilterEvents: function() {
		let filterList = [];

		for (let filterName in Filter) {
			let currentFilter = Filter[filterName];
			let currentFilterHasRange = ('range' in currentFilter.filterSpecification);

			if (!currentFilterHasRange)
				filterList.push({
					attributeName: currentFilter.attributeName,
					type: currentFilter.attributeType,
					attributeValues: currentFilter.getCheckedItemList(),
					removeMissing: currentFilter.isMissingValueButtonSelected()
				});

			if (currentFilterHasRange)
				filterList.push({
					attributeName: currentFilter.attributeName,
					type: currentFilter.attributeType,
					lowerValue: currentFilter.slider.bootstrapSlider("getValue")[0],
					upperValue: currentFilter.slider.bootstrapSlider("getValue")[1],
					removeMissing: currentFilter.isMissingValueButtonSelected()
				});
		}

		if (filterList.length != 0)
			return { filter: filterList };
		if (filterList.length == 0)
			return {};
	},
	getShowMeEvent: function() {
		let isDensityPlotSelected = ShowMe.isDensityPlotSelected();
		let isTrendLinesSelected = ShowMe.isTrendLinesSelected();

		if (isDensityPlotSelected)
			return { showMe: 'density' };
		if (isTrendLinesSelected)
			return { showMe: 'trend' };
		if (!isDensityPlotSelected && !isTrendLinesSelected)
			return {};
	},

	// getCurrentEventHandlers

	countAttributeType: function(event) {
		let self = this;
		let attributeTypeCount = { quantitative: 0, temporal: 0, nominal: 0 };
		let containHardToProcessAttr = self.checkIfContainHardToProcessAttr(event);

		if (containHardToProcessAttr)
			return { quantitative: 0, temporal: 0, nominal: 0 }; // no event will be matched

		if (!containHardToProcessAttr) {
			self.countAttributeTypeInSelectEvents(event, attributeTypeCount);
			self.countAttributeTypeInEncodingEvents(event, attributeTypeCount);
			return attributeTypeCount;
		}
	},
	checkIfContainHardToProcessAttr: function(event) {
		let self = this;
		let containHardToProcessAttr = false;

		if ('select' in event)
			for (let i = 0; i < event.select.length; i++) {
				let attributeName = event.select[i].attributeName;
				let isAutoGenerated = checkIsAutoGenerated(attributeName);
				let hasTooManyCategories = checkIfHasTooManyCategories(attributeName);
				if (isAutoGenerated || hasTooManyCategories) return true;
			}

		for (let encodingName in event) 
			if (encodingName != 'select' && encodingName != 'filter' && encodingName != 'showMe') {
				let attributeName = event[encodingName].attributeName;
				let isAutoGenerated = checkIsAutoGenerated(attributeName);
				let hasTooManyCategories = checkIfHasTooManyCategories(attributeName);
				if (isAutoGenerated || hasTooManyCategories) return true;
			}

		return false;

		function checkIsAutoGenerated(attributeName) {
			return Database.attributeMetadata[attributeName].isAutoGenerated;
		}

		function checkIfHasTooManyCategories(attributeName) {
			let isNominal = (Database.attributeMetadata[attributeName].type == 'nominal');
			let categoryList = LookAheadDatabase.uniqueValuesForEachAttribute[attributeName];
			if (isNominal && categoryList.length > LookAheadDatabase.maxNumberOfCategories) return true;
			else return false;
		}
	},
	countAttributeTypeInSelectEvents: function(event, attributeTypeCount) {
		const self = this;

		if (!('select' in event))
			return;

		for (let i = 0; i < event.select.length; i++) {
			let selectedAttributeType = event.select[i].type;
			attributeTypeCount[selectedAttributeType]++;
		}
	},
	countAttributeTypeInEncodingEvents: function(event, attributeTypeCount) {
		const self = this;

		for (let encodingName in event) 
			if (encodingName != 'select' && encodingName != 'filter' && encodingName != 'showMe') {
				let currentAttributeType = event[encodingName].type;
				attributeTypeCount[currentAttributeType]++;
			}
	},
	checkAreAttrCountTheSame: function(attrTypeCount1, attrTypeCount2) {
		if (!('quantitative' in attrTypeCount1)) attrTypeCount1.quantitative = 0;
		if (!('temporal' in attrTypeCount1)) attrTypeCount1.temporal = 0;
		if (!('nominal' in attrTypeCount1)) attrTypeCount1.nominal = 0;
		if (!('quantitative' in attrTypeCount2)) attrTypeCount2.quantitative = 0;
		if (!('temporal' in attrTypeCount2)) attrTypeCount2.temporal = 0;
		if (!('nominal' in attrTypeCount2)) attrTypeCount2.nominal = 0;

		for (let currentAttributeType in attrTypeCount1) {
			let count1 = attrTypeCount1[currentAttributeType];
			let count2 = attrTypeCount2[currentAttributeType];

			if (count1 != count2)
				return false;
		}

		return true;
	},
	checkAreAttrCountTheSame: function(attrTypeCount1, attrTypeCount2) {
		if (!('quantitative' in attrTypeCount1)) attrTypeCount1.quantitative = 0;
		if (!('temporal' in attrTypeCount1)) attrTypeCount1.temporal = 0;
		if (!('nominal' in attrTypeCount1)) attrTypeCount1.nominal = 0;
		if (!('quantitative' in attrTypeCount2)) attrTypeCount2.quantitative = 0;
		if (!('temporal' in attrTypeCount2)) attrTypeCount2.temporal = 0;
		if (!('nominal' in attrTypeCount2)) attrTypeCount2.nominal = 0;

		for (let currentAttributeType in attrTypeCount1) {
			let count1 = attrTypeCount1[currentAttributeType];
			let count2 = attrTypeCount2[currentAttributeType];

			if (count1 != count2)
				return false;
		}

		return true;
	},
	checkAreAttrCountGreater: function(attrTypeCountInCurrentEvent, attrTypeCountInEventSpec) {
		if (!('quantitative' in attrTypeCountInCurrentEvent)) attrTypeCountInCurrentEvent.quantitative = 0;
		if (!('temporal' in attrTypeCountInCurrentEvent)) attrTypeCountInCurrentEvent.temporal = 0;
		if (!('nominal' in attrTypeCountInCurrentEvent)) attrTypeCountInCurrentEvent.nominal = 0;
		if (!('quantitative' in attrTypeCountInEventSpec)) attrTypeCountInEventSpec.quantitative = 0;
		if (!('temporal' in attrTypeCountInEventSpec)) attrTypeCountInEventSpec.temporal = 0;
		if (!('nominal' in attrTypeCountInEventSpec)) attrTypeCountInEventSpec.nominal = 0;

		for (let currentAttributeType in attrTypeCountInCurrentEvent) {
			let countInCurrentEvent = attrTypeCountInCurrentEvent[currentAttributeType];
			let countInEventSpec = attrTypeCountInEventSpec[currentAttributeType];

			if (countInCurrentEvent < countInEventSpec)
				return false;
		}

		return true;
	},

	// generateNewEventList

	generateNewEventList: function(currentEvent, eventModificationRules) {
		const self = this;
		let modifiedEventList = self.initNewEventTemplate(currentEvent, eventModificationRules);

		self.mapCurrentEventToTemplate(currentEvent, modifiedEventList);
		self.copyFilterToModifiedEvents(currentEvent, modifiedEventList);
		self.copyShowMeToModifiedEvents(currentEvent, modifiedEventList);

		return modifiedEventList;
	},
	initNewEventTemplate: function(currentEvent, eventModificationRules) {
		let newEventList = [];

		for (let i = 0; i < eventModificationRules.length; i++) {
			let currentNewEventRule = eventModificationRules[i];
			let copiedCurrentNewEventRule = null;
			let currentEventMatchesCurrentRule = true;

			for (let encodingName in currentNewEventRule) {
				let requiredAttributeType = currentNewEventRule[encodingName];
				let requiredEncodingInCurrentEvent = (encodingName in currentEvent);
				let requiredAttrTypeInCurrentEventEncoding = requiredEncodingInCurrentEvent
														   ? (currentEvent[encodingName].type == requiredAttributeType)
														   : false;

				if (!requiredEncodingInCurrentEvent)
					currentEventMatchesCurrentRule = false;

				if (requiredEncodingInCurrentEvent && !requiredAttrTypeInCurrentEventEncoding)
					currentEventMatchesCurrentRule = false;
			}

			if (currentEventMatchesCurrentRule) {
				copiedCurrentNewEventRule = Helpers.createShallowCopy(currentNewEventRule);
				newEventList.push(copiedCurrentNewEventRule);
			}
		}

		if (newEventList.length == 0)
			newEventList = [ Helpers.createShallowCopy(eventModificationRules[0]) ];

		return newEventList;
	},
	mapCurrentEventToTemplate: function(currentEvent, modifiedEventList) {
		const self = this;

		// map encoding events to template
		for (let i = 0; i < modifiedEventList.length; i++) {
			let eventTemplate = modifiedEventList[i];
			let failedToMatchEncodingNames = [];

			for (let currentEncodingName in currentEvent) 
				if (currentEncodingName != 'select' && currentEncodingName != 'filter' && currentEncodingName != 'showMe') {
					let currentEncodingEvent = currentEvent[currentEncodingName];
					let failedToMatchCurrentTemplate = self.tryStrictReplacePlaceholders(eventTemplate, currentEncodingName, currentEncodingEvent);
					if (failedToMatchCurrentTemplate) failedToMatchEncodingNames.push(currentEncodingName)
				}

			for (let currentEncodingName in currentEvent) 
				if (failedToMatchEncodingNames.indexOf(currentEncodingName) != -1) { // fail previously
					let currentEncodingEvent = currentEvent[currentEncodingName];
					self.tryNonStrictReplacePlaceholders(eventTemplate, currentEncodingEvent);
				}
		}

		// map select events to template
		if ('select' in currentEvent)
			for (let i = 0; i < modifiedEventList.length; i++)
				for (let j = 0; j < currentEvent.select.length; j++) 
					self.tryNonStrictReplacePlaceholders(modifiedEventList[i], currentEvent.select[j]);
	},
	tryStrictReplacePlaceholders: function(eventTemplate, currentEncodingName, currentEncodingEvent) {
		let failedToMatch = true;

		for (let encodingNameInTemplate in eventTemplate) {
			let alreadyReplacedPlaceHolder = Helpers.isObject(eventTemplate[encodingNameInTemplate]) ? ('attributeName' in eventTemplate[encodingNameInTemplate]) : false;
			let requiredAttributeType = !Helpers.isObject(eventTemplate[encodingNameInTemplate]) ? eventTemplate[encodingNameInTemplate] : eventTemplate[encodingNameInTemplate].type;
			let requiredAggregate = !Helpers.isObject(eventTemplate[encodingNameInTemplate]) ? null : eventTemplate[encodingNameInTemplate].aggregate;
			let currentEncodingMatchesAggregate = (requiredAggregate === null) ? true : (currentEncodingEvent.aggregate === requiredAggregate);
			let currentAttrMatchesBothShelfAndType = (currentEncodingEvent.type == requiredAttributeType) &&
													 (currentEncodingName == encodingNameInTemplate);

			if (alreadyReplacedPlaceHolder)
				continue;

			if (currentAttrMatchesBothShelfAndType) {
				eventTemplate[encodingNameInTemplate] = Helpers.createShallowCopy(currentEncodingEvent);
				eventTemplate[encodingNameInTemplate].added = currentEncodingMatchesAggregate ? false : true; // will stay in same shelf
				failedToMatch = false;
				break;
			}
		}

		return failedToMatch;
	},
	tryNonStrictReplacePlaceholders: function(eventTemplate, currentEncodingEvent) {
		for (let encodingNameInTemplate in eventTemplate) {
			let alreadyReplacedPlaceHolder = Helpers.isObject(eventTemplate[encodingNameInTemplate]) ? ('attributeName' in eventTemplate[encodingNameInTemplate]) : false;
			let requiredAttributeType = !Helpers.isObject(eventTemplate[encodingNameInTemplate]) ? eventTemplate[encodingNameInTemplate] : eventTemplate[encodingNameInTemplate].type;
			let currentAttrMatchesType = (currentEncodingEvent.type == requiredAttributeType);

			if (alreadyReplacedPlaceHolder)
				continue;

			if (currentAttrMatchesType) {
				eventTemplate[encodingNameInTemplate] = Helpers.createShallowCopy(currentEncodingEvent);
				eventTemplate[encodingNameInTemplate].added = true;
				break;
			}
		}
	},
	copyFilterToModifiedEvents: function(currentEvent, modifiedEventList) {
		if (!('filter' in currentEvent))
			return;

		for (let i = 0; i < modifiedEventList.length; i++)
			modifiedEventList[i].filter = Helpers.createShallowFilterCopy(currentEvent.filter);
	},
	copyShowMeToModifiedEvents: function(currentEvent, modifiedEventList) {
		if (!('showMe' in currentEvent))
			return;

		for (let i = 0; i < modifiedEventList.length; i++)
			modifiedEventList[i].showMe = currentEvent.showMe;
	},

	// handleFixedParam

	generateFixedParamVisSpecList: function(modifiedEventList, currentEventHandler) {
		const self = this;
		let fixedParamVisSpecList = [];
		let visSpecTemplate = currentEventHandler.template;

		for (let i = 0; i < modifiedEventList.length; i++) {
			let currentEvent = modifiedEventList[i];
			let newVisSpec = {
				specification: {},
				metadata: {
					knowledgeBaseID: currentEventHandler.knowledgeBaseID, 
					qualityScore: null, threshold: null,
					thumbnailData: null, renderThumbnail: null,
					shortDescriptionHTML: null, 
					removedSpecification: null,
					isVisualized: null
				} 
			};

			self.addEncodingEvents(newVisSpec, currentEvent, visSpecTemplate);
			self.addFilterEvents(newVisSpec, currentEvent, visSpecTemplate);
			self.addShowMeEvents(newVisSpec, currentEvent, visSpecTemplate);
			fixedParamVisSpecList.push(newVisSpec);
		}

		return fixedParamVisSpecList;
	},
	addEncodingEvents: function(newVisSpec, currentEvent, visSpecTemplate) {
		const self = this;

		for (let encodingNameInTemplate in visSpecTemplate) {
			let isFilterOrShowMe = (encodingNameInTemplate == 'filter' || encodingNameInTemplate == 'showMe');
			let requiredEncodingInCurrentEvent = (encodingNameInTemplate in currentEvent);

			if (isFilterOrShowMe || !requiredEncodingInCurrentEvent)
				continue;

			let attributeNameInCurrentEvent = currentEvent[encodingNameInTemplate].attributeName;
			let attributeTypeInCurrentEvent = currentEvent[encodingNameInTemplate].type;
			let attributeTimeUnitInCurrentEvent = currentEvent[encodingNameInTemplate].timeUnit;
			let isCurrentAttributeAdded = currentEvent[encodingNameInTemplate].added;
			let currentAttributeObject = {
				attributeName: attributeNameInCurrentEvent,
				type: attributeTypeInCurrentEvent,
				added: isCurrentAttributeAdded
			}

			if (attributeTypeInCurrentEvent == 'temporal') // use year by default
				currentAttributeObject.timeUnit = (attributeTimeUnitInCurrentEvent != 'none') 
												? attributeTimeUnitInCurrentEvent : 'year';

			if ('aggregate' in visSpecTemplate[encodingNameInTemplate]) // overriding
				currentAttributeObject.aggregate = visSpecTemplate[encodingNameInTemplate].aggregate;

			if ('timeUnit' in visSpecTemplate[encodingNameInTemplate]) // overriding
				currentAttributeObject.timeUnit = visSpecTemplate[encodingNameInTemplate].timeUnit;

			newVisSpec.specification[encodingNameInTemplate] = currentAttributeObject;
		}
	},
	addFilterEvents: function(newVisSpec, currentEvent, visSpecTemplate) { // just copy
		if (!('filter' in currentEvent))
			return;

		if ('filter' in currentEvent)
			for (let i = 0; i < currentEvent.filter.length; i++)
				currentEvent.filter[i].added = false;

		newVisSpec.specification.filter = currentEvent.filter;
	},
	addShowMeEvents: function(newVisSpec, currentEvent, visSpecTemplate) {
		if (!('showMe' in visSpecTemplate))
			return;

		let showMeInNewVisSpec = {};
		let requiredShowMeType = visSpecTemplate.showMe.type;
		let currentShowMeType = ('showMe' in currentEvent) ? currentEvent.showMe : 'none';
		let showMeWillChange = (requiredShowMeType != currentShowMeType);

		showMeInNewVisSpec.type = requiredShowMeType;
		showMeInNewVisSpec.added = showMeWillChange;
		newVisSpec.specification.showMe = showMeInNewVisSpec;
	},

	// enumerate

	enumerateEncodings: function(initialVisSpecList, visSpecTemplate, currentEvent) {
		const self = this;
		let visSpecListAfterEnum = initialVisSpecList;
						
		for (let encodingName in visSpecTemplate)
			if (encodingName != 'filter' && visSpecTemplate[encodingName].enumerated) {
				let currentRule = visSpecTemplate[encodingName];
				let currentRuleIncludeAggregateDetail = ('aggregate' in currentRule);
				let currentRuleIncludeTimeUnitDetail = ('timeUnit' in currentRule);
				let requiredTimeUnit = currentRuleIncludeTimeUnitDetail ? currentRule.timeUnit : 'none';
				let requiredAggregate = currentRuleIncludeAggregateDetail ? currentRule.aggregate : 'none';
				let requiredAttributeType = currentRule.type;

				let isEnumeratedEncodingInCurrentEvent = (encodingName in currentEvent);
				let attributesOfRequiredType = LookAheadDatabase.getAttributesByType(requiredAttributeType);
				let currentVisSpecList = visSpecListAfterEnum;
				visSpecListAfterEnum = [];

				// for each visualization spec, enumerate for each name
				for (let i = 0; i < currentVisSpecList.length; i++) {
					let currentVisSpec = currentVisSpecList[i];
					let isCurrentEncodingAlreadyFixed = (encodingName in currentVisSpec.specification);
					
					if (isCurrentEncodingAlreadyFixed) {
						visSpecListAfterEnum.push(currentVisSpec);
						continue;
					}

					for (let j = 0; j < attributesOfRequiredType.length; j++) {
						let newVisSpecMetadata = Helpers.createShallowCopy(currentVisSpec.metadata);
						let newVisSpecSpecification = Helpers.createShallowCopy(currentVisSpec.specification);
						let newVisSpec = { metadata: newVisSpecMetadata, specification: newVisSpecSpecification };
						let enumeratedAttributeName = attributesOfRequiredType[j];
						let IsEnumeratedAttributeNameAlreadyOnShelf = false;

						if (isEnumeratedEncodingInCurrentEvent)
							IsEnumeratedAttributeNameAlreadyOnShelf = 
								(currentEvent[encodingName].attributeName == enumeratedAttributeName) &&
								(currentEvent[encodingName].type == requiredAttributeType) &&
								(currentEvent[encodingName].aggregate == requiredAggregate) &&
								(currentEvent[encodingName].timeUnit == requiredTimeUnit);

						newVisSpecSpecification[encodingName] = {};
						newVisSpecSpecification[encodingName].attributeName = enumeratedAttributeName;
						newVisSpecSpecification[encodingName].type = requiredAttributeType;
						newVisSpecSpecification[encodingName].added = IsEnumeratedAttributeNameAlreadyOnShelf ? false : true;
						visSpecListAfterEnum.push(newVisSpec);

						if (currentRuleIncludeAggregateDetail)
							newVisSpecSpecification[encodingName].aggregate = requiredAggregate;
						if (currentRuleIncludeTimeUnitDetail)
							newVisSpecSpecification[encodingName].timeUnit = requiredTimeUnit;
					}
				}
			}

		return visSpecListAfterEnum;
	},
	enumerateFilter: function(initialVisSpecList, visSpecTemplate) {
		const self = this;
		let visSpecListAfterEnum = initialVisSpecList;
		let filterInVisSpecTemplate = ('filter' in visSpecTemplate);
		let nameOfMatchingEncoding = filterInVisSpecTemplate ? visSpecTemplate.filter.attribute.substring(1) : null;
		let numOfCategoriesInComb = filterInVisSpecTemplate ? visSpecTemplate.filter.selected : null;
		let currentVisSpecList = null;

		// prepare and init
		if (!filterInVisSpecTemplate) return visSpecListAfterEnum;
		LookAheadDatabase.generateCombinationsForAllNominalAttributes(numOfCategoriesInComb); // naive method
		currentVisSpecList = visSpecListAfterEnum;
		visSpecListAfterEnum = []; 

		// for each visualization spec, enumerate for each category
		for (let i = 0; i < currentVisSpecList.length; i++) {
			let requiredAttributeName = currentVisSpecList[i].specification[nameOfMatchingEncoding].attributeName;
			let requiredAttributeType = currentVisSpecList[i].specification[nameOfMatchingEncoding].type;
			let requiredAttributeHasEnoughCategories = (requiredAttributeName in LookAheadDatabase.nominalAttrCombinations);
			let categoryCombinationOfRequiredAttr = LookAheadDatabase.nominalAttrCombinations[requiredAttributeName];

			if (!requiredAttributeHasEnoughCategories) // no push to visSpecListAfterEnum
				continue;

			for (let j = 0; j < categoryCombinationOfRequiredAttr.length; j++) {
				let newVisSpecMetadata = Helpers.createShallowCopy(currentVisSpecList[i].metadata);
				let newVisSpecSpecification = Helpers.createShallowCopy(currentVisSpecList[i].specification);
				let newVisSpec = { metadata: newVisSpecMetadata, specification: newVisSpecSpecification };

				let currentCategoryComb = categoryCombinationOfRequiredAttr[j];
				let filterInNewVisSpec = ('filter' in newVisSpecSpecification);
				let matchedFilterInSpec = null;
				let isCheckedListTheSame = null;

				if (filterInNewVisSpec) { // prepare
					newVisSpecSpecification.filter = Helpers.createShallowFilterCopy(newVisSpecSpecification.filter);
					matchedFilterInSpec = self.searchFilter(newVisSpecSpecification, requiredAttributeName, requiredAttributeType);
					isCheckedListTheSame = (matchedFilterInSpec !== null) 
										 ? Helpers.areValueArrayTheSame(matchedFilterInSpec.attributeValues, currentCategoryComb) : false;
				}

				// not in spec, add
				if (!filterInNewVisSpec)
					newVisSpecSpecification.filter = [{
						attributeName: requiredAttributeName,
						type: requiredAttributeType,
						attributeValues: currentCategoryComb,
						removeMissing: false, added: true
					}];

				// not in spec, add
				if (filterInNewVisSpec && matchedFilterInSpec === null)
					newVisSpecSpecification.filter.push({
						attributeName: requiredAttributeName,
						type: requiredAttributeType,
						attributeValues: currentCategoryComb,
						removeMissing: false, added: true
					});

				// in spec and checked list not the same, replace
				if (filterInNewVisSpec && matchedFilterInSpec !== null && !isCheckedListTheSame) {
					matchedFilterInSpec.attributeValues = currentCategoryComb;
					matchedFilterInSpec.added = true;
				}

				// in spec and checked list the same, don't replace
				if (filterInNewVisSpec && matchedFilterInSpec !== null && isCheckedListTheSame) {
					matchedFilterInSpec.attributeValues = currentCategoryComb;
					matchedFilterInSpec.added = false;
				}

				visSpecListAfterEnum.push(newVisSpec);
			}
		}

		return visSpecListAfterEnum;
	},
	searchFilter: function(visSpec, filterAttributeName, filterAttributeType) {
		const self = this;

		for (let i = 0; i < visSpec.filter.length; i++) {
			let currentFilter = visSpec.filter[i];
			let currentAttributeName = currentFilter.attributeName;
			let currentAttributeType = currentFilter.type;
			let requiredFilterFound = (currentAttributeName == filterAttributeName && 
									   currentAttributeType == filterAttributeType);

			if (requiredFilterFound) 
				return currentFilter;
		}

		return null;
	},

	// inferRemovedSpecs

	inferRemovedEncodings: function(visSpec, currentEvent) {
		for (let encodingName in currentEvent) 
			if (encodingName != 'select' && encodingName != 'filter' && encodingName != 'showMe') {
				let currentEncodingMissingInVisSpec = !(encodingName in visSpec.specification);
				let currentAttributeName = currentEvent[encodingName].attributeName;
				let currentAttributeType = currentEvent[encodingName].type;
				let currentAttributeAggregate = currentEvent[encodingName].aggregate;
				let currentAttributeTimeUnit = currentEvent[encodingName].timeUnit;

				if (currentEncodingMissingInVisSpec) {
					visSpec.metadata.removedSpecification[encodingName] = {};
					visSpec.metadata.removedSpecification[encodingName].attributeName = currentAttributeName;
					visSpec.metadata.removedSpecification[encodingName].type = currentAttributeType;
					visSpec.metadata.removedSpecification[encodingName].aggregate = currentAttributeAggregate;
					visSpec.metadata.removedSpecification[encodingName].timeUnit = currentAttributeTimeUnit;
				}
			}
	},
	inferRemovedShowMe: function(visSpec, currentEvent) {
		let showMeInCurrentEvent = ('showMe' in currentEvent);
		let showMeInVisSpec = ('showMe' in visSpec.specification);
		let showMeTypeInVisSpec = showMeInVisSpec ? visSpec.specification.showMe.type : null;
		let currentShowMeType = showMeInCurrentEvent ? currentEvent.showMe : null;
		let showIsTurnedOff = (showMeInCurrentEvent && !showMeInVisSpec)
						   || (showMeInCurrentEvent && showMeInVisSpec && showMeTypeInVisSpec !== currentShowMeType);

		if (showIsTurnedOff) {
			visSpec.metadata.removedSpecification.showMe = {};
			visSpec.metadata.removedSpecification.showMe.type = currentShowMeType;
		}
	},

	// generateFinalResults

	checkIsDuplicatedVisSpec: function(currentVisSpec, visSpecList) { // hacky
		for (let i = 0; i < visSpecList.length; i++) {
			let visSpecInList = visSpecList[i];
			let currentSpecification = currentVisSpec.specification;
			let specificationInList = visSpecInList.specification;	
			let xAttributeSameInBothVisSpec = ('x' in currentSpecification && 'x' in specificationInList) && (currentSpecification.x.attributeName == specificationInList.x.attributeName);
			let yAttributeSameInBothVisSpec = ('y' in currentSpecification && 'y' in specificationInList) && (currentSpecification.y.attributeName == specificationInList.y.attributeName);
			let colourAttributeSameInBothVisSpec = (!('color' in currentSpecification) && !('color' in specificationInList)) ||
												   (('color' in currentSpecification && 'color' in specificationInList) && (currentSpecification.color.attributeName == specificationInList.color.attributeName));
				
			if (xAttributeSameInBothVisSpec && yAttributeSameInBothVisSpec && colourAttributeSameInBothVisSpec) 
				return true;
		}

		return false;
	},
	checkIsVisSpecSameAsCurrentEvent: function(specification) {
		let isVisSpecSameAsCurrentEvent = true;

		for (let encodingName in specification)
			if (encodingName != 'filter')
				if (specification[encodingName].added)
					isVisSpecSameAsCurrentEvent = false;

		if ('filter' in specification)
			for (let i = 0; i < specification.filter.length; i++)
				if (specification.filter[i].added)
						isVisSpecSameAsCurrentEvent = false;

		return isVisSpecSameAsCurrentEvent;
	}
}