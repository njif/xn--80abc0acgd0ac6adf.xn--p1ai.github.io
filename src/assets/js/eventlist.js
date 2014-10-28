;(function (ns) {

	ns.eventList = {

		// Control raise this event			======>		// Mediator publish this event
														// and AppState do something only if subscribed to this event
		'buttons.goods_catalog.clicked': 				'clicked:goods-catalog',
		'buttons.goods_item.clicked': 					'clicked:goods-item',

		'buttons.catalog_cart.clicked': 				'clicked:catalog_cart',

		'buttons.header_cart.clicked': 					'clicked:header_cart',

		'order.item.changed': 							'changed:order-item',
		
		'cart.item-count.changed': 						'changed:cart-item-count',
		'cart.contact.changed': 						'changed:cart-contact',

		'cart.form.submited': 							'submited:cart-form'
	};

}(window.basik || window));
