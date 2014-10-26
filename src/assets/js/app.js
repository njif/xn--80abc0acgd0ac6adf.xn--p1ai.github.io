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
			this._order = new ns.Order(this._state, { added: 'order.item.added', removed: 'order.item.removed' });

			this._controls.catalog = ns.catalog.state(this._state).render(".goods-catalog__items");

			this._createButtons();
			this._createPopups();

			this._attachPubSubEvents();
		},

		_createButtons: function() {

			var buttons = this._controls.buttons;
			buttons.goods = new ns.PageButton($('.cc_button_goods_catalog'), this._state, { click: 'buttons.goods_catalog.clicked' });
			buttons.item = new ns.PageButton($('.cc_catalog_item_link'), this._state, { click: 'buttons.goods_item.clicked' });

		},

		_createPopups: function() {

			$('body').append('<div id="popups__contaier"></div>');
			var popupsHolder = $('body').find('#popups__contaier');
			this._controls.popups.goodsitem = new ns.PopupGoodsItem(popupsHolder, this._state);
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
			
				.on('clicked:goods-item', function(clickEvent) {

					popups.goodsitem.show(clickEvent);
				})
				.on('clicked:goods-catalog', function(clickEvent) {

					var scrollTop = $('.goods-catalog').offset().top - $('.navbar-fixed-top').height();
					$("body").animate({ scrollTop: scrollTop }, 400, 'swing');
					return false;
				})
				.on('clicked:catalog_cart', function(orderItem) {

					owner._order.add(orderItem);
				})
				.on('added:order-item', function() {
					
					var count = owner._order.count();
					var $icon = $('.button-cart-count');
					if (count === 0)
						$icon.addClass('hidden').text('');
					else
						$icon.removeClass('hidden').text(count);
				});
		}
	};

	ns.BasikApp = BasikApp;

}(window.basik || window, jQuery));