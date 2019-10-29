function computeMean(data, attributeName) {
	let sum = 0, count = 0;
	
	for (let i = 0; i < data.length; i++) {
		let currentRow = data[i];
		let currentValue = currentRow[attributeName];
		let currentValueIsMissing = (currentValue === null);

		if (!currentValueIsMissing) {
			sum += +currentValue;
			count++;
		}
	}

	if (count == 0) return -1;
	else return sum / count;
}

jQuery.fn.selectText = function() {
	var doc = document;
   	var element = this[0];

  	 if (doc.body.createTextRange) {
   	    var range = document.body.createTextRange();

   	    range.moveToElementText(element);
  	    range.select();
  	} 
   	else if (window.getSelection) {
       	var selection = window.getSelection();        
       	var range = document.createRange();

       	range.selectNodeContents(element);
       	selection.removeAllRanges();
       	selection.addRange(range);
   	}
};

jQuery.fn.placeCaretAtEnd = function() {
   	var element = this[0];

   	element.focus();

   	if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } 
    else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        
        textRange.moveToElementText(element);
        textRange.collapse(false);
        textRange.select();
    }
};
