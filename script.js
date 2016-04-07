$(function () {
	/* INITIALIZATION OF CANVAS */
  // initialize canvas element
  var canvas = $("canvas");
  var ctx = canvas[0].getContext("2d");
  var width = canvas.attr("width");
  var height = canvas.attr("height");
  // initalize default colors
	var colors = {
		"background": "#56bafd",
    "floor_dark": "#27ae60",
    "floor_light": "#2ecc71",
    "stroke": "black",
    "text": "white",
    "button": "#34495e",
    "button_active": "#2c3e50",
    "bird": "#e74c3c",
    "beak": "#f1c40f",
    "pole": "#9b59b6"
	};
  // initialize name and font
  var font = "sigmar one";
  var title = "Flappy";
  // clouds and poles
  var clouds = [];
  var poles = [];
  var poleWidth = 50;
  // start screen variables
  var started = false;
  var once = false;
  var button_active = false;
  // game over variables
  var firstGameOver = false;
  var restartButton_active = false;
  var gameOverRunning = false;
  // gameplay variables
  var altitude = height/2;
  var radius = 20;
  var dropBy = -7;
  var gravity = 0.3;
  var wing = 0;
  var score = 0;
  var interval = -1;
  var iteration = 0;
  // functions
  var roundedRect, clear, Region, getScore, drawClouds, startScreen, init, gameOver;

	// ACCESSORIES (drawing functions)
  // draw a rounded rectangle
  roundedRect = function(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x+radius, y);
    ctx.lineTo(x+width-radius, y);
    ctx.quadraticCurveTo(x+width, y, x+width, y+radius);
    ctx.lineTo(x+width, y+height-radius);
    ctx.quadraticCurveTo(x+width, y+height, x+width-radius, y+height);
    ctx.lineTo(x+radius, y+height);
    ctx.quadraticCurveTo(x, y+height, x, y+height-radius);
    ctx.lineTo(x, y+radius);
    ctx.quadraticCurveTo(x, y, x+radius, y);
    ctx.closePath();
  };
  // clear the background
  clear = function() {
  	ctx.fillStyle = colors.background;
  	ctx.fillRect(0, 0, width, height-50);
  };
  getScore = function() {
  	var formatted = (Math.floor(score)/10).toString();
    if(formatted.substring(formatted.length-2, formatted.length-1) != ".")
    	formatted += ".0";
    return formatted;
  };

  /* HIT AREA CAPABILITY */
  // Region class for hit regions
  Region = function(x, y, width, height) {
    var regionElem = this;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.onClick = function(callback) {
      canvas.click(function() {
        var mouseX = event.pageX - canvas.offset().left;
        var mouseY = event.pageY - canvas.offset().top;
        if(mouseX >= regionElem.x && mouseX <= regionElem.x+width && mouseY >= regionElem.y && mouseY <= regionElem.y+height)
          callback();
      });
      return this;
    };
    this.onHover = function(enterCallback, exitCallback) {
      canvas.mousemove(function() {
        var mouseX = event.pageX - canvas.offset().left;
        var mouseY = event.pageY - canvas.offset().top;
        if(mouseX >= regionElem.x && mouseX <= regionElem.x+width && mouseY >= regionElem.y && mouseY <= regionElem.y+height) {
          canvas.css("cursor", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABFElEQVQ4T2N88+HjfwYw+P+AgYmpQYSPbyGETx5gRBgIM4AygxnfvP/wgIGRUf7IiXMMKopyDBLiIlCTyTMYaOCnBAbG//Ofv3zNEJlawuDhZMuQEBlAtsGMIOfAXNkxYQ7Djn2HwS4k12CogaiuRI4OUg0GG4jLleQYjGQgbleSYjDcQGJcSYzBaAYS50p8BqMYSKorYQbzcHMzLJ/TzcALpLEYSJorQYb1t5YzqCrJM/z///8ihoGkuBLdMBYGfgccBhJ2JTbDBAUZP2A1kJArcRkG0ofHQOyuxGcYXgOxuZKQYUQYiHBlakE9SmyCIgAUZujFME4vo+fxz1+/gtMZKGngMoygCyHehrgSxCZkGEgNAD2U/WMTTMTDAAAAAElFTkSuQmCC), auto");
          enterCallback();
        } else {
          canvas.css("cursor", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABE0lEQVQ4T2PUsQv4zwAEQOIBAwNjw9VD6xeC+OQCRpiBMAMoNZhR2zbgASMjg7y1uRHDnfuPGF6+egM2m1yDQQYmAA2cLyEmyrBiTg/D9r2HGRYs30C2wYwg18BcWZ6fwuDpbAt2IbkGwwxEcSVyhJBqMNhAXK4kx2BkA3G6khSD4QYS40piDEY3kChX4jMYxUBSXQkz+PPXrwyRKaUMX4A0NgNJciXIsMKqTmCmeMjw/z/DRQwDSXElumFfmRkccBlI0JXYDHtwYMMHrAYSciUuw0D68BmI1ZX4DMNrIDZXEjKMGAPhrpw9sRElNkERAAoz9IIYp5fR8zgPNzc4nYGSBi7DCLoQ6m2wK8GFLgHDQGoAHysV98rssWkAAAAASUVORK5CYII=), auto");
          exitCallback();
        }
      });
      return this;
    };
  };


	/* SETUP (pre-game) */
  // create blue sky background
  ctx.fillStyle = colors.background;
  // create ground
  ctx.fillRect(0, 0, width, height-50);
  ctx.fillStyle = colors.floor_dark;
  // draw stripes on ground
  ctx.fillRect(0, height-50, width, 50);
  ctx.fillStyle = colors.floor_light;
  for(var i = 0; i < width/20; i++) {
    ctx.beginPath();
    ctx.moveTo(i*20, height);
    ctx.lineTo(i*20+10, height-50);
    ctx.lineTo(i*20+20, height-50);
    ctx.lineTo(i*20+10, height);
    ctx.fill();
  }
  // add black line to ground
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = "2";
  ctx.beginPath();
  ctx.moveTo(0, height-49);
  ctx.lineTo(width, height-49);
  ctx.stroke();
  // add attribution
  setTimeout(function() {
    ctx.fillStyle = colors.text;
    ctx.font = "30px " + font;
    var attributionWidth1 = ctx.measureText("By ").width;
    ctx.font = "italic 30px " + font;
    var attributionWidth2 = ctx.measureText("TheHomeworkLife").width;
    var attributionWidth = attributionWidth1 + attributionWidth2;
    ctx.fillText("TheHomeworkLife", width/2-attributionWidth/2+attributionWidth1, height-15);
    ctx.strokeText("TheHomeworkLife", width/2-attributionWidth/2+attributionWidth1, height-15);
    ctx.font = "30px " + font;
    ctx.fillText("By ", width/2-attributionWidth/2, height-15);
    ctx.strokeText("By ", width/2-attributionWidth/2, height-15);
    new Region(width/2-attributionWidth/2+attributionWidth1, height-30, attributionWidth2, 15)
      .onHover(function() {
        ctx.font = "italic 30px " + font;
        ctx.fillStyle = "#cccccc";
        ctx.fillText("TheHomeworkLife", width/2-attributionWidth/2+attributionWidth1, height-15);
        ctx.strokeText("TheHomeworkLife", width/2-attributionWidth/2+attributionWidth1, height-15);
      }, function() {
        ctx.font = "italic 30px " + font;
        ctx.fillStyle = colors.text;
        ctx.fillText("TheHomeworkLife", width/2-attributionWidth/2+attributionWidth1, height-15);
        ctx.strokeText("TheHomeworkLife", width/2-attributionWidth/2+attributionWidth1, height-15);
      })
      .onClick(function() {window.location.href = "http://www.thehomeworklife.co.nf";});
  }, 500);
  // start clouds
  setInterval(function() {
    (function() {
      for(var i = 0; i < clouds.length; i++) {
      	for(var j = 0; j < 3; j++)
        	clouds[i][j][1] -= 0.1;
        if(clouds[i][0][1]+clouds[i][0][0] < 0 && clouds[i][1][1]+clouds[i][1][0] < 0 && clouds[i][2][1]+clouds[i][2][0] < 0) {
        	var cloud = [];
          for(var j = 0; j < 3; j++) {
          	var radius = Math.floor(Math.random()*50)+50;
            cloud.push([radius, Math.floor(Math.random()*100)+parseInt(width)+radius, Math.floor(Math.random()*200)+50]);
          }
          clouds[i] = cloud;
          continue;
        }
      }
    })();
    for(var i = 0; i < poles.length; i++) {
    	poles[i][0] -= 0.5;
      if(
      	started &&
      	poles[i][0] < width/2+radius &&
        poles[i][0] > width/2-poleWidth-radius &&
        (
        	((poles[i][2]) && (altitude+radius > (500-poles[i][1]))) ||
        	((!poles[i][2]) && (altitude-radius < poles[i][1]))
        )
      ) {
      	altitude = -1;
      }
      if(poles[i][0] < -poleWidth)
      	poles.splice(i, 1);
    }
  }, 5);
  (function() {
    var cloud = [];
    for(var j = 0; j < 3; j++) {
      var radius = Math.floor(Math.random()*50)+50;
      cloud.push([radius, Math.floor(Math.random()*100)+parseInt(width)+radius, Math.floor(Math.random()*200)+50]);
    }
    clouds.push(cloud);
  })();
  setTimeout(function() {
  	var cloud = [];
    for(var j = 0; j < 3; j++) {
      var radius = Math.floor(Math.random()*50)+50;
      cloud.push([radius, Math.floor(Math.random()*100)+parseInt(width)+radius, Math.floor(Math.random()*200)+50]);
    }
    clouds.push(cloud);
  }, 20000);
  drawClouds = function() {
  	for(var i = 0; i < clouds.length; i++) {
    	for(var j = 0; j < 3; j++) {
        ctx.fillStyle = colors.text;
        ctx.beginPath();
        ctx.arc(clouds[i][j][1], clouds[i][j][2], clouds[i][j][0], 0, Math.PI*2);
        ctx.fill();
      }
    }
    ctx.fillStyle = colors.pole;
    for(var i = 0; i < poles.length; i++) {
      if(poles[i][2]) {
      	ctx.fillRect(poles[i][0], 0, poleWidth, poles[i][1]);
        ctx.strokeRect(poles[i][0], 0, poleWidth, poles[i][1]);
      } else {
      	ctx.fillRect(poles[i][0], parseInt(height)-49-poles[i][1], poleWidth, poles[i][1]);
        ctx.strokeRect(poles[i][0], parseInt(height)-49-poles[i][1], poleWidth, poles[i][1]);
      }
    }
  };
  startScreen = function() {
  	clear();
    drawClouds();
    // add title
    var logoHeight = 75;
    ctx.font = logoHeight + "px " + font;
    ctx.fillStyle = colors.text;
    var logoWidth = ctx.measureText(title).width;
    ctx.fillText(title, width/2-logoWidth/2, height/2-logoHeight/2);
    ctx.strokeText(title, width/2-logoWidth/2, height/2-logoHeight/2);
    // add play button
    ctx.fillStyle = button_active ? colors.button_active : colors.button;
    var startWidth = 200;
    var startHeight = 50;
    roundedRect(width/2-startWidth/2, height/2, startWidth, startHeight, 10);
    ctx.stroke();
    ctx.fill();
    // add start text
    ctx.font = "30px " + font;
    ctx.fillStyle = colors.text;
    var startTextWidth = ctx.measureText("Start").width;
    ctx.fillText("Start", width/2-startTextWidth/2, height/2+startHeight-15);
    // add hit area
    if(!once) {
      var startHitRegion = new Region(width/2-startWidth/2, height/2, startWidth, startHeight);
      startHitRegion.onHover(function() {button_active = true;}, function() {button_active = false;});
      startHitRegion.onClick(function() {
        canvas.off();
        init();
      });
      $("body").keydown(function() {
      	if(event.which != 32)
        	return;
        canvas.off();
        $("body").off();
        init();
      });
      once = true;
    }
    if(!started)
    	requestAnimationFrame(startScreen);
  };
  startScreen();

  /* GAMEPLAY */
  init = function() {
		if(!started) {
    	poles = [];
    	wing = 0;
    	altitude = height/2;
      dropBy = -7;
      iteration = 0;
      if(interval < 0)
        interval = setInterval(function() {
        	if(iteration++ % 250 == 0) {
            var gap = Math.floor(Math.random()*100)+150;
            var topHeight = Math.floor(Math.random()*(height-49-gap));
            var bottomHeight = height - 49 - gap - topHeight;
            poles.push([width, topHeight, true]);
            poles.push([width, bottomHeight, false]);
          }
          altitude -= dropBy;
          dropBy += gravity;
          score += 0.1;
        }, 10);
      $("body").off();
      $("body").keydown(function() {
      	if(event.type == "keydown" && event.which != 32)
        	return;
        dropBy = -7;
        wing++;
        setTimeout(function() {
        	wing--;
        }, 200);
      });
      started = true;
      score = 0;
    }
    if(altitude <= 50 + radius) {
    	clearInterval(interval);
      firstGameOver = false;
      gameOverRunning = true;
      gameOver();
      return;
    } else if(altitude > height+radius)
    	altitude = height+radius;
    clear();
    drawClouds();
    ctx.fillStyle = colors.bird;
    ctx.strokeStyle = colors.stroke;
    ctx.beginPath();
    ctx.arc(width/2, height-altitude, radius, 0, Math.PI * 2);
    ctx.fill();
		ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.beginPath();
    ctx.arc(width/2, height-altitude, radius, 0, Math.PI / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.bird;
    ctx.beginPath();
    ctx.moveTo(width/2-10, height-altitude+5);
    ctx.lineTo(width/2, height-altitude+(wing ? 25 : 15));
    ctx.lineTo(width/2+10, height-altitude+5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.beak;
    ctx.beginPath();
    ctx.moveTo(width/2+radius-5, height-altitude-5);
    ctx.lineTo(width/2+radius+10, height-altitude);
    ctx.lineTo(width/2+radius-5, height-altitude+5);
    ctx.fill();
    ctx.fillStyle = colors.stroke;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width/2+radius-15, height-altitude-10, 3, 0, Math.PI*2);
    ctx.fill();
    var scoreHeight = 20;
    ctx.font = scoreHeight + "px " + font;
    var scoreWidth = ctx.measureText(getScore()).width;
    ctx.fillStyle = colors.text;
    ctx.fillText(getScore(), width-scoreWidth-20, scoreHeight+20);
    ctx.strokeText(getScore(), width-scoreWidth-20, scoreHeight+20);
  	requestAnimationFrame(init);
  };
  gameOver = function() {
  	poles = [];
  	clear();
    drawClouds();
    // write "Game Over"
    var gameOverHeight = 50;
    ctx.font = gameOverHeight + "px " + font;
    var gameOverWidth = ctx.measureText("Game Over").width;
    ctx.fillStyle = colors.text;
    ctx.fillText("Game Over", width/2-gameOverWidth/2, height/2-gameOverHeight);
    ctx.strokeText("Game Over", width/2-gameOverWidth/2, height/2-gameOverHeight);
    // write score
    var scoreHeight = 30;
    ctx.font = scoreHeight + "px " + font;
    var scoreWidth = ctx.measureText("Score: " + getScore()).width;
    ctx.fillText("Score: " + getScore(), width/2-scoreWidth/2, height/2-scoreHeight/2);
    ctx.strokeText("Score: " + getScore(), width/2-scoreWidth/2, height/2-scoreHeight/2);
    // create "Restart" button
    var restartWidth = 200;
    var restartHeight = 50;
    roundedRect(width/2-restartWidth/2, height/2-restartHeight/2+30, restartWidth, restartHeight, 10);
    ctx.fillStyle = restartButton_active ? colors.button_active : colors.button;
    ctx.fill();
    ctx.stroke();
    if(!firstGameOver) {
    	poles = [];
    	var restartRegion = new Region(width/2-restartWidth/2, height/2-restartHeight/2+30, restartWidth, restartHeight);
      restartRegion.onHover(function() {restartButton_active = true;}, function() {restartButton_active = false;});
    	firstGameOver = true;
      restartRegion.onClick(function() {
      	canvas.off();
        gameOverRunning = false;
        firstGameOver = false;
        interval = -1;
        init();
      });
      $("body").keydown(function() {
      	if(event.which != 32)
        	return;
        canvas.off();
        gameOverRunning = false;
        firstGameOver = false;
        interval = -1;
        init();
      });
    }
    var restartTextHeight = 30;
    ctx.font = restartTextHeight + "px " + font;
    ctx.fillStyle = colors.text;
    var restartTextWidth = ctx.measureText("Restart").width;
    ctx.fillText("Restart", width/2-restartTextWidth/2, height/2-restartHeight/2+65);
    ctx.fillText("Restart", width/2-restartTextWidth/2, height/2-restartHeight/2+65);
    once = false;
    started = false;
    if(gameOverRunning)
    	requestAnimationFrame(gameOver);
  };
});
