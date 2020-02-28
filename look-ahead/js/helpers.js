const Helpers = {

	// name

	getTableau10Colour: function(index) {
		let processedIndex = index % 10;
		let tableau10Colours = [
			'#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
			'#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'
		];

		return tableau10Colours[processedIndex];
	},
	getMonthName: function(index) {
		let month = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];

		return month[index - 1];
	},
	sortMonthNames: function(givenMonths) {
		let sortedMonths = [];
		let allMonths = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];

		for (let i = 0; i < allMonths.length; i++) {
			let currentMonth = allMonths[i];
			let foundCurrentMonthInGivenList = givenMonths.indexOf(currentMonth) != -1;

			if (foundCurrentMonthInGivenList)
				sortedMonths.push(currentMonth);
		}

		return sortedMonths;
	},
	getWeekdayName: function(index) {
		let weekday = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];

		return weekday[index - 1];
	},
	sortWeekdayNames: function(givenWeekdays) {
		let sortedWeekdas = [];
		let allWeekdays = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];

		for (let i = 0; i < allWeekdays.length; i++) {
			let currentWeekday = allWeekdays[i];
			let foundCurrentWeekdayInGivenList = givenWeekdays.indexOf(currentWeekday) != -1;

			if (foundCurrentWeekdayInGivenList)
				sortedWeekdas.push(currentWeekday);
		}

		return sortedWeekdas;
	},

	// overflow

	isXOverflow: function(el) {
		return el.scrollWidth > el.clientWidth;
	},
	isYOverflow: function(el) {
		return el.scrollHeight > el.clientHeight;
	},

	// object

	isObject: function(variable) {
		return (typeof variable === 'object' && variable !== null);
	},
	createShallowCopy: function(object) {
		let newObject = {};

		for (let prop in object)
			newObject[prop] = object[prop];

		return newObject;
	},
	createShallowFilterCopy: function(filterList) {
		const self = this;
		let newFilterList = [];

		for (let i = 0; i < filterList.length; i++) {
			let currentFilter = filterList[i];
			let newFilter = Helpers.createShallowCopy(currentFilter);

			newFilterList.push(newFilter);
		}

		return newFilterList;
	},
	areSameObjectLists: function(list1, list2) { // each object element should either be value or an array
		const self = this;

		if (list1 === null || list2 === null)
			return false;

		// are objects in list1 found in list2?
		for (let i = 0; i < list1.length; i++) {
			let currentObject = list1[i];
			let currentObjectFound = false;

			for (let j = 0; j < list2.length; j++) {
				let anotherObject = list2[j];
				let sameAsCurrentObject = true;

				for (let prop in currentObject) {
					let currentObjectValue = currentObject[prop];
					let anotherObjectValue = anotherObject[prop];
					let isValueArray = Array.isArray(currentObjectValue);
					let areValuesTheSame = isValueArray 
										 ? self.areValueArrayTheSame(currentObjectValue, anotherObjectValue)
										 : (currentObjectValue === anotherObjectValue);

					if (!areValuesTheSame) {
						sameAsCurrentObject = false;
						break;
					}
				}

				if (sameAsCurrentObject) {
					currentObjectFound = true;
					break;
				}
			}

			if (!currentObjectFound)
				return false;
		}

		// are objects in list2 found in list1?
		for (let i = 0; i < list2.length; i++) {
			let currentObject = list2[i];
			let currentObjectFound = false;

			for (let j = 0; j < list1.length; j++) {
				let anotherObject = list1[j];
				let sameAsCurrentObject = true;

				for (let prop in currentObject) {
					let currentObjectValue = currentObject[prop];
					let anotherObjectValue = anotherObject[prop];
					let isValueArray = Array.isArray(currentObjectValue);
					let areValuesTheSame = isValueArray 
										 ? self.areValueArrayTheSame(currentObjectValue, anotherObjectValue)
										 : (currentObjectValue === anotherObjectValue);

					if (!areValuesTheSame) {
						sameAsCurrentObject = false;
						break;
					}
				}

				if (sameAsCurrentObject) {
					currentObjectFound = true;
					break;
				}
			}

			if (!currentObjectFound)
				return false;
		}

		return true;
	},

	// array

	areValueArrayTheSame: function(array1, array2) {
		// are values in array1 found in array2?
		for (let i = 0; i < array1.length; i++)
			if (array2.indexOf(array1[i]) == -1)
				return false;

		// are values in array2 found in array1?
		for (let i = 0; i < array2.length; i++)
			if (array1.indexOf(array2[i]) == -1)
				return false;

		return true;
	},
	shuffle: function(a) {
	    var j, x, i;

	    for (i = a.length - 1; i > 0; i--) {
	        j = Math.floor(Math.random() * (i + 1));
	        x = a[i];
	        a[i] = a[j];
	        a[j] = x;
	    }

	    return a;
	}
}