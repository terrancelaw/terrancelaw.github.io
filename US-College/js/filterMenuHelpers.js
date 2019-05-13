const FilterMenuHelpers = {
	extractInformationFromInput: function(input) {
		const self = this;
		let lowerCaseInput = input.toLowerCase();
		let sortedAttributeNames = null, mostSimilarAttribute = null, attributeValueObject = null;

		[ attributeNamePartInInput, 
		  nonAttributeNamePartInInput, 
		  successfullySeperated ] = self.seperateAttributeNameFromNonAttributeName(lowerCaseInput);

		if (successfullySeperated) {
			sortedAttributeNames = self.computeSimilarAttributeList(attributeNamePartInInput);
			mostSimilarAttribute = sortedAttributeNames[0];
			attributeValueObject = self.extractAttributeValueObject(mostSimilarAttribute, nonAttributeNamePartInInput);
		}

		if (!successfullySeperated) {
			[ mostSimilarMatchIsAttrName,
			  sortedAttributeNames,
			  sortedMostSimilarValueList, // it is the value list for the attribute that corresponds to the most similar value
			  mostSimilarValueCorrAttr ] = self.computeSimilarAttributeNamesAndValues(lowerCaseInput);
			
			if (mostSimilarMatchIsAttrName) {
				sortedAttributeNames = sortedAttributeNames;
				mostSimilarAttribute = sortedAttributeNames[0];
				attributeValueObject = (Database.allAttributeMetadata[mostSimilarAttribute].type == 'numerical')
									 ? self.extractNumbers(mostSimilarAttribute, lowerCaseInput)
									 : { sortedCategories: FilterHandler.getUniqueValues(mostSimilarAttribute), mostSimilarCategory: null };
			}

			if (!mostSimilarMatchIsAttrName) {
				sortedAttributeNames = self.getNonExcludedAttributeNames();
				mostSimilarAttribute = mostSimilarValueCorrAttr;
				attributeValueObject = {
					sortedCategories: sortedMostSimilarValueList, 
					mostSimilarCategory: sortedMostSimilarValueList[0]
				};
			}
		}

		return [ sortedAttributeNames, mostSimilarAttribute, attributeValueObject ];
	},
	getAttributeNameListHTML: function(attributeNameList) {
		let attributeNameListHTML = '';

		for (let i = 0; i < attributeNameList.length; i++)
			attributeNameListHTML += '<div class="attribute-name" attribute-name="' + attributeNameList[i] + '">' + attributeNameList[i] + '</div>';

		return attributeNameListHTML;
	},
	getAttributeValueHTMLArray: function(attributeValueList) {
		const attributeValueHTMLArray = [];

		for (let i = 0; i < attributeValueList.length; i++)
			attributeValueHTMLArray.push('<div class="attribute-value" attribute-value="' + attributeValueList[i] + '">' + attributeValueList[i] + '</div>');

		return attributeValueHTMLArray;
	},
	generateRule: function(attributeName, attributeValueObject = null) {
		let hasRange = (attributeValueObject !== null) && 'lowerValue' in attributeValueObject;
		let hasCategory = (attributeValueObject !== null) && 'category' in attributeValueObject;
		let rule = '';

		if (attributeValueObject === null)
			rule = attributeName;
		if (attributeValueObject !== null && hasCategory)
			rule = attributeName + '=' + attributeValueObject.category;
		if (attributeValueObject !== null && hasRange)
			rule = attributeValueObject.lowerValue + '<=' + attributeName + '<=' + attributeValueObject.upperValue;

		return rule;
	},
	getNonExcludedAttributeNames: function() {
		let allAttributeNames = Object.keys(Database.allAttributeMetadata);
		let nonExcludedAttributeNames = [];

		for (let i = 0; i < allAttributeNames.length; i++) {
			let currentAttributeName = allAttributeNames[i];
			let attributeIsExcluded = Database.checkIfAttributeIsExcluded(currentAttributeName);

			if (!attributeIsExcluded)
				nonExcludedAttributeNames.push(currentAttributeName);
		}

		return nonExcludedAttributeNames;
	},

	// extract information from input

	seperateAttributeNameFromNonAttributeName: function(lowerCaseInput) {
		const self = this;
		let attributeNamePartInInput = lowerCaseInput; // if things went wrong, return original
		let nonAttributeNamePartInInput = lowerCaseInput; // if things went wrong, return original
		let successfullySeperated = false;

		let indexOfLessThanOrEqualTo = lowerCaseInput.indexOf('<=');
		let indexOfGreaterThanOrEqualTo = lowerCaseInput.indexOf('>=');
		let firstIndexOfLessThan = lowerCaseInput.indexOf('<');
		let lastIndexOfLessThan = lowerCaseInput.lastIndexOf('<');
		let firstIndexOfGreaterThan = lowerCaseInput.indexOf('>');
		let lastIndexOfGreaterThan = lowerCaseInput.lastIndexOf('>');
		let indexOfEqual = lowerCaseInput.indexOf('=');

		let indexOfIs = lowerCaseInput.indexOf(' is '); // add space to prevent bugs
		let indexOfFrom = lowerCaseInput.indexOf(' from ');
		let indexOfBetween = lowerCaseInput.indexOf(' between ');
		let indexOfLess = lowerCaseInput.indexOf(' less');
		let indexOfFew = lowerCaseInput.indexOf(' few');
		let indexOfLow = lowerCaseInput.indexOf(' low');
		let indexOfMore = lowerCaseInput.indexOf(' more');
		let indexOfGreat = lowerCaseInput.indexOf(' great');
		let indexOfHigh = lowerCaseInput.indexOf(' high');

		// check from higher priority to lower priority
		if (firstIndexOfLessThan != lastIndexOfLessThan && indexOfLessThanOrEqualTo == -1) { // < <
			attributeNamePartInInput = lowerCaseInput.substring(firstIndexOfLessThan + 1, lastIndexOfLessThan).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(0, firstIndexOfLessThan + 1) + ' ' + lowerCaseInput.substring(lastIndexOfLessThan);
			successfullySeperated = true;
		}
		else if (firstIndexOfLessThan != lastIndexOfLessThan && indexOfLessThanOrEqualTo == firstIndexOfLessThan) { // <= <
			attributeNamePartInInput = lowerCaseInput.substring(firstIndexOfLessThan + 2, lastIndexOfLessThan).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(0, firstIndexOfLessThan + 2) + ' ' + lowerCaseInput.substring(lastIndexOfLessThan);
			successfullySeperated = true;
		}
		else if (firstIndexOfLessThan != lastIndexOfLessThan && indexOfLessThanOrEqualTo == lastIndexOfLessThan) { // < <=
			attributeNamePartInInput = lowerCaseInput.substring(firstIndexOfLessThan + 1, lastIndexOfLessThan).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(0, firstIndexOfLessThan + 1) + ' ' + lowerCaseInput.substring(lastIndexOfLessThan);
			successfullySeperated = true;
		}
		else if (firstIndexOfGreaterThan != lastIndexOfGreaterThan && indexOfGreaterThanOrEqualTo == -1) { // > >
			attributeNamePartInInput = lowerCaseInput.substring(firstIndexOfGreaterThan + 1, lastIndexOfGreaterThan).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(0, firstIndexOfGreaterThan + 1) + ' ' + lowerCaseInput.substring(lastIndexOfGreaterThan);
			successfullySeperated = true;
		}
		else if (firstIndexOfGreaterThan != lastIndexOfGreaterThan && indexOfGreaterThanOrEqualTo == firstIndexOfGreaterThan) { // >= >
			attributeNamePartInInput = lowerCaseInput.substring(firstIndexOfGreaterThan + 2, lastIndexOfGreaterThan).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(0, firstIndexOfGreaterThan + 2) + ' ' + lowerCaseInput.substring(lastIndexOfGreaterThan);
			successfullySeperated = true;
		}
		else if (firstIndexOfGreaterThan != lastIndexOfGreaterThan && indexOfGreaterThanOrEqualTo == lastIndexOfGreaterThan) { // > >=
			attributeNamePartInInput = lowerCaseInput.substring(firstIndexOfGreaterThan + 1, lastIndexOfGreaterThan).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(0, firstIndexOfGreaterThan + 1) + ' ' + lowerCaseInput.substring(lastIndexOfGreaterThan);
			successfullySeperated = true;
		}
		else if (firstIndexOfLessThan != -1) { // < or <=
			attributeNamePartInInput = lowerCaseInput.substring(0, firstIndexOfLessThan).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(firstIndexOfLessThan);
			successfullySeperated = true;
		}
		else if (firstIndexOfGreaterThan != -1) { // > or >=
			attributeNamePartInInput = lowerCaseInput.substring(0, firstIndexOfGreaterThan).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(firstIndexOfGreaterThan);
			successfullySeperated = true;
		}
		else if (indexOfIs != -1) { // is
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfIs).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfIs);
			successfullySeperated = true;
		}
		else if (indexOfEqual != -1) { // =
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfEqual).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfEqual);
			successfullySeperated = true;
		}
		else if (indexOfFrom != -1) { // between
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfFrom).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfFrom);
			successfullySeperated = true;
		}
		else if (indexOfBetween != -1) { // from
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfBetween).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfBetween);
			successfullySeperated = true;
		}
		else if (indexOfLow != -1) { // low
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfLow).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfLow);
			successfullySeperated = true;
		}
		else if (indexOfLess != -1) { // less
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfLess).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfLess);
			successfullySeperated = true;
		}
		else if (indexOfFew != -1) { // few
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfFew).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfFew);
			successfullySeperated = true;
		}
		else if (indexOfHigh != -1) { // high
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfHigh).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfHigh);
			successfullySeperated = true;
		}
		else if (indexOfGreat != -1) { // great
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfGreat).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfGreat);
			successfullySeperated = true;
		}
		else if (indexOfMore != -1) { // more
			attributeNamePartInInput = lowerCaseInput.substring(0, indexOfMore).trim();
			nonAttributeNamePartInInput = lowerCaseInput.substring(indexOfMore);
			successfullySeperated = true;
		}
		else { // fail to find keywords
			let splittedInput = lowerCaseInput.trim().split(' ');
			let currentToken = '';
			let attributeNameList = self.getNonExcludedAttributeNames();

			for (let i = 0; i < splittedInput.length; i++) {
				currentToken += (i == 0) ? splittedInput[i] : ' ' + splittedInput[i];

				for (let j = 0; j < attributeNameList.length; j++) {
					let lowerCaseCurrentAttribute = attributeNameList[j].toLowerCase();
					let currentTokenIsPartOfAnAttr = (lowerCaseCurrentAttribute.indexOf(currentToken) != -1);

					if (currentTokenIsPartOfAnAttr) {
						let inputWithoutMatchedToken = '';

						for (let k = i + 1; k < splittedInput.length; k++)
							inputWithoutMatchedToken += (k != splittedInput.length - 1) ? (splittedInput[k] + ' ') : splittedInput[k];

						attributeNamePartInInput = currentToken;
						nonAttributeNamePartInInput = inputWithoutMatchedToken;
						successfullySeperated = true;
						break;
					}
				}
			}
		}

		return [ attributeNamePartInInput, nonAttributeNamePartInInput, successfullySeperated ];
	},
	computeSimilarAttributeList: function(attributeNameInInput) {
		const self = this;
		let attributeNameList = self.getNonExcludedAttributeNames();
		let sortedAttributeNameObjects = [];
		let sortedAttributeNames = [];

		// compute edit distance
		for (let i = 0; i < attributeNameList.length; i++) {
			let currentAttributeName = attributeNameList[i];
			let lowerCaseCurrentAttributeName = attributeNameList[i].toLowerCase();
			let wordDistance = self.computeWordDistance(lowerCaseCurrentAttributeName, attributeNameInInput);

			sortedAttributeNameObjects.push({
				attributeName: currentAttributeName,
				distanceFromInput: wordDistance
			});
		}

		// sort attribute names to find the most similar
		sortedAttributeNameObjects.sort(function(a, b) {
			if (a.distanceFromInput < b.distanceFromInput) return -1;
		  	if (a.distanceFromInput > b.distanceFromInput) return 1;
		  	return 0;
		});

		for (let i = 0; i < sortedAttributeNameObjects.length; i++)
			sortedAttributeNames.push(sortedAttributeNameObjects[i].attributeName);

		return sortedAttributeNames;
	},
	extractAttributeValueObject: function(mostSimilarAttribute, nonAttributeNamePartInInput) {
		const self = this;
		let isMostSimilarAttributeNumerical = Database.allAttributeMetadata[mostSimilarAttribute].type == 'numerical';
		let attributeValueObject = isMostSimilarAttributeNumerical 
								 ? { lowerValue: null, upperValue: null } 
								 : { sortedCategories: null, mostSimilarCategory: null };

		if (!isMostSimilarAttributeNumerical) {
			let attributeValueList = FilterHandler.getUniqueValues(mostSimilarAttribute);
			let attributeValueInInput = '';
			let sortedAttributeValueObjects = [];
			let sortedAttributeValues = [];

			// extract attribute value in input
			if (nonAttributeNamePartInInput.indexOf('=') != -1) {
				let indexOfToken = nonAttributeNamePartInInput.indexOf('=');
				attributeValueInInput = nonAttributeNamePartInInput.substring(indexOfToken + 1, nonAttributeNamePartInInput.length).trim();
			}
			else if (nonAttributeNamePartInInput.indexOf('is') != -1) {
				let indexOfToken = nonAttributeNamePartInInput.indexOf('is');
				attributeValueInInput = nonAttributeNamePartInInput.substring(indexOfToken + 2, nonAttributeNamePartInInput.length).trim();
			}
			else {
				attributeValueInInput = nonAttributeNamePartInInput;
			}

			// handle different cases of extractions
			if (attributeValueInInput == '') {
				attributeValueObject.sortedCategories = attributeValueList;
				attributeValueObject.mostSimilarCategory = null;
			}

			if (attributeValueInInput != '') {
				// compute edit distance
				for (let i = 0; i < attributeValueList.length; i++) {
					let currentAttributeValue = attributeValueList[i];
					let lowerCaseCurrentAttributeValue = attributeValueList[i].toLowerCase();
					let wordDistance = self.computeWordDistance(lowerCaseCurrentAttributeValue, attributeValueInInput);

					sortedAttributeValueObjects.push({
						attributeValue: currentAttributeValue,
						distanceFromInput: wordDistance
					});
				}

				// sort attribute values to find the most similar
				sortedAttributeValueObjects.sort(function(a, b) {
					if (a.distanceFromInput < b.distanceFromInput) return -1;
		  			if (a.distanceFromInput > b.distanceFromInput) return 1;
		  			return 0;
				});

				for (let i = 0; i < sortedAttributeValueObjects.length; i++)
					sortedAttributeValues.push(sortedAttributeValueObjects[i].attributeValue);

				// store results
				attributeValueObject.sortedCategories = sortedAttributeValues;
				attributeValueObject.mostSimilarCategory = sortedAttributeValues[0];
			}			
		}

		if (isMostSimilarAttributeNumerical) {
			let numbersInInput = [];
			let inputWithoutComma = nonAttributeNamePartInInput.replace(/,/g, '');
			let inputWithNumbersOnly = inputWithoutComma.replace(/[^0-9.]/g, ' ');
			let tokensInInput = inputWithNumbersOnly.split(' ');
			[ minValue, maxValue ] = FilterHandler.getMinMaxValues(mostSimilarAttribute);

			// find numbers
			for (let i = 0; i < tokensInInput.length; i++) {
				let currentToken = tokensInInput[i];
				let isCurrentTokenANumber = !isNaN(currentToken);
				let isCurrentTokenNull = (currentToken == '')

				if (isCurrentTokenANumber && !isCurrentTokenNull)
					numbersInInput.push(parseFloat(currentToken));
			}

			// get upper and lower values
			if (numbersInInput.length >= 2) { // between
				attributeValueObject.lowerValue = d3.min(numbersInInput);
				attributeValueObject.upperValue = d3.max(numbersInInput);
			}
			else if (numbersInInput.length == 1 &&
					(nonAttributeNamePartInInput.indexOf('low') != -1 || nonAttributeNamePartInInput.indexOf('less') != -1 ||
					 nonAttributeNamePartInInput.indexOf('few') != -1 || nonAttributeNamePartInInput.indexOf('<') != -1)) {
				attributeValueObject.lowerValue = minValue;
				attributeValueObject.upperValue = numbersInInput[0];
			}
			else if (numbersInInput.length == 1 &&
				    (nonAttributeNamePartInInput.indexOf('high') != -1 || nonAttributeNamePartInInput.indexOf('great') != -1 ||
				     nonAttributeNamePartInInput.indexOf('more') != -1 || nonAttributeNamePartInInput.indexOf('>') != -1)) {
				attributeValueObject.lowerValue = numbersInInput[0];
				attributeValueObject.upperValue = maxValue;
			}
			else if (numbersInInput.length == 1) {
				attributeValueObject.lowerValue = numbersInInput[0];
				attributeValueObject.upperValue = numbersInInput[0];
			}
		}

		return attributeValueObject;
	},
	computeSimilarAttributeNamesAndValues: function(lowerCaseInput) {
		const self = this;
		let lowerCaseInputWithoutNumbers = self.removeNumbers(lowerCaseInput);
		let attributeNameList = self.getNonExcludedAttributeNames();
		let sortedAttributeNameObjects = [], sortedAttributeValueObjectLists = {};
		let overallMinWordDistance = Infinity, attributeValueMinWordDistance = Infinity;
		let typeOfStringWithMinWordDistance = null;
		let mostSimilarMatchIsAttrName = false, sortedAttributeNames = [], sortedMostSimilarValueList = [], mostSimilarValueCorrAttr = null;

		// compute edit distance for attribute names
		for (let i = 0; i < attributeNameList.length; i++) {
			let currentAttributeName = attributeNameList[i];
			let lowerCaseCurrentAttributeName = attributeNameList[i].toLowerCase();
			let wordDistance = self.computeWordDistance(lowerCaseCurrentAttributeName, lowerCaseInputWithoutNumbers);

			sortedAttributeNameObjects.push({
				attributeName: currentAttributeName,
				distanceFromInput: wordDistance
			});

			if (wordDistance < overallMinWordDistance) {
				typeOfStringWithMinWordDistance = 'attributeName';
				overallMinWordDistance = wordDistance;
			}
		}

		// compute edit distance for attribute values
		for (let i = 0; i < attributeNameList.length; i++) {
			let currentAttributeName = attributeNameList[i];
			let currentAttributeIsNumerical = Database.allAttributeMetadata[currentAttributeName].type == 'numerical';
			let currentAttributeValueList = FilterHandler.getUniqueValues(currentAttributeName);

			if (currentAttributeIsNumerical)
				continue;
			if (!currentAttributeIsNumerical)
				sortedAttributeValueObjectLists[currentAttributeName] = [];

			for (let i = 0; i < currentAttributeValueList.length; i++) {
				let currentAttributeValue = currentAttributeValueList[i];
				let lowerCaseCurrentAttributeValue = currentAttributeValueList[i].toLowerCase();
				let wordDistance = self.computeWordDistance(lowerCaseCurrentAttributeValue, lowerCaseInputWithoutNumbers);

				sortedAttributeValueObjectLists[currentAttributeName].push({
					attributeValue: currentAttributeValue,
					distanceFromInput: wordDistance
				});

				if (wordDistance < overallMinWordDistance) {
					typeOfStringWithMinWordDistance = 'attributeValue';
					overallMinWordDistance = wordDistance;
				}

				if (wordDistance < attributeValueMinWordDistance) {
					mostSimilarValueCorrAttr = currentAttributeName;
					attributeValueMinWordDistance = wordDistance;
				}
			}
		}

		// compute return information
		if (typeOfStringWithMinWordDistance == 'attributeName')
			mostSimilarMatchIsAttrName = true;

		if (mostSimilarMatchIsAttrName) {
			sortedAttributeNameObjects.sort(function(a, b) {
				if (a.distanceFromInput < b.distanceFromInput) return -1;
			  	if (a.distanceFromInput > b.distanceFromInput) return 1;
			  	return 0;
			});

			for (let i = 0; i < sortedAttributeNameObjects.length; i++)
				sortedAttributeNames.push(sortedAttributeNameObjects[i].attributeName);
		}

		if (!mostSimilarMatchIsAttrName) {
			sortedAttributeValueObjectLists[mostSimilarValueCorrAttr].sort(function(a, b) {
				if (a.distanceFromInput < b.distanceFromInput) return -1;
		  		if (a.distanceFromInput > b.distanceFromInput) return 1;
		  		return 0;
			});

			for (let i = 0; i < sortedAttributeValueObjectLists[mostSimilarValueCorrAttr].length; i++)
				sortedMostSimilarValueList.push(sortedAttributeValueObjectLists[mostSimilarValueCorrAttr][i].attributeValue);
		}

		return [ mostSimilarMatchIsAttrName, sortedAttributeNames, sortedMostSimilarValueList, mostSimilarValueCorrAttr ];
	},
	removeNumbers: function(lowerCaseInput) {
		let inputWithoutComma = lowerCaseInput.replace(/,/g, '');
		let splittedInput = inputWithoutComma.split(' ');
		let tokensWithoutNumbers = [];
		let inputWithoutNumbers = '';

		for (let i = 0; i < splittedInput.length; i++) {
			let currentToken = splittedInput[i];
			let currentTokenIsNotANumber = isNaN(currentToken);

			if (currentTokenIsNotANumber)
				tokensWithoutNumbers.push(currentToken.trim());
		}

		for (let i = 0; i < tokensWithoutNumbers.length; i++)
			inputWithoutNumbers += (i != tokensWithoutNumbers.length - 1)
								? tokensWithoutNumbers[i] + ' '
								: tokensWithoutNumbers[i];

		return inputWithoutNumbers;
	},
	extractNumbers: function(mostSimilarAttribute, lowerCaseInput) {
		let inputWithoutComma = lowerCaseInput.replace(/,/g, '');
		let inputWithNumbersOnly = inputWithoutComma.replace(/[^0-9.]/g, ' ');
		let tokensInInput = inputWithNumbersOnly.split(' ');
		let numbersInInput = [];
		[ minValue, maxValue ] = FilterHandler.getMinMaxValues(mostSimilarAttribute);
		let lowerValue = null, upperValue = null;

		// find numbers
		for (let i = 0; i < tokensInInput.length; i++) {
			let currentToken = tokensInInput[i];
			let isCurrentTokenANumber = !isNaN(currentToken);
			let isCurrentTokenNull = (currentToken == '')

			if (isCurrentTokenANumber && !isCurrentTokenNull)
				numbersInInput.push(parseFloat(currentToken));
		}

		// get upper and lower values
		if (numbersInInput.length >= 2) { // between
			lowerValue = d3.min(numbersInInput);
			upperValue = d3.max(numbersInInput);
		}
		else if (numbersInInput.length == 1 &&
				(lowerCaseInput.indexOf('low') != -1 || lowerCaseInput.indexOf('less') != -1 ||
				 lowerCaseInput.indexOf('few') != -1 || lowerCaseInput.indexOf('<') != -1)) {
			lowerValue = minValue;
			upperValue = numbersInInput[0];
		}
		else if (numbersInInput.length == 1 &&
			    (lowerCaseInput.indexOf('high') != -1 || lowerCaseInput.indexOf('great') != -1 ||
			     lowerCaseInput.indexOf('more') != -1 || lowerCaseInput.indexOf('>') != -1)) {
			lowerValue = numbersInInput[0];
			upperValue = maxValue;
		}
		else if (numbersInInput.length == 1) {
			lowerValue = numbersInInput[0];
			upperValue = numbersInInput[0];
		}

		return { lowerValue: lowerValue, upperValue: upperValue };
	},
	computeWordDistance: function(attributeNameOrValue, input) {
		let attributeNameOrValueLength = attributeNameOrValue.length;
		let inputLength = input.length;
		let userInputIsStart = attributeNameOrValue.indexOf(input) == 0;
		let wordDistance = null;

		if (attributeNameOrValueLength > inputLength) {
			if (userInputIsStart)
				wordDistance = editDistance(attributeNameOrValue, input) / attributeNameOrValueLength - 1;
			else if (!userInputIsStart)
				wordDistance = editDistance(attributeNameOrValue, input) / attributeNameOrValueLength;
		}
		else if (attributeNameOrValueLength <= inputLength) {
			if (userInputIsStart)
				wordDistance = editDistance(attributeNameOrValue, input) / inputLength - 1;
			else if (!userInputIsStart)
				wordDistance = editDistance(attributeNameOrValue, input) / inputLength;
		}

		return wordDistance;
	}
}