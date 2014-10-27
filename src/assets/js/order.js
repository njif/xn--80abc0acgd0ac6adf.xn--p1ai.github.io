;(function (ns, $) {

	var Order = function(state, events) {
		this._state = state;
		this._events = events;
		this._items = [];
		this._hash = {};
	};

	Order.prototype = {

		count: function() {

			var count = 0;

			_.each(this._items, function(item){

				count += (item.count === undefined ? 1 : item.count);
			});
			
			return count;
		},

		items: function() {
			
			return this._items;
		},

		add: function(orderItem) {

			var alias = orderItem.alias;
			var size = orderItem.size;
			var storedItem = this._hash[alias + size];

			if (storedItem)
				this._changeCount(storedItem);
			else
				this._pushNewItem(orderItem);			

			if (this._events.added)
				this._state.raise(this._events.added);
			return this;
		},

		remove: function() {

			if (this._events.removed)
				this._state.raise(this._events.removed);
			return this;
		},

		_changeCount: function(storedItem) {

			var currentCount = storedItem.count || 0;
			storedItem.count = currentCount + 1
		},

		_pushNewItem: function(newItem) {

			newItem = $.extend({}, newItem, { count: 1 }); // created copy!

			var size = newItem.size || 0;

			var currentVariant = _.find(newItem.variations, function(variant){ return variant.size === size; });

			_.each(currentVariant, function(value, key){ newItem[key] = value; });

			delete newItem.variations;

			this._items.push(newItem);

			var alias = newItem.alias;
			var index = this._items.length - 1;

			this._hash[alias + size] = this._items[index];
		}
	};

	ns.Order = Order;

}(window.basik || window, jQuery));