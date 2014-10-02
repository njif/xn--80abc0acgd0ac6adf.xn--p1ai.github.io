;(function(ns, $) {

	// THE CORE OF BASIK APPLICATION.
	// It only create controls and subscribe / publish events.
	// It created than document is ready.

	var BasikApp = function() {

		this._state = null;
		this._scroll = null;

		this._controls = { buttons: { goods: null, item: null }, popups: { goodsitem: null } };

		this._init();
	};

	BasikApp.prototype = {

		_init: function () {

			// Initialization here

			this._state = new ns.AppState(ns.eventList || {});
			this._createControls();
			this._attachEvents();
		},

		_createControls: function() {

			// Controls creation here

			this._createButtons();
			this._createPopups();			
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

		_attachEvents: function() {

			// Attach pub/sub events here
			// clickEvent - some object that creates on click event (like params)
			// AppState subscribe to controls events. 
			// And it publish own events than some control raise event.

			var controls = this._controls;
			var state = this._state;
			var menu = controls.menu;
			var owner = this;
			var popups = this._controls.popups;
			var scroll = this._scroll;

			state // subscribe to

			// BUTTONS CLICK EVENTS
			
				.on('clicked:goods-item', function(clickEvent) {
					popups.goodsitem.show(clickEvent);
				})
				.on('clicked:goods-catalog', function(clickEvent) {
					popups.goodsitem.show(clickEvent);
					// TODO: implement scrollTo
					//scroll.scrollTo("#goods-catalog");
				});
		}
	};

	ns.BasikApp = BasikApp;

}(window.basik || window, jQuery));