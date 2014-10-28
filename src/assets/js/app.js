;(function(ns, $) {

	// THE CORE OF BASIK APPLICATION.
	// It only create controls and subscribe / publish events.
	// It created than document is ready.

	var BasikApp = function() {

		this._state = null;
		this._order = null;

		this._controls = { buttons: { goods: null, item: null }, popups: { goodsitem: null } };

		this._init();
	};

	BasikApp.prototype = {

		_init: function () {

			// Initialization here

			this._state = new ns.AppState(ns.eventList || {});			

			var templater = ns.templater.init();

			this._order = new ns.Order(this._state, { changed: 'order.item.changed' });

			this._controls.catalog = ns.catalog.init(this._state, templater).render();
<<<<<<< HEAD

			var cartEvents = { itemchanged: 'cart.item-count.changed', submited: 'cart.form.submited', contactchanged: 'cart.contact.changed' };
			this._controls.modalCart = ns.modalCart.init(this._state, templater, { events: cartEvents });
=======
			this._controls.modalCart = ns.modalCart.init(this._state, templater);
>>>>>>> dcd63662b97568d80fe04f55744c5c9df43af385

			this._createButtons();

			this._attachPubSubEvents();
		},

		_createButtons: function() {

			var buttons = this._controls.buttons;
			buttons.goToCart = new ns.PageButton($('.navbar__header-button'), this._state, { click: 'buttons.header_cart.clicked' });
			buttons.goToCatalog = new ns.PageButton($('.cc_button_goods_catalog'), this._state, { click: 'buttons.goods_catalog.clicked' });
		},

		_attachPubSubEvents: function() {

			// Attach pub/sub events here
			// clickEvent - some object that creates on click event (like params)
			// AppState subscribe to controls events. 
			// And it publish own events than some control raise event.

			var controls = this._controls;
			var state = this._state;
			var menu = controls.menu;
			var owner = this;
			var popups = this._controls.popups;

			state // subscribe to

			// BUTTONS CLICK EVENTS
				.on('clicked:goods-catalog', function(clickEvent) {

					var scrollTop = $('.goods-catalog').offset().top - $('.navbar-fixed-top').height();
					$("body").animate({ scrollTop: scrollTop }, 400, 'swing');
					return false;
				})
				.on('clicked:header_cart', function(clickEvent) {

					var html = ns.templater.fillModalCart({});
					var holder = $('.modal__cart').html(html);
					var tableHtml = owner._controls.modalCart.getHtml({ items: owner._order.items(), contacts: owner._order.contacts() } );
					holder.find('.modal__cart_body').html(tableHtml);
					holder.find('.modal').modal('show');
					return false;
				})				
				.on('clicked:catalog_cart', function(orderItem) {

					owner._order.add(orderItem);
				})
				.on('changed:order-item', function() {
					
					var count = owner._order.count();
					var $icon = $('.button-cart-count');
					if (count === 0)
						$icon.addClass('hidden').text('');
					else
						$icon.removeClass('hidden').text(count);
				})
				.on('changed:cart-item-count', function(params) {

					owner._order.setItemCount(params.alias, params.size, params.count);
				})
				.on('changed:cart-contact', function(contacts) {

					owner._order.contacts(contacts);
				})
				.on('submited:cart-form', function(params) {

					var json = owner._order.toJson();

					var onDone = function(response) {
						if (!response || response.error)							
							return params.done(response);

						owner._order.clear();
						params.done(response);
					};

					var newParams = $.extend({}, params, json, { done: onDone });

					ns.jstools.sendEmail(newParams);
				});
		}
	};

	ns.BasikApp = BasikApp;

}(window.basik || window, jQuery));