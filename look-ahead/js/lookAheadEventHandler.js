const LookAheadEventHandler = {
	// *** currentEvent
	// select: [ { attributeName, type } ]
	// encodingName: { attributeName, type, aggregate, timeUnit }
	// filter: [ { attributeName, type, attributeValues, removeMissing } ]
	// showMe: density / trend

	// *** generatedVisSpecList
	// [{ 
	// 		specification: { 
	//			showMe: { type, added }
	//			encodingName: { attributeName, type, added }
	//			filter: [ { attributeName, type, attributeValues, lowerValue, upperValue, removeMissing, added } ]
	//		},
	// 		metaData: {
	//			qualityScore, threshold, knowledgeBaseID, 
	//			shortDescriptionHTML, thumbnailData, renderThumbnail,
	//			isVisualized,
	//			removedSpecification: {
	//				// assume filters are not removed
	//				showMe: { type },
	//				encodingName: { attributeName, type, aggregate, timeUnit }
	//			}
	//	    } 
	// }]

	previousEvent: {},
	currentEvent: {},

	needQueryExpansion: null,
	currentEventHandlers: null,
	generatedVisSpecList: null,
	filteredVisSpecList: null,

	listenEvent: function(forceUpdate = false) {
		const self = this;
		let previousEvent = null, currentEvent = null;
		let greenCapsulesChanged = null, hasEvent = null;

		// prepare
		self.savePreviousEvent();
		self.initBeforeGeneratingRec();
		self.getCurrentEvent();
		previousEvent = self.previousEvent;
		currentEvent = self.currentEvent;
		greenCapsulesChanged = !LookAheadHelpers.areEventsTheSame(previousEvent, currentEvent);
		hasEvent = !jQuery.isEmptyObject(currentEvent);

		// recommend
		if (greenCapsulesChanged || forceUpdate)
			LookAheadPane.clear();
		
		if ((greenCapsulesChanged && hasEvent) || forceUpdate) {
			LookAheadPane.showLoader();
			setTimeout(function() {
				self.getCurrentEventHandlers();
				self.generateVisSpec();
				self.generateVisSpecMetadata();
				self.filterVisSpec();
				self.sortFilteredVisSpec();
				self.inferRemovedSpec();					
				self.removeRedundantVisSpec();

				if (self.filteredVisSpecList.length == 0) { // over spec or empty results
					self.needQueryExpansion = true;
					self.getEventHandlersForOverSpecification();
					self.generateVisSpec();
					self.generateVisSpecMetadata();
					self.filterVisSpec();
					self.sortFilteredVisSpec();
					self.inferRemovedSpec();					
					self.removeRedundantVisSpec();
				}

				LookAheadPane.show();
				LookAheadPane.hideLoader();
			}, 10);
		}
	},

	// preparation

	savePreviousEvent: function() {
		const self = this;
		let modifiedEvent = self.currentEvent;

		if ('filter' in modifiedEvent)
			for (let i = 0; i < modifiedEvent.filter.length; i++)
				delete modifiedEvent.filter[i].added;

		self.previousEvent = modifiedEvent;
	},
	initBeforeGeneratingRec: function() {
		const self = this;
		let previousEvent = self.previousEvent;
		let currentEvent = LookAheadHelpers.getFilterEvents();
		let filterInPreviousEvent = 'filter' in previousEvent
		let filterInCurrentEvent = 'filter' in currentEvent;
		let sameFilters = (filterInPreviousEvent && filterInCurrentEvent) 
						? Helpers.areSameObjectLists(previousEvent.filter, currentEvent.filter) : false;
		
		let databaseNotInitiated = (LookAheadDatabase.filteredData == null);
		let filterHasChanged = (filterInPreviousEvent && !filterInCurrentEvent) ||
							   (!filterInPreviousEvent && filterInCurrentEvent) ||
							   (filterInPreviousEvent && filterInCurrentEvent && !sameFilters);

		if (filterHasChanged || databaseNotInitiated)
			LookAheadDatabase.processData();

		LAKBScagnosticsHandler.init();
	},
	getCurrentEvent: function() {
		const self = this;
		let currentEvent = {};
		let selectEvents = LookAheadHelpers.getSelectEvents();
		let encodingEvents = LookAheadHelpers.getEncodingEvents();
		let filterEvents = LookAheadHelpers.getFilterEvents();
		let showMeEvent = LookAheadHelpers.getShowMeEvent();

		// copy events
		for (let eventName in selectEvents) currentEvent[eventName] = selectEvents[eventName];
		for (let eventName in encodingEvents) currentEvent[eventName] = encodingEvents[eventName];
		for (let eventName in filterEvents) currentEvent[eventName] = filterEvents[eventName];
		for (let eventName in showMeEvent) currentEvent[eventName] = showMeEvent[eventName];
		self.currentEvent = currentEvent;
	},
	
	// core computation

	getCurrentEventHandlers: function() {
		const self = this;
		let currentEvent = self.currentEvent;
		let attrTypeCountInCurrentEvent = LookAheadHelpers.countAttributeType(currentEvent);
		let currentEventHandlerList = [];
		let overSpecification = true;

		for (let knowledgeBaseID in LookAheadKnowledgeBase) {
			let currentEventList = LookAheadKnowledgeBase[knowledgeBaseID].events;
			let isCurrentKnowledgeBaseItemActive = LookAheadKnowledgeBase[knowledgeBaseID].active;

			if (!isCurrentKnowledgeBaseItemActive)
				continue;

			for (let i = 0; i < currentEventList.length; i++) {
				let attrTypeCountInEventSpec = currentEventList[i].attributeCount;
				let currentEventHandler = currentEventList[i].handler;
				let attrCountExactlyMatches = LookAheadHelpers.checkAreAttrCountTheSame(attrTypeCountInCurrentEvent, attrTypeCountInEventSpec);
				let queryExpansionRequiredOnMatch = currentEventList[i].needQueryExpansion;

				if (attrCountExactlyMatches) {
					currentEventHandlerList.push(currentEventHandler);
					overSpecification = false; // matches to one mean no over specification
					break; // only get one event handler for each measure
				}
			}
		}

		self.needQueryExpansion = overSpecification; // need query expansion for over specification
		self.currentEventHandlers = currentEventHandlerList;
	},
	getEventHandlersForOverSpecification: function() {
		const self = this;
		let currentEvent = self.currentEvent;
		let attrTypeCountInCurrentEvent = LookAheadHelpers.countAttributeType(currentEvent);
		let eventHandlersAfterQueryExpansion = [];

		for (let knowledgeBaseID in LookAheadKnowledgeBase) {
			let currentEventList = LookAheadKnowledgeBase[knowledgeBaseID].events;
			let isCurrentKnowledgeBaseItemActive = LookAheadKnowledgeBase[knowledgeBaseID].active;

			if (!isCurrentKnowledgeBaseItemActive)
				continue;

			for (let i = 0; i < currentEventList.length; i++) {
				let attrTypeCountInEventSpec = currentEventList[i].attributeCount;
				let eventHandler = currentEventList[i].handler;
				let attrCountLooselyMatches = LookAheadHelpers.checkAreAttrCountGreater(attrTypeCountInCurrentEvent, attrTypeCountInEventSpec);

				if (attrCountLooselyMatches) {
					eventHandlersAfterQueryExpansion.push(eventHandler);
					break; // only get one event handler for each measure
				}
			}
		}

		self.currentEventHandlers = eventHandlersAfterQueryExpansion;
	},
	generateVisSpec: function() {
		const self = this;
		let currentEvent = self.currentEvent;
		let currentEventHandlers = self.currentEventHandlers;
		let generatedVisSpecList = [];

		for (let i = 0; i < currentEventHandlers.length; i++) {
			let currentEventHandler = currentEventHandlers[i];
			let eventModificationRules = currentEventHandler.eventModificationRules;
			let visSpecTemplate = currentEventHandler.template;
			let modifiedEventList = LookAheadHelpers.generateNewEventList(currentEvent, eventModificationRules);
			let fixedParamVisSpecList = LookAheadHelpers.generateFixedParamVisSpecList(modifiedEventList, currentEventHandler);
			let currentGeneratedVisSpecList = fixedParamVisSpecList;

			currentGeneratedVisSpecList = LookAheadHelpers.enumerateEncodings(currentGeneratedVisSpecList, visSpecTemplate, currentEvent);
			currentGeneratedVisSpecList = LookAheadHelpers.enumerateFilter(currentGeneratedVisSpecList, visSpecTemplate);
			generatedVisSpecList = generatedVisSpecList.concat(currentGeneratedVisSpecList);
		}

		self.generatedVisSpecList = generatedVisSpecList;
	},
	generateVisSpecMetadata: function() {
		const self = this;
		let generatedVisSpecList = self.generatedVisSpecList;

		for (let i = 0; i < generatedVisSpecList.length; i++) {
			let currentVisSpec = generatedVisSpecList[i];
			let currentKnowledgeBaseID = currentVisSpec.metadata.knowledgeBaseID;
			let generateMetadata = LookAheadKnowledgeBase[currentKnowledgeBaseID].generateVisSpecMetadata;

			currentVisSpec.metadata = generateMetadata(currentVisSpec.specification);
		}
	},
	filterVisSpec: function() {
		const self = this;
		let generatedVisSpecList = self.generatedVisSpecList;
		let filteredVisSpecList = [];

		for (let i = 0; i < generatedVisSpecList.length; i++) {
			let currentVisSpec = generatedVisSpecList[i];
			let currentQualityScore = currentVisSpec.metadata.qualityScore;
			let currentThreshold = currentVisSpec.metadata.threshold;

			if (currentQualityScore >= currentThreshold)
				filteredVisSpecList.push(currentVisSpec);
		}

		self.filteredVisSpecList = filteredVisSpecList;
	},
	sortFilteredVisSpec: function() {
		const self = this;
		let filteredVisSpecList = self.filteredVisSpecList;

		filteredVisSpecList.sort(function(a, b) {
			return b.metadata.qualityScore - a.metadata.qualityScore;
		});
	},
	inferRemovedSpec: function() {
		const self = this;
		let currentEvent = self.currentEvent;
		let filteredVisSpecList = self.filteredVisSpecList;

		for (let i = 0; i < filteredVisSpecList.length; i++) {
			let currentVisSpec = filteredVisSpecList[i];

			currentVisSpec.metadata.removedSpecification = {};
			LookAheadHelpers.inferRemovedEncodings(currentVisSpec, currentEvent);
			LookAheadHelpers.inferRemovedShowMe(currentVisSpec, currentEvent); // filters are replaced but not removed
		}
	},
	removeRedundantVisSpec: function() {
		const self = this;
		let filteredVisSpecList = self.filteredVisSpecList;
		let storedVisSpecList = [];

		for (let i = 0; i < filteredVisSpecList.length; i++) {
			let currentVisSpec = filteredVisSpecList[i];
			let isVisSpecSameAsCurrentEvent = LookAheadHelpers.checkIsVisSpecSameAsCurrentEvent(currentVisSpec.specification);
			let someEncodingsAreRemoved = !jQuery.isEmptyObject(currentVisSpec.metadata.removedSpecification);
			let visSpecCurrentlyVisualized = (isVisSpecSameAsCurrentEvent && !someEncodingsAreRemoved)
			let isDuplicatedVisSpec = LookAheadHelpers.checkIsDuplicatedVisSpec(currentVisSpec, storedVisSpecList);

			if (!visSpecCurrentlyVisualized && !isDuplicatedVisSpec)
				storedVisSpecList.push(currentVisSpec);
		}

		self.filteredVisSpecList = storedVisSpecList;
	}
}