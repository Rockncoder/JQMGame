/**
 * User: Troy
 * Date: 10/11/12
 * Time: 5:58 AM
 */

var RocknCoder = RocknCoder || {};

(function () {
    "use strict";

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
            intervalId,
            context = canvas.getContext("2d"),
            fastMatrix = [];

        /* if anything flips this bit to false, the level is considered done */
        RocknCoder.Game.playing = true;
        RocknCoder.InitNPCs(RocknCoder.Game.level);
        RocknCoder.InitPlayer(RocknCoder.Game.level);

        /* this is the actual game loop */
        intervalId = setInterval(function() {
            var len, ndx, sm, sprite;
            /* clear the canvas */
            canvas.width = canvas.width;
            fastMatrix = [];
            fastMatrix.push(null);

            /* draw all of the sprites */
            for(sm in RocknCoder.SpriteMap) {
                sprite = RocknCoder.SpriteMap[sm];
                if(typeof sprite === 'object') {
                    sprite.draw(context, spriteImg);
                    /* a killed sprite won't be used in collision detection */
                    if(!sprite.killed) {
                        fastMatrix.push(sprite);
                    }
                }
            }

            /* collision detection */
            for(ndx = fastMatrix.length; ndx; ndx -= 1) {
                sprite = fastMatrix[ndx];
                switch(sprite.type) {
                    case RocknCoder.SpriteTypes.PLAYER:
                       break;
                    case RocknCoder.SpriteTypes.NPC:
                       break;
                }
            }

            /* have we stopped playing? */
            if(!RocknCoder.Game.playing) {
                /* stop the timer */
                clearInterval(intervalId);
                /* if the player still has lives, he won the level */
                if(RocknCoder.Game.lives) {

                } else {

                }
            }
        }, 33);
    });

    RocknCoder.InitNPCs = (function (gameLevel) {
        var i, move, ndx, npcName, x, y,
            lvl = RocknCoder.Levels[gameLevel],
            moves = {
                none: null,
                flyDown: function (sprite) {
                    sprite.yPos += 5;
                    if(sprite.yPos >= RocknCoder.Game.dims.height){ sprite.yPos = -sprite.height;}
                },
                spinAround: function (sprite) {
                    sprite.rotate += (360/60);
                    if(sprite.rotate >= 360){ sprite.rotate = 0;}
                }
            };

        for(ndx = lvl.npcs.length; ndx; ndx -= 1) {
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
            xPos = Math.floor((RocknCoder.Game.dims.width  / 2) - 32),
            yPos = Math.floor(RocknCoder.Game.dims.height - 64 + 2),
            xTarget = xPos,
            player = null,
            moves = {
                toNewPosition: function (sprite) {
                    var currXPos = sprite.xPos,
                        diff = Math.abs(xTarget - currXPos) < 10? 1: 3;
                    if(currXPos > xTarget) {
                        currXPos -= diff;
                    } else if (currXPos < xTarget) {
                        currXPos += diff;
                    }
                    sprite.xPos = currXPos;
                },
                flyBullet: function (sprite) {
                    sprite.yPos -= 5;
                    if(sprite.yPos < 0) {
                        /* remove the bullet */
                        delete RocknCoder.SpriteMap[sprite.data];
                        bullet--;
                    }
                }
            };

        RocknCoder.SpriteMap.gunShip = new Sprite(RocknCoder.SpriteTypes.PLAYER, 5, 401, 64, 64, xPos, yPos, 0, moves.toNewPosition, null);
        player = RocknCoder.SpriteMap.gunShip;

        /* the game is playable by touch or mouse */
        $(window).on('click touchstart ', function(event){
            var bulletName = "playerBullet" + bullet,
                x = event.pageX,
                y = event.pageY;

            if(event.type === 'touchstart') {
                x = event.originalEvent.touches[0].pageX;
                y = event.originalEvent.touches[0].pageY;
            }

            if(y > player.yPos) {
                xTarget = x;
            } else {
                /* shoot */
                RocknCoder.SpriteMap[bulletName] = new Sprite(RocknCoder.SpriteTypes.PLAYER_BULLET, 4, 202, 32, 32, player.xPos + player.halfWidth - 16, player.yPos, 0, moves.flyBullet, bulletName);
                bullet++;
            }
        });
    });

    RocknCoder.Levels = {
        0: {
            npcs: [
                [50, 50, "flyDown"],
                [100, 50, "spinAround"],
                [150, 50, "none"]
            ]
        },
        1: {
            npcs: [
                [50, 50, "spinAround"],
                [100, 50, "flyDown"],
                [150, 50, "spinAround"]
            ]
        }
    };
}());

