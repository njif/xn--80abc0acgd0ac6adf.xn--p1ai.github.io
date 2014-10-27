;(function (ns, Handlebars) {

	var templater = (function() {

		var publicApi = {
			init: init,
			fillCatalog: fillCatalog
		}

		// Private vars and methods

		var defaults = {

			templateIds: {
				catalog: '#goods-catalog__items'
			}
		}

		var compiled = {};
		var isHelperRegistered = false;

		function fillCatalog(data) {

			var templateIds = defaults.templateIds.catalog;
			return fillTemplate(templateIds, data);
		}

		function init(){

			registerHelpers();
			return this;
		}

		function fillTemplate(sourceId, data) {

			var template = compiled[sourceId];

			if (template)
				return (template(data));

			var source = $(sourceId).html();
			var template = Handlebars.compile(source);

			compiled[sourceId] = template;
			return template(data);
		}

		function registerHelpers() {
			
			if (isHelperRegistered)
				return;
			Handlebars.registerHelper('min', minHelper);
			Handlebars.registerHelper('list', listHelper);
			isHelperRegistered = true;
		}

		function minHelper(arr, prop) {

			if (arr == null || arr.length === 0)
				return null;
			var min = arr[0][prop];
			for (var i = 1; i < arr.length; i++)
				if (arr[i].prop < min)
					min = arr[i][prop];
			return min;				
		}

		function listHelper(items, options) {

			var retval = "<ul>";
			var i, length = items.length;

			for (i = 0; i < length; i++) {
				retval += "<li>" + options.fn(items[i]) + "</li>";
			}

			return retval + "</ul>";
		}

		return publicApi;

	}());

	ns.templater = templater;

}(window.basik || window, Handlebars));