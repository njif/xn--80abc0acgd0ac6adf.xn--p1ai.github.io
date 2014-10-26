;(function (ns, $) {

	var Add2Cart = function(holder, state, events) {

		this._holder = holder;
		this._state = state;
		this._events = events;

		this._init();
	};

	Add2Cart.prototype = {

		_init: function() {

			
			this._initState();
		},

		_stateInit: function() {

			var state = this._state,
				holder = this._holder,
				events = this._events,
				key, ev;

			for (key in events) {
				if (!events.hasOwnProperty(key)) 
					continue;
				ev = (function() { return events[key]; })();
				holder.on(key, function(e) {
					e.preventDefault();
					state.raise(ev);
				});
			}
		}
	};

	ns.Add2Cart = Add2Cart;

}(window.basik || window, jQuery));