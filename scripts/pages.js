/**
 * User: Troy
 * Date: 05/14/13
 * Time: 5:30 AM
 */

var RocknCoder = RocknCoder || {};

(function () {
  "use strict";

  RocknCoder.Pages = RocknCoder.Pages || {};

  RocknCoder.Pages.splash = (function () {
    return {
      pageshow: function () {
        // create our deferred objects
        // the Ajax get methods return deferred objects
        var timerReady = $.Deferred(),
          spriteMapReady = $.get("1945.png"),
          musicReady = $.get("DST-Afternoon.mp3");

        // put our load screen up
        $.mobile.loading( 'show', {
          text: "Loading resources...",
          textVisible: true,
          theme: "a"
        });

        // our timer simply waits until it times out, then sets timerReady to resolve
        setTimeout(function () {
          timerReady.resolve();
        }, 3000);

        // once all of my deferred objects have resolved, change the page
        $.when(timerReady, spriteMapReady, musicReady)
          .done(function (timerResponse, spriteMapResponse, musicResponse) {
            // let's put the data in our global
            RocknCoder.Resources = RocknCoder.Resources || {};
            RocknCoder.Resources.spriteMap = spriteMapResponse[0];
            RocknCoder.Resources.music = musicResponse[0];
          })
          // here you would check to find out what failed
          .fail(function () {
            console.log("An ERROR Occurred")
          })
          // the always method runs whether or not there were errors
          .always(function() {
            $.mobile.loading( "hide" );
            $.mobile.changePage("#attract");
          });
      },
      pagehide: function () {
      }
    };
  }());

  RocknCoder.Pages.attract = (function () {
    return {
      pageshow: function () {
        var dim = RocknCoder.Dimensions.get(),
          msg = "Width = " + dim.width + ", Height = " + dim.height;
        $("#msg").text(msg);
      },
      pagehide: function () {
      }
    };
  }());

}());

