;(function (ns, $) {

	var Order = function(state, events) {
		this._state = state;
		this._events = events;
		this._items = [];
		this._hash = {};

		this._contacts = { name: "", phone: "", email: "" };
	};

	Order.prototype = {

		toJson: function() {

			return $.extend({}, { items: this._items }, { contacts: this._contacts });
		},

		clear: function() {

			this._items = [];
			this._hash = {};
			// this._contacts = { name: "", phone: "", email: "" };

			if (this._events.changed)
				this._state.raise(this._events.changed);
		},

		count: function() {

			var count = 0;

			_.each(this._items, function(item){

				count += (item.count === undefined ? 1 : item.count * 1); // true convert to int
			});
			
			return count;
		},

		contacts: function(contacts) {

			if (contacts)
			{
				this._contacts = $.extend(this._contacts, contacts);
				return this;
			}

			return $.extend({}, this._contacts);
		},

		items: function() {
			
			return this._items;
		},

		setItemCount: function(alias, size, count) {

			var storedItem = this._hash[alias + size];

			if (!storedItem)
				return;

			storedItem.count = count * 1; 					// true convert to int

			if (this._events.changed)
				this._state.raise(this._events.changed);
		},

		add: function(orderItem) {

			var alias = orderItem.alias;
			var size = orderItem.size;
			var storedItem = this._hash[alias + size];

			if (storedItem)
				this._changeCount(storedItem);
			else
				this._pushNewItem(orderItem);			

			if (this._events.changed)
				this._state.raise(this._events.changed);
			return this;
		},

		remove: function() {

			if (this._events.changed)
				this._state.raise(this._events.changed);
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