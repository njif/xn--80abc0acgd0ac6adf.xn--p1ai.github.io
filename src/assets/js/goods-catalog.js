;(function(ns, $){

	// PUBLIC API:

	var catalogApi = {
		init: init,
		render: render
	};
		
	var options = {};

	function init(state, templater, selector) {

		var instance = getInstance(options);
		instance.init(state, templater, selector); 
		return instance;
	}

	function render() {

		var instance = getInstance(options);
		instance.render(); 
		return instance;
	}

	// =============================
	// PRIVATE:

	var catalogInstance = null;

	function getInstance(options) {

		if (!catalogInstance)		
			catalogInstance = new Catalog(options);
			
		getInstance = function() { return catalogInstance; };
		return catalogInstance;
	};

	var defaults = {
		itemSelector: '.catalog__item-link',
		dataUrl: 'data/catalog.json'
	}

	var Catalog = function(options) {

		this._config = $.extend({}, defaults, options);

		this._appState = null;

		this._goodsData = null;
		this._templater = null;
		this._retryDelay = 200;
		this._holder = null;
	};

	Catalog.prototype = {
		
		init: function(state, templater, selector) {

			if (this._holder)
				return this;

			this._holder = $(selector);
			this._templater = templater;
			this._appState = state;

			this._attachEvents();
		},
		
		render: function() {

			if (this._goodsData)
				return this._fillCatalog(this._goodsData);

			this._getData();
		},
		
		_fillCatalog: function(data) {

			if (!this._templater)
				return;

			var html = this._templater.fillCatalog(data);				// fill template
			this._holder.html(html);									// insert html into DOM
		},
		
		_getData: function() {											// load json file with catalog items

			var url = this._config.dataUrl;
			var onLoaded = $.proxy(this._onDataLoaded, this);
			var onError = $.proxy(this._onError, this);
			var options = { type: "GET", url: url, cache: false };

			$.ajax(options).done(onLoaded).fail(onError);
		},

		_onRequestFail: function( jqXHR, textStatus ) {
			
			this._retryRequest(this._getData, onLoaded, onError);
		},
		
		_retryRequest: function (requestHandler, url, onLoaded, onError) {

			setTimeout(function() {
				requestHandler(url, onLoaded, onError);
			}, this._retryDelay);
		},
		
		_onDataLoaded: function(data, textStatus, jqXHR) {

			this._goodsData = data;										// cached products
			this._fillCatalog(data);
		},
		
		_onError: function(jqXHR, textStatus, errorThrown) {

			this._holder.html(textStatus);								// show error
		},

		_attachEvents: function() {

			this._holder
				.on('click', '.cssdropdown__label_text', $.proxy(this._dropdownLabelClick, this))
				.on('click', '.cssdropdown__list-item', $.proxy(this._dropdownListItemClick, this))
				.on('click', '.goods-catalog__item_buy', $.proxy(this._itemAddToCartClick, this));

			// hide all opened dropdown on document click
			$(document).on('click', ':not(.cssdropdown__label)', $.proxy(this._dropdownNotLabelClick, this));
		},

		// ============================
		// TODO: refactor this shit later:

		_dropdownNotLabelClick: function(event) {

			this._stopPropagation(event);
			var $el = this._getTargetByEvent(event);
			if ($el.hasClass('cssdropdown__input'))
				return;
			this._hidePopups();
		},

		_dropdownLabelClick: function(event) { 
				
			this._stopPropagation(event);
			var $el = this._getTargetByEvent(event);
			this._hidePopups($el);
		},

		_dropdownListItemClick: function(event) {

			this._stopPropagation(event);
			event.preventDefault();
			var $el = this._getTargetByEvent(event);
			this._changeItemVariant($el);

			this._displayCurrentPopup($el, false);
		},

		_itemAddToCartClick: function(event) {

			if (!this._appState)
				return;

			var $el = this._getTargetByEvent(event);

			// find element in goodsData
			var alias = this._findAliasByElement($el);
			var goodsItem = _.find(this._goodsData.items, function(item) { return item.alias === alias; });

			if (!goodsItem)
				return;

			var itemSize = this._findSizeByElement($el);
			
			if (!itemSize)											// validate itemSize
			{
				this._stopPropagation(event);
				this._displayCurrentPopup($el, true);
				return;
			}

			var orderItem = $.extend({}, goodsItem, { size: itemSize });

			this._appState.raise('buttons.catalog_cart.clicked', orderItem);
		},
		
		_findSizeByElement: function($element) {

			var $label = $element.siblings('.catalog__item_variants').find('.cssdropdown__label');
			return $label.data('size');	
		},
		
		_findAliasByElement: function($element) {

			var $label = $element.closest('.goods-catalog__item');
			return $label.data('alias');
		},
		
		_changeItemVariant: function($element) {

			var $element = $element.closest('.cssdropdown__list-item');

			var size = $element.data('size');

			// change label text:
			var html = $element.html();
			var $html = $(html);
			$html.find('.item-price__old').remove();
			$element.closest('.cssdropdown__label').data('size', size).find('.cssdropdown__label_text').html($html.html());
		},
		
		_displayCurrentPopup: function($element, display) {

			display = display || false;
			$element.closest('.goods-catalog__item').find('.cssdropdown__input').prop('checked', display);
		},
		
		_hidePopups: function(excludeElement) {

			var allDropdownPopups = this._holder.find('.cssdropdown__input');

			if (excludeElement)
				allDropdownPopups = allDropdownPopups.not(excludeElement.closest('.cssdropdown__label').find('.cssdropdown__input'));

			allDropdownPopups.prop('checked', false); 	// hide popup
														// look at cssdropdown.less:
														// .cssdropdown__input:checked ~ .cssdropdown__list-wrapper { ... }
		},
		
		_getTargetByEvent: function(ev) {

			return $(ev.target || ev.srcElement);
		},
		
		_stopPropagation: function(event) {

			event.stopPropagation();
			event.stopImmediatePropagation();
		}
	};

	ns.catalog = catalogApi;

}(window.basik || window, jQuery));