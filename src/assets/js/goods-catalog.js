;(function(ns, $){

	// TODO: refactoring!!!

	var defaults = {
		itemSelector: '.catalog__item-link'
	}

	var catalog = (function(options) {

		var publicApi = {
			state: setState,
			render: render
		}

		var config = $.extend({}, defaults, options);

		var appState = null;

		var goodsData = null,
			template = null,
			retryDelay = 200,
			$catalog = null
			isHelperRegistered = false;

		function setState(state) {

			appState = state;
			return this;
		}

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

		function attachEvents() {

			// TODO: move all these handlers to another file

			// hide all opened dropdown on other dropdown click

			$catalog.on('click', '.cssdropdown__label_text', function(event) { 
				
				stopPropagation(event);
				var $el = getTargetByEvent(event);
				hidePopups($el);

			}).on('click', '.cssdropdown__list-item', function(event) {

				stopPropagation(event);
				event.preventDefault();
				var $el = getTargetByEvent(event);
				changeItemVariant($el);

				displayCurrentPopup($el, false);

			}).on('click', '.goods-catalog__item_buy', function(event) {

				if (!appState)
					return;

				var $el = getTargetByEvent(event);

				// find element in goodsData
				var alias = findAliasByElement($el);
				var goodsItem = _.find(goodsData.items, function(item) { return item.alias === alias; });

				if (!goodsItem)
					return;

				var itemSize = findSizeByElement($el);
				// validate itemSize
				if (!itemSize)
				{
					stopPropagation(event);
					displayCurrentPopup($el, true);
					return;
				}

				var orderItem = $.extend({}, goodsItem, { size: itemSize });

				appState.raise('buttons.catalog_cart.clicked', orderItem);

			});

			// hide all opened dropdown on document click

			$(document).on('click', ':not(.cssdropdown__label)', function(event) {

				stopPropagation(event);
				var $el = getTargetByEvent(event);
				if ($el.hasClass('cssdropdown__input'))
					return;
				hidePopups();
			});
		}

		function findSizeByElement($element) {

			var $label = $element.siblings('.catalog__item_variants').find('.cssdropdown__label');
			return $label.data('size');	
		}

		function findAliasByElement($element) {

			var $label = $element.closest('.goods-catalog__item');
			return $label.data('alias');
		}

		function changeItemVariant($element) {

			var $element = $element.closest('.cssdropdown__list-item');

			var size = $element.data('size');

			// change label text:
			var html = $element.html();
			var $html = $(html);
			$html.find('.item-price__old').remove();
			$element.closest('.cssdropdown__label').data('size', size).find('.cssdropdown__label_text').html($html.html());
		}

		function displayCurrentPopup($element, display) {

			display = display || false;
			$element.closest('.goods-catalog__item').find('.cssdropdown__input').prop('checked', display);
		}

		function hidePopups(excludeElement) {

			var allDropdownPopups = $catalog.find('.cssdropdown__input');

			if (excludeElement)
				allDropdownPopups = allDropdownPopups.not(excludeElement.closest('.cssdropdown__label').find('.cssdropdown__input'));

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