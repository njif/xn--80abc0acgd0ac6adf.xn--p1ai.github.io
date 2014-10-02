;(function (ns) {

	ns.eventList = {

		// Control raise this event			======>		// Mediator publish this event
														// and AppState do something only if subscribed to this event
		'buttons.goods_catalog.clicked': 				'clicked:goods-catalog',
		'buttons.goods_item.clicked': 					'clicked:goods-item'
	};

}(window.basik || window));
