;(function (ns, $) {

	var Order = function(state, events) {
		this._state = state;
		this._events = events;
		this._items = [];
	};

	Order.prototype = {

		count: function() {
			
			return this._items.length;
		},

		add: function(item) {

			this._items.push(item);

			if (this._events.added)
				this._state.raise(this._events.added);
			return this;
		},

		remove: function() {

			if (this._events.removed)
				this._state.raise(this._events.removed);
			return this;
		}
	};

	ns.Order = Order;

}(window.basik || window, jQuery));