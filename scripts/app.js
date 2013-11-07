/**
 * User: Troy
 * Date: 05/14/13
 * Time: 5:30 AM
 */

var RocknCoder = RocknCoder || {};

(function () {
    "use strict";

    RocknCoder.Pages = RocknCoder.Pages || {};
    RocknCoder.States = {
        Splash: 0,
        Attract: 1,
        Play: 2,
        Paused: 3,
        Scores: 4,
        Credits: 5
    };
    RocknCoder.CurrentState = RocknCoder.States.Splash;
    RocknCoder.CurrentLevel = 0;

	/* put the page events into one string */
	var Events = "pagebeforeshow pageshow pagebeforechange pagechange pagebeforehide pagehide",
		/* the kernel remains unchanged */
		Kernel = function (event) {
			var that = this,
				eventType = event.type,
				pageName = $(this).attr("data-rnc-jspage");
			if (RocknCoder && RocknCoder.Pages && pageName && RocknCoder.Pages[pageName] && RocknCoder.Pages[pageName][eventType]) {
				RocknCoder.Pages[pageName][eventType].call(that);
			}
		};

	/* anonymous function which binds to the page's events */
	(function () {
		$("div[data-rnc-jspage]").on(Events, Kernel);
	}());

	/* anonymous function which binds to the document's pageload event */
	(function () {
		$(document).bind(
			'pageload',
			function (event, obj) {
				console.log("pageload");
				$("div[data-rnc-jspage]")
					/* to make sure we aren't double hooking events clear them all */
					.off(Events)
					/* then hook them all  (the newly loaded page is in DOM at this point) */
					.on(Events, Kernel);
			}
		);
	}());

	/* size the content area */
	RocknCoder.Dimensions = (function () {
		return {
			get: function () {
//        isIPhone = false, (/iphone/gi).test(navigator.appVersion),
        var isFirstPass = false,
          isIPhone = false,
          width = $(window).width(),
          height = $(window).height() + (isIPhone ?  60 : 0),
          hHeight = $('header').outerHeight(),
          fHeight = $('footer').outerHeight();
        return {
          width: width,
          height: height - hHeight - fHeight
        };
      }
		};
	}());
}());