/**
 * User: Troy
 * Date: 10/11/12
 * Time: 5:58 AM
 */

var RocknCoder = RocknCoder || {};

(function () {
  "use strict";

  RocknCoder.IntervalId = null;
  /* holds all of the sprites to be displayed on the screen */
  RocknCoder.SpriteMap = {};
  /* holds all of the important game variables */
  RocknCoder.Game = {
    level: 0,
    lives: 3,
    playing: true,
    spriteSheet: null,
    dims: {}
  };

  RocknCoder.SpriteTypes = {
    PLAYER: 0,
    NPC: 1,
    PLAYER_BULLET: 2,
    NPC_BULLET: 3
  };

  RocknCoder.GameLoop = (function (canvas) {
    var spriteImg = RocknCoder.Game.spriteSheet,
      init = true,
      context = canvas.getContext("2d"),
      fastMatrix = [],
      calcRect = function (sprite) {
        var rect = {};
        rect.top = sprite.yPos;
        rect.bottom = sprite.yPos + sprite.height;
        rect.left = sprite.xPos;
        rect.right = sprite.xPos + sprite.width;
        return rect;
      },
      shrinkRectangle = function (rect) {
        var shrink = 10;
        rect.top += shrink;
        rect.left += shrink;
        rect.right -= shrink;
        rect.bottom -= shrink;
        return rect;
      },
      rectanglesCollide = function (rect1, rect2) {
        return !(rect1.bottom < rect2.top ||
          rect1.top > rect2.bottom ||
          rect1.left > rect2.right ||
          rect1.right < rect2.left);
      };

    /* if anything flips this bit to false, the level is considered done */
    RocknCoder.Game.level = 0;
    RocknCoder.Game.lives = 3;
    RocknCoder.Game.playing = true;
    RocknCoder.InitExplosion();

    /* this is the actual game loop */
    RocknCoder.IntervalId = setInterval(function () {
      var ndx, inner, sm, sprite, sprite2, rect1, rect2;
      /* clears the canvas */
      canvas.width = canvas.width;
      fastMatrix = [];
      if (init) {
        init = false;
        RocknCoder.SpriteMap = {};
        RocknCoder.Game.enemies = RocknCoder.Levels[RocknCoder.Game.level].npcs.length;
        RocknCoder.InitNPCs(RocknCoder.Game.level);
        RocknCoder.InitPlayer(RocknCoder.Game.level);
      }

      /* draw all of the sprites */
      for (sm in RocknCoder.SpriteMap) {
        sprite = RocknCoder.SpriteMap[sm];
        if (typeof sprite === 'object') {
          sprite.draw(context, spriteImg);
          /* a killed sprite won't be used in collision detection */
          if (!sprite.killed) {
            fastMatrix.push(sprite);
          }
        }
      }

      /* collision detection */
      for (ndx = fastMatrix.length; ndx; ndx -= 1) {
        sprite = fastMatrix[ndx - 1];
        rect1 = shrinkRectangle(calcRect(sprite));

        switch (sprite.type) {
          case RocknCoder.SpriteTypes.PLAYER:
            for (inner = fastMatrix.length; inner; inner -= 1) {
              sprite2 = fastMatrix[inner - 1];

              if (sprite2.type === RocknCoder.SpriteTypes.NPC || sprite2.type === RocknCoder.SpriteTypes.NPC_BULLET) {
                rect2 = shrinkRectangle(calcRect(sprite2));
                if (rectanglesCollide(rect1, rect2)) {
                  sprite.killed = true;
                  break;
                }
              }
            }
            break;
          case RocknCoder.SpriteTypes.NPC:
            for (inner = fastMatrix.length; inner; inner -= 1) {
              sprite2 = fastMatrix[inner - 1];

              if (sprite2.type === RocknCoder.SpriteTypes.PLAYER_BULLET && !sprite2.killed) {
                rect2 = calcRect(sprite2);
                if (rectanglesCollide(rect1, rect2)) {
                  sprite.killed = true;
                  sprite2.killed = true;
                  break;
                }
              }
            }
            break;
        }
      }

      /* have we stopped playing? */
      if (!RocknCoder.Game.playing) {
        /* if the player still has lives, he won the level */
        if (RocknCoder.Game.lives) {
          RocknCoder.Game.playing = true;
          RocknCoder.Game.level += 1;
          init = true;
        } else {
          /* stop the timer */
          clearInterval(RocknCoder.IntervalId);
          RocknCoder.IntervalId = null;
          $.mobile.changePage("#attract");
        }
      }
    }, 33);
  });

  RocknCoder.InitNPCs = (function (gameLevel) {
    var i, move, ndx, npcName, x, y,
      lvl = RocknCoder.Levels[gameLevel],
      explodeMe = function (sprite) {
        var map;
        sprite.count += 1;
        if (sprite.count === 7) {
          delete RocknCoder.SpriteMap[sprite.data];
          RocknCoder.Game.enemies -= 1;
          if (!RocknCoder.Game.enemies) {
            RocknCoder.Game.playing = false;
          }
        } else {
          map = RocknCoder.Explosion.map[sprite.count];
          sprite.xSprite = map[0];
          sprite.ySprite = map[1];
        }
      },
      killMe = function (sprite) {
        if (sprite.killed) {
          sprite.count = 0;
          sprite.moveFunc = explodeMe;
        }
      },
      moves = {
        none: null,
        doNothing: function (sprite) {
          killMe(sprite);
        },
        flyDown: function (sprite) {
          sprite.yPos += 5;
          if (sprite.yPos >= RocknCoder.Game.dims.height) {
            sprite.yPos = -sprite.height;
          }
          killMe(sprite);
        },
        spinAround: function (sprite) {
          sprite.rotate += (360 / 60);
          if (sprite.rotate >= 360) {
            sprite.rotate = 0;
          }
          killMe(sprite);
        }
      };

    for (ndx = lvl.npcs.length; ndx; ndx -= 1) {
      i = ndx - 1;
      npcName = "npc" + ndx;
      x = lvl.npcs[i][0];
      y = lvl.npcs[i][1];
      move = lvl.npcs[i][2];
      RocknCoder.SpriteMap[npcName] = new Sprite(RocknCoder.SpriteTypes.NPC, 269, 400, 64, 64, x, y, 180, moves[move], npcName);
    }
  });

  RocknCoder.InitPlayer = (function (gameLevel) {
    var bullet = 0,
      xPos = Math.floor((RocknCoder.Game.dims.width / 2) - 32),
      yPos = Math.floor(RocknCoder.Game.dims.height - 64 + 2),
      xTarget = xPos,
      player = null,
      explodeMe = function (sprite) {
        var map;
        sprite.count += 1;
        if (sprite.count === 7) {
          RocknCoder.Game.lives--;
          if (RocknCoder.Game.lives) {
            sprite.killed = false;
            sprite.moveFunc = moves.toNewPosition;
            sprite.xSprite = 5;
            sprite.ySprite = 401;
            sprite.xPos = xTarget = Math.floor((RocknCoder.Game.dims.width / 2) - 32);
          } else {
            RocknCoder.Game.playing = false;
          }
        } else {
          map = RocknCoder.Explosion.map[sprite.count];
          sprite.xSprite = map[0];
          sprite.ySprite = map[1];
        }
      },
      killMe = function (sprite) {
        if (sprite.killed) {
          sprite.count = 0;
          sprite.moveFunc = explodeMe;
        }
      },
      moves = {
        toNewPosition: function (sprite) {
          var currXPos = sprite.xPos,
            diff = Math.abs(xTarget - currXPos) < 10 ? 1 : 3;
          if (currXPos > xTarget) {
            currXPos -= diff;
          } else if (currXPos < xTarget) {
            currXPos += diff;
          }
          sprite.xPos = currXPos;
          killMe(sprite);
        },
        flyBullet: function (sprite) {
          sprite.yPos -= 5;
          if (sprite.yPos < 0 || sprite.killed) {
            /* remove the bullet */
            delete RocknCoder.SpriteMap[sprite.data];
            bullet--;
          }
        }
      };

    RocknCoder.SpriteMap.gunShip = new Sprite(RocknCoder.SpriteTypes.PLAYER, 5, 401, 64, 64, xPos, yPos, 0, moves.toNewPosition, null);
    player = RocknCoder.SpriteMap.gunShip;

    /*
    *  the game is playable by touch or mouse
    *  we clear the event first to ensure that we are double handling it
    *
    * */
    $(window).off('click touchstart').on('click touchstart', function (event) {
      var bulletName = "playerBullet" + bullet,
        x = event.pageX,
        y = event.pageY;
      event.preventDefault();

      if (event.type === 'touchstart') {
        x = event.originalEvent.touches[0].pageX;
        y = event.originalEvent.touches[0].pageY;
      }

      if (y > player.yPos) {
        xTarget = x;
      } else {
        /* shoot */
        RocknCoder.SpriteMap[bulletName] = new Sprite(RocknCoder.SpriteTypes.PLAYER_BULLET,
          4, 202, 32, 32,
          player.xPos + player.halfWidth - 16,
          player.yPos, 0,
          moves.flyBullet,
          bulletName);
        bullet++;
      }
    });
  });

  RocknCoder.InitExplosion = (function () {
    RocknCoder.Explosion = {
      width: 66,
      height: 66,
      map: [
        [  4, 302],
        [ 72, 302],
        [136, 302],
        [202, 302],
        [268, 302],
        [334, 302],
        [400, 302]
      ]
    };
  });

  RocknCoder.Levels = {
    0: {
      npcs: [
        [50, 50, "flyDown"],
        [250, 50, "flyDown"],
        [100, 50, "spinAround"],
        [150, 50, "doNothing"]
      ]
    },
    1: {
      npcs: [
        [50, 50, "flyDown"],
        [100, 50, "spinAround"],
        [150, 50, "flyDown"]
      ]
    }
  };
}());

