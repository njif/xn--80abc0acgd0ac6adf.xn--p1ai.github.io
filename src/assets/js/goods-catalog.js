;(function(ns, $){

	// TODO: refactoring!

	var defaults = {
		itemSelector: '.catalog__item-link'
	}

	var catalog = (function(options) {

		var publicApi = {
			render: render
		}

		var config = $.extend({}, defaults, options);

		var goodsData = null,
			template = null,
			retryDelay = 200,
			$catalog = null
			isHelperRegistered = false;

		function render(selector) {

			if ($catalog)
				return this;

			prepareHtml();
			$catalog = $(selector);
			return this;
		}

		function prepareHtml() {

			registerHelpers();

			if (!goodsData)
				get('data/catalog.json', onDataLoaded, onError);

/*			TODO: test catalog template loading
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

			goodsData = data; 											// cached products
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

			// hide all opened dropdown on document click

			$(document).on('click', ':not(.cssdropdown__label)', function(event) { 

				hidePopups();
			});


			// hide all opened dropdown on other dropdown click

			$catalog.on('click', '.cssdropdown__label', function(event) { 
				
				stopPropagation(event);
				var $el = getTargetByEvent(event);
				hidePopups($el);
			});

			$catalog.on('click', '.cssdropdown__list-item', function(event) {

				stopPropagation(event);
				var $el = getTargetByEvent(event);
				changeItemVariant($el);

				closeCurentPopup($el);

			});
		}

		function changeItemVariant($element) {

			var html = $element.closest('.cssdropdown__list-item').html();
			var $html = $(html);
			$html.find('.item-price__old').remove();
			$element.closest('.cssdropdown__label').find('.cssdropdown__label_text').html($html.html());
		}

		function closeCurentPopup($element) {

			$element.closest('.cssdropdown__input').prop('checked', false);
		}

		function hidePopups(excludeElement) {

			var allDropdownPopups = $catalog.find('.cssdropdown__input');

			if (excludeElement)
				allDropdownPopups = allDropdownPopups.not(excludeElement);

			allDropdownPopups.prop('checked', false); 	// hide popup
														// look at cssdropdown.less:
														// .cssdropdown__input:checked ~ .cssdropdown__list-wrapper { ... }
		}

		function getTargetByEvent(ev) {

			return $(ev.target || ev.srcElement);
		}

		function stopPropagation(event) {

			event.stopPropagation();
			event.stopImmediatePropagation();
		}

		return publicApi;
	}());

	ns.catalog = catalog;

}(window.basik || window, jQuery));