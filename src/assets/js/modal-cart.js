;(function(ns, $){

	// PUBLIC API:

	var cartApi = {
		init: init,
		getHtml: getHtml
	};

	function init(state, templater, options) {

		var instance = getInstance(options);
		instance.init(state, templater); 
		return cartApi;
	}

	function getHtml(data) {

		var instance = getInstance();
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
		modalSelector: '.modal__cart',// .modal-content'
		formSelector: '#order-form',// .modal-content'
		events: {}
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

			this._holder = $(this._config.modalSelector);
			this._templater = templater;
			this._appState = state;

			this._attachEvents();
		},
		
		getHtml: function(data) {

			if (!data || !data.items || data.items.length === 0)
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
				.on('click', '.modalcart__removepic', $.proxy(this._itemRemoveClick, this))
				.on('click', '[type=submit]', $.proxy(this._cartFormSubmitClick, this))

				.on('change', '.modalcart__item_spiner-input', $.proxy(this._cartItemCountChange, this))
				.on('click', '.modalcart__item_spiner', $.proxy(this._cartItemSpinnerClick, this))
				.on('change', '.modal__cart_contacts-wrapper input', _.debounce($.proxy(this._cartContactsChange, this), 300));
		},

		// ============================
		// TODO: refactor this shit later:

		_cartContactsChange: function(event) {

			var $el = this._getTargetByEvent(event);

			if (!this._config.events.contactchanged)
				return;

			var contacts = {};
			var contactFieldName = $el.attr('name');
			contacts[contactFieldName] = $el.val();

			this._appState.raise(this._config.events.contactchanged, contacts);
		},

		_cartItemSpinnerClick: function(event) {

			var $el = this._getTargetByEvent(event);
			var $input = $el.siblings('.modalcart__item_spiner-input');
			var val = $input.val() * 1;
			if ($el.hasClass('modalcart__item_spiner-minus'))
			{				
				if (val > 0) {
					$input.val(val - 1);
					$input.trigger('change');
				}

			} else {
				if (val < 99)
				{
					$input.val(val + 1);
					$input.trigger('change');
				}
			}
		},

		_cartItemCountChange: function(event) {

			var $el = this._getTargetByEvent(event);

			if (!this._config.events.itemchanged)
				return;

			this._appState.raise(this._config.events.itemchanged, { alias: $el.data('alias'), size: $el.data('size'), count: $el.val() });
		},

		_cartFormSubmitClick: function(event) {

			event.preventDefault();

			$('.modal__cart_error').text('').addClass('hidden');

			var $el = this._getTargetByEvent(event);

			if (!this._config.events.itemchanged)
				return;

			this._appState.raise(this._config.events.submited, { done: $.proxy(this._onFormSended, this) });

		},

		_onFormSended: function(response) {

			if (response.error)
				return $('.modal__cart_error').text(response.message).removeClass('hidden');

			this._holder.find('.modal').modal('hide');
		},

		_countMinusClick: function(event) {

			var $el = this._getTargetByEvent(event);
		},

		_countPlusClick: function(event) { 

			var $el = this._getTargetByEvent(event);
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