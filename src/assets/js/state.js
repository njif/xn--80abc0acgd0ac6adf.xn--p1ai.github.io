;(function (ns) {

	var Mediator = function (owner, eventList) {
		this._owner = owner;
		this._callbacks = {};
		this._eventList = eventList;
	};

	Mediator.prototype = {
		on: function (owner, eventName, callback) {
			if (owner != this._owner)
				return;
			if (!this._callbacks[eventName])
				this._callbacks[eventName] = [];
			ns.jstools.subscribe(this, this._callbacks[eventName], callback); 
		},

		publish: function (owner, eventName, eventObject) {
			var eventName = this._eventList[eventName];
			if (owner != this._owner || !this._callbacks[eventName])
				return;
			ns.jstools.publish(this._callbacks[eventName], eventObject);
		}		
	}

	var AppState = function (eventList) {

		this._mediator = new Mediator(this, eventList);
	};

	AppState.prototype = {
		on: function (eventName, callback) {
			this._mediator.on(this, eventName, callback);
			return this;
		},
		raise: function (eventName, eventObject) {
			this._mediator.publish(this, eventName, eventObject);
			return this;
		}
	};

	ns.AppState = AppState;

}(window.basik || window));