;(function (ns, Handlebars) {

	// PUBLIC API:

	var templaterApi = {
		init: init,
		fillCatalog: fillCatalog,
		fillModalCart: fillModalCart
	};

	function init(instanceOptions) {

		var instance = getInstance(instanceOptions);
		instance.init(); 
		return templaterApi;
	}

	function fillCatalog(data) {

		var instance = getInstance();
		var html = instance.fillCatalog(data); 
		return html;
	}

	function fillModalCart(data) {

		var instance = getInstance();
		var html = instance.fillModalCart(data); 
		return html;
	}

	// =============================
	// PRIVATE:

	function getInstance(options) {

		if (!templaterInstance)		
			templaterInstance = new Templater(options || {});
			
		getInstance = function() { return templaterInstance; };
		return templaterInstance;
	}

	var templaterInstance = null;

	var defaults = {

		templateIds: {
			catalog: '#goods-catalog__items',
			modalCart: '#modal__cart'
		}
	}

	var Templater = function(options) {

		this._config = $.extend({}, defaults, options);

		this._compiled = {};
		this._isHelperRegistered = false;
	}

	Templater.prototype = {

		fillCatalog: function(data) {

			var templateIds = this._config.templateIds.catalog;
			return this._fillTemplate(templateIds, data);
		},

		fillModalCart: function(data) {

			var templateIds = this._config.templateIds.modalCart;
			return this._fillTemplate(templateIds, data);
		},

		init: function(){

			this._registerHelpers();
			return this;
		},

		_fillTemplate: function(sourceId, data) {

			var template = this._compiled[sourceId];

			if (template)
				return (template(data));

			var source = $(sourceId).html();
			var template = Handlebars.compile(source);

			this._compiled[sourceId] = template;
			return template(data);
		},

		_registerHelpers: function() {
				
			if (this._isHelperRegistered)
				return;

			Handlebars.registerHelper('min', $.proxy(this._minHelper, this));
			Handlebars.registerHelper('list', $.proxy(this._listHelper, this));

			this._isHelperRegistered = true;
		},

		_minHelper: function(arr, prop) {

			if (arr == null || arr.length === 0)
				return null;
			var min = arr[0][prop];
			for (var i = 1; i < arr.length; i++)
				if (arr[i].prop < min)
					min = arr[i][prop];
			return min;				
		},

		_listHelper: function(items, options) {

			var retval = "<ul>";
			var i, length = items.length;

			for (i = 0; i < length; i++) {
				retval += "<li>" + options.fn(items[i]) + "</li>";
			}

			return retval + "</ul>";
		}
	}

	ns.templater = templaterApi;

}(window.basik || window, Handlebars));