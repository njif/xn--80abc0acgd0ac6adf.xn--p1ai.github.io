;(function (ns, $) {

	/* --- Variables --- */

	var jbody, jheader,
		screen = 0,
		container = $('.maincontent'),
		pages = $('.page__section'),
		inscroll = false,
		touchStartY = 0,
		timer = null;

	/* --- Helper functions --- */

	var isSwipeDown = function (event) {
		if (!event)
			return false;
		if (event.deltaY != null)
			return event.deltaY < 0;
		if (event.originalEvent && event.originalEvent.touches)
		{
			var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			var pageY = touch.pageY;
			touch.pageY = 0;
			return pageY - touchStartY;
		}
		return false;
	};

	var checkInScroll = function() {
		if (inscroll)
			return true;

		inscroll = true;
		setTimeout(function(){
			inscroll = false;
		}, 1300);
	};

	var setCurrentScreen = function(event) {

		var activePage = pages.filter('.active');
		if (isSwipeDown(event)) {

			if (activePage.siblings('.page__section').length > 0) {
				screen++;
				//jheader.addClass('small');
			}

		} else {

			if (activePage.prev('.page__section').length > 0) {
				screen--;
			}
			
			if (screen === 0) {
				//jheader.removeClass('small');
			}
		}

		pages.eq(screen).addClass('active').siblings().removeClass('active');
	};

	/* --- Setup --- */

	jbody = $('body');
	jheader = jbody.find('.maincontent:eq(0)');

	jbody.addClass('js-page-scroll');


	$('.page__section:eq(0)').addClass('active');

	/* --- Attach events --- */

	jbody.on('touchstart', function(event) {
		var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
		touchStartY = touch.pageY;
	}).on('mousewheel touchmove', function(event) {
		if (checkInScroll())
			return;
		setCurrentScreen(event);

		var position = (-screen * 100) + '%';
		container.css('top', position);
	});

}(window.basik || window, jQuery));

