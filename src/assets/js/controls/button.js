;(function (ns, $) {

	var PageButton = function(holder, state, events) {
		this._holder = holder;
		this._state = state;
		this._events = events;

		this._init();
	};

	PageButton.prototype = {

		_init: function() {

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

	ns.PageButton = PageButton;

}(window.basik || window, jQuery));