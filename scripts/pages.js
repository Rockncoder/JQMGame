
var RocknCoder = RocknCoder || {};

(function () {
	"use strict";

	RocknCoder.Pages = RocknCoder.Pages || {};

	RocknCoder.Pages.splash = (function () {
		var pageshow = function () {
                RocknCoder.Game.dims = RocknCoder.Dimensions.get();
                setTimeout(function(){
                    $.mobile.changePage("#attract");
                }, 3000);
			},
			pagehide = function () {
			};
		return {
			pageshow: pageshow,
			pagehide: pagehide
		};
	}());

	RocknCoder.Pages.attract = (function () {
		var pageshow = function () {
                var dim = RocknCoder.Dimensions.get(),
                    msg = "Width = " + dim.width + ", Height = " + dim.height;
                $("#msg").text(msg);
			},
			pagehide = function () {
			};
		return {
			pageshow: pageshow,
			pagehide: pagehide
		};
	}());

    /* An info page displays some info and the user must tap a button to return to the attract page */
    RocknCoder.Pages.info = (function () {
        var pageshow = function () {
            },
            pagehide = function () {
            };
        return {
            pageshow: pageshow,
            pagehide: pagehide
        };
    }());

    RocknCoder.Pages.play = (function () {
        var pageshow = function () {
                var $grid = $('#grid'),
                    grid = $grid.get(0);

                /* adjust the size of the canvas grid */
                RocknCoder.Game.dims = RocknCoder.Dimensions.get();
                $grid.attr({
                    width: RocknCoder.Game.dims.width - 2,
                    height: RocknCoder.Game.dims.height - 2
                });

                /* load the spriteSheet into memory */
                RocknCoder.Game.spriteSheet = new Image();
                RocknCoder.Game.spriteSheet.src = "1945.png";
                RocknCoder.Game.spriteSheet.onload = function() {
                    RocknCoder.GameLoop(grid);
                };
            },
            pagebeforeshow = function() {
            },
            pagehide = function () {
                RocknCoder.Game.spriteSheet = null;
                if(RocknCoder.IntervalId){ clearInterval(RocknCoder.IntervalId);}
           };
        return {
            pageshow: pageshow,
            pagebeforeshow: pagebeforeshow,
            pagehide: pagehide
        };
    }());
}());

