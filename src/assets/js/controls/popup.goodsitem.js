;(function (ns, $) {
	/*jshint multistr: true */
	var htmlTemlate = '\
		<div class="popup__wrapper">\
			<form class="popup popup__requestcallback" role="form">\
				<h2>Заказать обратный звонок</h2>\
				<div class="form-group">\
					<div class="form__field">\
						<label for="fio">ФИО</label>\
						<input type="text" name="fio" class="cc_fio form__input" required>\
					</div>\
					<div class="form__field">\
						<label for="phone">Телефон</label>\
						<input type="phone" name="phone" class="cc_phone form__input" required>\
					</div>\
					<p class="cc_message"></p>\
				</div>\
					<input type="submit" class="btn btn-warning btn-lg cc_button_goods_catalog" value="Отправить">\
				</form>\
		</div>';
	/*jshint multistr: false */

	var defaults = {
		fioText: "ФИО",
		phoneText: "Телефон"
	};

	var Popup = function (holder, config) {
		this._holder = holder;
		this._config = $.extend({}, defaults, config);
		this._controls = { fio: null, phone: null, message: null, button: null };
		this._popup = null;
		this._init();

	};

	Popup.prototype = {

		show: function(event) {
			this._popup.addClass('visible_popup');
		},

		hide: function(event) {
			this._popup.removeClass('visible_popup');
			this._controls.fio.val('');
			this._controls.phone.val('');
		},

		_init: function() {
			this._createHtml();
			this._initControls();
		},

		_createHtml: function() {
			this._popup = $(htmlTemlate);
			this._holder.html(this._popup);
		},

		_initControls: function() {

			this._popup.on('click', $.proxy(this._popupClick, this));

			var inputs = this._holder.find('input');
			this._controls.fio = inputs.filter('.cc_fio');
			this._controls.phone = inputs.filter('.cc_phone').on('click', $.proxy(this._onSubmit, this));		
			this._controls.message = this._holder.find('.cc_message');		
			this._controls.submit = inputs.filter('[type=submit]').on('click', $.proxy(this._submit, this));		
		},

		_popupClick: function(e) {
			if (!$(e.target).hasClass('popup__wrapper'))
				return;
			this.hide();
		},

		_submit: function() {
			if (this._controls.fio.val() === '' || this._controls.phone.val() === '')
				return;
			this.hide();
		}
	};

	ns.PopupGoodsItem = Popup;

}(window.basik || window, jQuery));