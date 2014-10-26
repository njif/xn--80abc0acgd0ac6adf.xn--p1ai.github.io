;(function(ns, $){

	var catalog = (function() {

		var publicApi = {
			render: render
		}

		var goods = null,
			template = null,
			retryDelay = 200,
			$catalog = null
			isHelperRegistered = false;

		function render(selector) {

			prepareHtml();
			$catalog = $(selector);
			return $catalog;
		}

		function prepareHtml() {

			registerHelpers();

			if (!goods)
				get('data/catalog.json', onDataLoaded, onError);
/*
			if (!template)
				get('templates/catalog.html', onDataLoaded, onError);
*/			
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

		function get(url, onLoaded, onError) {

			// load json file with catalog items
			var request = $.ajax({ 
				type: "GET", 
				url: url, 
				cache: false
			});

			request
				.done(onLoaded)
				.fail(function( jqXHR, textStatus ) {
					retryRequest(get, onLoaded, onError);
				});
		}

		function retryRequest (requestHandler, url, onLoaded, onError) {

			setTimeout(function() {
				requestHandler(url, onLoaded, onError);
			}, retryDelay);
		}

		function onDataLoaded(data, textStatus, jqXHR) {

			goods = data; 											// cached products
			var html = fillTemplate('#goods-catalog__items', data); // fill template
			$catalog.html(html);									// insert html into DOM
			plugins();
			attachEvents();
		}

		function onError(jqXHR, textStatus, errorThrown) {

			$catalog.html(textStatus);								// show error
		}

		function fillTemplate(sourceId, data) {

			var source = $(sourceId).html(),
				template = Handlebars.compile(source);
			return (template(data));
		}
		// plugins initialization
		function plugins() {

			//spinners = $(".spinners").spinner({max: 10, min: 0 }); // connect jquery ui
		}

		function attachEvents() {

			links = $('.catalog__item-link');
			links.on('click', function() { 

			});
		}

		return publicApi;
	}());

	ns.catalog = catalog;

}(window.basik || window, jQuery));