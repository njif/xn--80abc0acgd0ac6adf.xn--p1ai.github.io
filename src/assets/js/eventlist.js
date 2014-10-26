;(function (ns) {

	ns.eventList = {

		// Control raise this event			======>		// Mediator publish this event
														// and AppState do something only if subscribed to this event
		'buttons.goods_catalog.clicked': 				'clicked:goods-catalog',
		'buttons.goods_item.clicked': 					'clicked:goods-item',

		'buttons.catalog_cart.clicked': 				'clicked:catalog_cart',

		'order.item.added': 							'added:order-item',
		'order.item.removed': 							'removed:order-item',
	};

}(window.basik || window));
