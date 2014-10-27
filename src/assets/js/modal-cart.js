;(function(ns, $){

	// PUBLIC API:

	var cartApi = {
		init: init,
		getHtml: getHtml
	};
		
	var options = {};

	function init(state, templater) {

		var instance = getInstance(options);
		instance.init(state, templater); 
		return cartApi;
	}

	function getHtml(data) {

		var instance = getInstance(options);
		return instance.getHtml(data);
	}

	// =============================
	// PRIVATE:

	var catalogInstance = null;

	function getInstance(options) {

		if (!catalogInstance)		
			catalogInstance = new ModalCart(options);
			
		getInstance = function() { return catalogInstance; };
		return catalogInstance;
	};

	var defaults = {
		itemSelector: '#modal__cart'// .modal-content'
	}

	var ModalCart = function(options) {

		this._config = $.extend({}, defaults, options);

		this._appState = null;

		this._goodsData = null;
		this._templater = null;
		this._retryDelay = 200;
		this._holder = null;
	};

	ModalCart.prototype = {
		
		init: function(state, templater) {

			if (this._holder)
				return this;

			this._holder = $(this._config.itemSelector);
			this._templater = templater;
			this._appState = state;

			this._attachEvents();
		},
		
		getHtml: function(data) {

			if (!data || data.length === 0)
				return '<div class="modal__cart_body-empty">В вашей корзине ещё нет товаров.</div>';

			return this._fillTemplate(data);
		},
		
		_fillTemplate: function(data) {

			if (!this._templater)
				return;

			return this._templater.fillModalTable(data);				// fill template
		},

		_attachEvents: function() {

			this._holder
				.on('click', '.modalcart__item_spiner-minus', $.proxy(this._countMinusClick, this))
				.on('click', '.modalcart__item_spiner-plus', $.proxy(this._countPlusClick, this))
				.on('click', '.modalcart__removepic', $.proxy(this._itemRemoveClick, this));
		},

		// ============================
		// TODO: refactor this shit later:

		_countMinusClick: function(event) {

			var $el = this._getTargetByEvent(event);
		},

		_countPlusClick: function(event) { 
				
			this._stopPropagation(event);
		},

		_itemRemoveClick: function(event) {

			var $el = this._getTargetByEvent(event);
		},
		
		_getTargetByEvent: function(ev) {

			return $(ev.target || ev.srcElement);
		}
	};

	ns.modalCart = cartApi;

}(window.basik || window, jQuery));