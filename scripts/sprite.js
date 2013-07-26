/**
 * User: Troy
 * Date: 10/10/12
 * Time: 10:48 PM
 */

/* never call this function directly, it is a constructor for sprites, use it with new */
function Sprite(type, xSprite, ySprite, width, height, xPos, yPos, rotate, moveFunc, data) {
  /* the type of sprite */
  this.type = type;
  /* where the image is in the sprite sheet */
  this.xSprite = xSprite;
  this.ySprite = ySprite;
  /* the width and height of the image */
  this.width = width;
  this.height = height;
  /* initial screen position of the image */
  this.xPos = xPos;
  this.yPos = yPos;
  /* the rotation in degrees */
  this.rotate = rotate;
  /* function to call to handle moving this sprite */
  this.moveFunc = moveFunc;
  /*  this is any old player data */
  this.data = data;
  /* since we need this calculation a lot lets just do it once here */
  this.halfWidth = width / 2;
  this.halfHeight = height / 2;
  /* if the sprite has been killed */
  this.killed = false;
}

Sprite.prototype.draw = function (context, obj) {
  context.save();

  /* if the sprite has a move function, call it */
  if (this.moveFunc) {
    this.moveFunc(this);
  }
  /* move the world origin to the center of the sprite */
  context.translate(this.xPos + this.halfWidth, this.yPos + this.halfHeight);

  /* convert from degrees to radians, and rotate */
  context.rotate(this.rotate * 0.0174532925199432957);

  context.drawImage(obj, this.xSprite, this.ySprite, this.width, this.height, -this.halfWidth, -this.halfHeight, this.width, this.height);
  context.restore();
}