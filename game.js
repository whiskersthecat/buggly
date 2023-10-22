
const input = document.createElement("input");
input.setAttribute("type","text");
input.setAttribute("id","usernamebox");
input.setAttribute("placeholder","Name")
document.body.appendChild(input);

document.getElementById('music').volume = 0.15

const boost_fx = document.getElementById('boost');
const harvest_fx = document.getElementById('harvest');
const crunch_fx = document.getElementById('crunch');
const card_draw_fx = document.getElementById('card_draw')
const teleport_fx = document.getElementById('teleport_sound');
const survey_fx = document.getElementById('surveying');

const web_fx = document.getElementById('net');
const honeycrisp_fx = document.getElementById('honeycrisp')
const tractor_fx = document.getElementById('tractor')
const buycard_fx = document.getElementById('buycard')
const burst_fx = document.getElementById('burst')
const cloak_fx = document.getElementById('cloak')
const beam_fx = document.getElementById('beam')

beam_fx.volume = 0.25;
survey_fx.volume = 0.5;

var WSS_ADDRESS = "ws://73.2.104.162:9000"
var WSS_ADDRESS = "ws://" + window.location.hostname + ':9000';





// <audio src = 'tractor?.m4a' id = 'tractor'>
// 		<audio src = 'buycard.m4a' id = 'buycard'>
// 		<audio src = 'maybe_burst.m4a' id = 'burst'>
// 		<audio src = 'cloak?.m4a' id = 'cloak'>

document.getElementById('usernamebox').focus();

//const music = new Audio("goofy_Beat.m4a");

document.getElementById('usernamebox').onkeypress = function(event) {
	enterGame(event);
}

window.addEventListener('keydown', function(e) {
  if(e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
  }
});

page_loaded = false;

window.onload = (event) => {
  page_loaded = true;
  retrieveCookie('username');
};

var keys = new Set();

function playFirstCardOfType(type) {
	for(var i = 0; i < hand.length; i++) {
		if(types[cardNameLookup(hand[i])] == type) {
			playCard(i);
			break;
		}
	}
}

window.onkeydown = function(e) {
	if(e.key == 'u' && !keys.has('u')) {
		playFirstCardOfType(0);
	}else if(e.key == 'i' && !keys.has('i')) {
		playFirstCardOfType(1);
	}else if(e.key == 'o' && !keys.has('o')) {
		playFirstCardOfType(2);
	}else if(e.key == 'p' && !keys.has('p')) {
		playFirstCardOfType(3);
	}
	keys.add(e.key);
}

window.onkeyup = function(e) {

	keys.delete(e.key);
}

function checkForSelectedCard() {
	selected = -1;
	for(var i = 0; i < hand.length; i++) {
		//21/15
		if(mouseX>canvas.width/2 - (hand.length-1)*(spacing/2) +i*spacing - spacing/2
		&&mouseX<canvas.width/2 - (hand.length-1)*(spacing/2) +i*spacing - spacing/2+spacing
		&&mouseY>canvas.height-cardsize*21/15)
			selected=i;
			
	}
}

var mouseX, mouseY;
window.onmousemove = function(e) {
	document.getElementById('music').play();
	
	//crunch.play();
	mouseX = e.clientX;
	mouseY = e.clientY;

	checkForSelectedCard();

	

}

function enterGame(event){
	if(event.keyCode == '13'){
		username = document.getElementById('usernamebox').value;
		setCookie(username);
		socket.send('R' + username)
		most_apples = 0;

		// if(username == 'dev') {
		// 	devCards();
		// 			//discard.push("cloak");
		  
		// }
	}
}


function devCards() {

	discard.push("survey");
	discard.push("beam");
	discard.push('tractor');
	discard.push('cloak');
	discard.push('juggernaut');
	// discard.push('web');

	// discard.push("harvest");
	// discard.push("harvest");
	// discard.push("boost");
	// discard.push("harbloo");
	// discard.push("eat");
	// discard.push('web');

	//drawCard();
	//drawCard();
	drawCard();
	drawCard();
	drawCard();

}

var canvas = document.getElementById("canvas1");
var ctx = canvas.getContext("2d");
var title = 0;
var tutorial = 0;
var tutorial4time = 0;
var error = '';

var text_velocity = 20;
var text_y = -100;

var x = 0;

//cards
var discard = [];

var queue = null;

var hand = [];
var numlevelx = [[0], [0], [0], [0]];

var handyshift = 0;

//animation for playing cards
var limbo = [];
var migration_time = 30;

var x = 0;
var y = 0;
var r = 0;

var interval = 15;
var expectedFPMS = 1 / interval;

var speed = 2.5;
var rotationSpeed = 0.12;

var card_pulse = -100;

var carddiameter = 20;

// card information
var levels = [0, 0, 1, 1, 0, -1, 1, 2, 1, 0, 0, 2, 2, 2, -2];
var cardnames = ['harvest','boost','survey','teleport','harbloo','secret','burst','cloak','honeycrisp','nap','web','tractor','beam','juggernaut','crown'];
var types  = [0, 1, 2, 1, 3, -1, 3, 2, 0, 2, 2, 0, 3, 1, -1];
// apple, movement, tactic, weapon, crown

var costs = [[10, -1], [20, 0], [40, 1], [0, -1]];

var highest_level_discovered = 0;

var honey_crisp_time = 0;
var naptime = 0;

// the amount of speed and rotationspeed that is allocated to fixed and growth should be co-constant
// i.e. if 50% of speed is natural and 50% dimishes with size growth, the same should be the case for rotationspeed

// actually ^ never mind


var DIMINISH = 0.004

function get_speed(apples) {
	//return 0.5 + 5.5 / (1 + Math.pow((0.008 * (apples)), 2))
	let speed = 0.5 + 5.5 / (1 + Math.pow((0.011 * (apples)), 2));
	if(ragetime > 0) speed *= 2;
	return speed;
	
}

function get_rotationSpeed(apples) {
	let speed = 0.003 + 0.09 / (1 + Math.pow((0.011 * (apples)), 2));
	if(ragetime > 0) speed *= 0.25;
	if(boosttime > 0) speed *= 1.5;
	return speed;
}

var boosttime = 0;
var drawtime = 0;
var augmentcarddrawtime = 0;
var ragetime = 0;

var blink = 0;

var players = {};
var apples = {};
var cards_on_ground = {};
var projectiles = {};

var players_online = {};

var dx, dy;

var username;

var effectiveSpeed;

var scale = 1;
var effectivescale = 1;


var start_size = 75;
var playersize = start_size;
var player_apples = 0;

var mapsize = 5000;

var request_harvest = 0;
var request_teleport = 0;
var request_projectile = 0;
var request_cloak = 0;
var request_drop_card = false;

var maxdrawtime = 250;

var displayHarvest = false;

var scale_approach_speed = 0.005;

var cards_on_ground_size = 20;
var cards_on_ground_card_size = 80

var surveytime = 0;
var webbed = false;

var globalrotation = 0;
var crownrotation = 0;

var space_to_buy = -1;

var titleScreen = new Image;
titleScreen.src = 'graphics/bugglytitlescreen.png';

var error_screen_height = 100;
var error_screen_width = error_screen_height * 2146 / 950;

var most_apples = 0;

var buy_card_wait_time = 50;

var ping = 0;
var fps = 0;

var previous_timestamp = 0;
var sent_ping_time = 0;

var frames_until_update = 20;
var pings_until_update = 20;

var maxhandsize = 8;

var upgrade_offer = -1;

var queen = '';
var displayNewQueenTime = 0;

function setCookie(cookieval) {
	const d = new Date();
	exdays = 70;
  	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	let cookiestr = 'username=' + cookieval + '; expires=' + d.toUTCString();
	document.cookie = cookiestr;
	retrieveCookie('username');
}
function retrieveCookie(key) {
	name = key + '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	console.log('Cookie:',decodedCookie);
	  for(let i = 0; i <ca.length; i++) {
	    let c = ca[i];
	    while (c.charAt(0) == ' ') {
	      c = c.substring(1);
	    }
	    if (c.indexOf(name) == 0) {
	      return c.substring(name.length, c.length);
	    }
	  }
	  return "";
	//return decodedCookie.substr(key.length + 1);
}

document.getElementById('usernamebox').value = retrieveCookie('username')

function distance(xa, ya, xb, yb) {
	return Math.sqrt((xa - xb)**2 + (ya - yb)**2)
}

var recount_cards_needed = false;

function count_cards() {
	// determine the types of cards in the hand
	numlevelx = [0, 0, 0, 0];
	for (let i = 0; i < hand.length; i++) {
		numlevelx[levels[cardNameLookup(hand[i])]] ++;
	}
}


function draw(timestamp) {
	
	timestamp = Date.now();

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	canvas.style.width = window.innerWidth;
	canvas.style.height = window.innerHeight;

	if(mouseY > canvas.height - cardsize * 21/ 15 || title == 2)
		handyshift = 0;
		
	else
		if(handyshift < cardsize * 16 / 15) handyshift +=5;


	frames_until_update --;
	if(frames_until_update == 0) {
		fps =  100 / (timestamp - previous_timestamp) / 100;
		frames_until_update = 2;
	}
	
	previous_timestamp = timestamp;
	globalrotation += 0.1;
	if(globalrotation >= Math.PI*2)
		globalrotation -= Math.PI*2
	crownrotation += 0.02;
	if(crownrotation >= Math.PI*2)
		crownrotation -= Math.PI*2
	card_pulse += 3;
	if(card_pulse > 99) card_pulse = -100;

	effectivescale = 1.4 * (((playersize - start_size) * 0.2) + start_size) / start_size;
	effectivescale = effectivescale * Math.pow(((1000 * 900) / (canvas.width * canvas.height)), 0.5)
	
	if(surveytime > 0) {
		effectivescale = effectivescale * 1.6;
		surveytime --;
	}if(naptime > 0) effectivescale = effectivescale * 1.2;
	if(scale < effectivescale) {
		scale += scale_approach_speed + 0.1 * (effectivescale - scale);
		if(scale > effectivescale)
			scale = effectivescale;
	} else if (scale > effectivescale) {
		scale -= scale_approach_speed + 0.1 * (scale - effectivescale);
		if(scale < effectivescale)
			scale = effectivescale;
	}
	//scale = 1;
	
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#b20000";
	//ctx.fillRect(x, 0, 150, 75);
	if(title == 0){

		ctx.fillStyle = '#651418';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		//ctx.drawImage(image,0,0,canvas.width,canvas.width * 1556/2048);
		ctx.drawImage(titleScreen, canvas.width/2 - canvas.height * 2048 / 1556 / 2, 0, canvas.height * 2048 / 1556, canvas.height);
		if(error != '') {
			var img = '';
			if(error == 'username_taken') img = 'graphics/error_nametaken.png';
			if(error == 'username_empty') img = 'graphics/error_entername.png';
			ctx.drawImage(getImg(img), canvas.width/2 - error_screen_width / 2, canvas.height * 0.75 - error_screen_height - 50, error_screen_width, error_screen_height );
		}
} else if (title == 0.5) {
	ctx.fillStyle = "#78da6e";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = "#000000";
	ctx.font = '55px Arial';
	ctx.globalAlpha = 0.6
	ctx.fillText('Loading...', canvas.width/2 - 100, canvas.height / 2)
	ctx.globalAlpha = 1;
	if(page_loaded) {
		title = 1;
		r = Math.random() * Math.PI * 2
		socket.send('S');

		//scale = 5;
	}
}

else if (title == 1) {

	space_to_buy = -1;
	upgrade_offer = -1;

	requests = {}

	if(boosttime > 0) boosttime--;
	if(ragetime > 0) ragetime--;
	drawtime -= 1;
	if(queen == username)
		drawtime-= 0.4;
	if(augmentcarddrawtime > 0) {
		augmentcarddrawtime --;
		drawtime -= 1;
	}
	if(naptime >0) drawtime -=1.5;
	if(drawtime < 0) {
		if(discard.length > 0) {
			drawCard();
			drawtime = maxdrawtime;
		} else drawtime = 0;
	}

	if(naptime <= 0) {
		if(keys.has("a") || keys.has("ArrowLeft") || keys.has("A")) {
			if(tutorial == 0) tutorial = 1;
			r -= get_rotationSpeed(player_apples);
		}
		if(keys.has("d") || keys.has("ArrowRight") || keys.has("D")) {
			if(tutorial == 0) tutorial = 1;
			r += get_rotationSpeed(player_apples);
		}
	}
	//ctx.clear();
	ctx.fillStyle ='#0173ff';
	ctx.fillRect(0,0,canvas.width,canvas.height);

	var image = 'map';

	displayImage(image, (canvas.width / 2) - x/scale - (mapsize / scale)/2, (canvas.height / 2) - y/scale - (mapsize / scale)/2, mapsize / scale);

	if(displayHarvest) {
		ctx.globalAlpha = 0.5;
		ctx.beginPath();
		ctx.fillStyle = '#317e23';
		ctx.ellipse(canvas.width/2,canvas.height/2,getCardRange('harvest')/scale,getCardRange('harvest')/scale,0,0,Math.PI*2)
		
		ctx.fill();
		ctx.globalAlpha = 1;
	}
	for(var key in players) {
		if(players[key]['name'] == username)
			displayPlayer(players[key]['x']/scale + canvas.width/2, players[key]['y']/scale + canvas.height/2, players[key]['size']/scale, players[key]['rot'] + Math.PI/2,players[key]['displaystate'],'',players[key]['webbed'],players[key]['rage'], queen == players[key]['name']);
		else
			displayPlayer(players[key]['x']/scale + canvas.width/2, players[key]['y']/scale + canvas.height/2, players[key]['size']/scale, players[key]['rot'] + Math.PI/2,players[key]['displaystate'],players[key]['name'],players[key]['webbed'],players[key]['rage'], queen == players[key]['name']);
		//x, y, playerSize, rot, blink, name
	}

	blink --;
	if(blink < 0)
		blink = Math.random() * 400 + 400;


	speed = get_speed(player_apples)

	effectiveSpeed = speed + boosttime;

	if(webbed)
		effectiveSpeed *= 0.5;

	if(queen == username)
		effectiveSpeed *= 0.9;

	dx = effectiveSpeed * Math.cos(r);
	dy = effectiveSpeed * Math.sin(r);

	dx *= expectedFPMS / fps;
	dy *= expectedFPMS / fps;

	if(naptime > 0) {
		naptime --;
		blink = 10;
		dx = 0;
		dy = 0;
	}

	ctx.fillStyle = '#000000';
	ctx.font = '15px Arial';
	ctx.textAlign ='left';

	//ctx.fillText('x:'+Math.floor(x), canvas.width - 80, canvas.height - 200);
	//ctx.fillText('y:'+Math.floor(y), canvas.width - 80, canvas.height - 180);

	ctx.font = '15px Arial';

	//ctx.fillText('Framerate (fr / ms):'+ fps, canvas.width - 180, canvas.height - 30);
	ctx.fillText('Ping (ms)              :'+ ping, canvas.width - 180, canvas.height - 10);

	for(var key in apples) {
		displayApple(apples[key]['x'] / scale + canvas.width / 2, apples[key]['y'] / scale + canvas.height / 2, scale, honey_crisp_time > 0);
	}

	if(buy_card_wait_time > 0) buy_card_wait_time --;

	//for(let i = 0; i < cards_on_ground.length; i++) {
	let i = -1;
	let bought = false;
	for(var key in cards_on_ground) {
		i++;
		//let key = cards_on_ground[i];
		// note: returns a list! (applecost, cardsinhandlevel)
		card_on_ground_cost = cardCost(cards_on_ground[key]['card'])


		if(highest_level_discovered >= card_on_ground_cost[1] + 1) {

			var buyrange = (carddiameter + playersize ) / 2;
			if (buy_card_wait_time <= 0 && (distance(cards_on_ground[key]['x'], cards_on_ground[key]['y'], 0, 0) < buyrange) && (player_apples >= card_on_ground_cost[0]) && canAfford(card_on_ground_cost[1], true)) {
				if(space_to_buy == -1)
					space_to_buy = i;
				//players[username]['apples'] -= c['cost']

				upgrade_offer = card_on_ground_cost[1];

				if(keys.has(" ")) {
					requests['buycard'] = {'card':cards_on_ground[key]['id'], 'applecost':card_on_ground_cost[0] };
					player_apples -= card_on_ground_cost[0];

					buy_card_wait_time = 100;
					buycard_fx.play();

					//find the cards in the hand to use up:
					if(card_on_ground_cost[1] > -1) {
						var index = 0;
						var cards_cut = 0;
						while (cards_cut < 2) {

							if(levels[ (cardNameLookup(hand[index])) ] == card_on_ground_cost[1]) {
								//found one of the cards to remove
								limbo.push({'card' : hand[index],'step' : 0,'source':'hand','destination':'field','handposition':index + cards_cut,'handsize':hand.length});
								hand.splice(index, 1);
								//numlevelx[card_on_ground_cost[1]] --;
								index --;
								cards_cut++;
							}
							recount_cards_needed = true;
							index ++;
							if(index > 100 ) break;
						}

					}

					newCard(cards_on_ground[key]['card']);


					selected = -1;

					delete cards_on_ground[key];

					// feedback['addcard'] = c['card']

					// location = getSpawnLocation(carddiameter)

					// c['x'] = location[0]
					// c['y'] = location[1]
					// c['card'] =random.randint(0,numcards - 1)
					bought = true;
				}
				
			}

			let multiplier = 1;
			if (i == space_to_buy) multiplier = 1.5;
			if( bought == false)
			displayCardOnGround(cards_on_ground[key]['x']/scale + canvas.width/2, cards_on_ground[key]['y']/scale + canvas.height/2, 
				cards_on_ground[key]['card'], card_on_ground_cost[0], (card_on_ground_cost[0] <= player_apples) && canAfford(card_on_ground_cost[1]), multiplier);

		}			
		else {
			
			displayCardOnGround(cards_on_ground[key]['x']/scale + canvas.width/2, cards_on_ground[key]['y']/scale + canvas.height/2,
				5, 0, false, 1);

			if((player_apples >= card_on_ground_cost[0]) && canAfford(card_on_ground_cost[1])) {
				highest_level_discovered = card_on_ground_cost[1] + 1;
				if(highest_level_discovered == 1) {
					tutorial4time = 300;
					tutorial = 4;
				}

			}
		}
		
	}

	for (var key in projectiles) {
		let src = 0;
		if(projectiles[key]['t'] == 5)
			src = projectiles[key]['']
		displayProjectile(projectiles[key], scale)
		//displayProjectile(projectiles[key]['x'] / scale + canvas.width / 2, projectiles[key]['y'] / scale + canvas.height / 2, projectiles[key]['size'], scale, projectiles[key]['type'], projectiles[key]['d']);
	}

	ctx.globalAlpha = 0.35;
	ctx.fillStyle = '#000000';
	ctx.font = '64px Arial';
	ctx.textAlign ='left';
	ctx.fillText(username, 30, 65);

	ctx.globalAlpha = 1;
	displayApple(50, 120, 1, 0);
	ctx.fillStyle = '#b20000';
	ctx.textAlign = 'left';
	ctx.font = 'bold 50px Arial';
	ctx.fillText( Math.floor(player_apples), 85, 135);

	if(space_to_buy > -1) {
		// ctx.fillStyle = '#000000';
		// ctx.textAlign = 'center';
		// ctx.font = '40px Arial';
		// ctx.globalAlpha = 0.8;
		// ctx.fillText('[space]', canvas.width / 2 - 100 , 100);
		// ctx.globalAlpha = 0.5;
		// ctx.fillText('to buy card', canvas.width / 2 + 100, 100);
		// ctx.globalAlpha = 1;
		// ctx.textAlign = 'left';


		let img = 'graphics/buycard2.png';
		let imgwidth = 500;
		let imgheight = imgwidth * 98 / 712;
		ctx.drawImage(getImg(img), canvas.width/2 - imgwidth / 2, 0 , imgwidth, imgheight );
	}

	if(discard.length > 0)
		drawWheel(50, canvas.height-150, Math.PI*2*(drawtime/maxdrawtime), 25);

	displayHand(true);
	displayDiscard();
	displayLimbo();

	displayLeaderboard();

	//displayPlayer(canvas.width/2 , canvas.height / 2, 100, r + Math.PI/2, (blink<12), '');

	//minimap
	var minimapwidth = 140;
	var minimapheight = minimapwidth;
	var minimapx = canvas.width - 180;
	var minimapy = canvas.height - 180;
	ctx.globalAlpha = 0.8;
	displayImage('map', minimapx, minimapy, minimapwidth);
	ctx.globalAlpha = 1;

	//displayPlayer(x, y, playerSize, rot, blink, name)
	displayPlayer(minimapx + minimapwidth/2 + minimapwidth * x / mapsize, 
				minimapy + minimapheight/2 + minimapheight * y / mapsize, 10, r + Math.PI/2, 3, '', 0, 0, false);

	
	if(request_harvest > 0){
		requests['harvest'] = getCardRange('harvest');
		request_harvest = 0;
	} if(request_teleport > 0) {
		requests['teleport'] = getCardRange('teleport');
		request_teleport = 0;
	} if(request_projectile > 0) {
		if(request_projectile == 1)
			requests['projectile'] = 'harbloo';
		else if(request_projectile == 2)
			requests['projectile'] = 'burst';
		else if(request_projectile == 3)
			requests['projectile'] = 'web';
		else if(request_projectile == 4)
			requests['projectile'] = 'tractor';
		else if(request_projectile == 5)
			requests['projectile'] = 'beam';
		request_projectile = 0;
	} if(request_cloak > 0) {
		requests['cloak'] = 1;
		request_cloak = 0;
	} if(request_drop_card == 1) {
		requests['dropcrown'] = 1;
		request_drop_card = 0;
	}
	if(honey_crisp_time > 0) {
		honey_crisp_time--;
		requests['honeycrisp'] = 1;
	}
	if(ragetime > 0) {
		requests['rage'] = true;
	}


	if(tutorial == 0) {
		let img = 'graphics/artwork.png';
		let imgwidth = 500;
		let imgheight = imgwidth * 720 / 1006;
		ctx.drawImage(getImg(img), canvas.width/2 - imgwidth / 2, 0 , imgwidth, imgheight );
	}

	if(tutorial == 2) {
		let img = 'graphics/playcard3.png';
		let imgwidth = 500;
		let imgheight = imgwidth * 720 / 987;
		ctx.drawImage(getImg(img), canvas.width/2 - imgwidth / 2, -50 , imgwidth, imgheight );
	}

	if(tutorial == 4) {
		tutorial4time--;
		if(tutorial4time < 0) tutorial = 5;
		let img = 'graphics/level2upgrade.png';
		let imgwidth = 700;
		let imgheight = imgwidth * 720 / 1280;
		ctx.drawImage(getImg(img), canvas.width/2 - imgwidth / 2, 0 , imgwidth, imgheight );
	}

	if(displayNewQueenTime > 0 && tutorial!= 0) {
		displayNewQueenTime --;
		ctx.fillStyle = '#000000';
		ctx.textAlign = 'center';
		ctx.font = '35px Arial';
		ctx.globalAlpha = 0.6;
		let msg = 'The crown is dropped!'
		if(queen != '')
			msg = queen + ' is the Queen Buggly!';
		ctx.fillText(msg, canvas.width / 2  , 100);
		ctx.globalAlpha = 0.5;
		//ctx.fillText('to buy card', canvas.width / 2 + 100, 100);
		ctx.globalAlpha = 1;
		ctx.textAlign = 'left';
	}


	let displaystate = 3;
	if(blink < 40) displaystate = 2;
	if(sent_ping_time == 0) {
		sent_ping_time = Date.now();
		requests['p'] = 'ping';
	}
	json = JSON.stringify({'dx':dx,'dy':dy,'rot':r,'displaystate':displaystate,'requests':requests,'renderrange': Math.max(canvas.width,canvas.height)*scale * 1.2});

	
	//console.log("sending back:", json);
	socket.send(json);
} else if (title == 2) {

	//game over

	ctx.fillStyle ='#0173ff';
	ctx.fillRect(0,0,canvas.width,canvas.height);

	var image = 'map';

	displayImage(image, (canvas.width / 2) - x/scale - (mapsize / scale)/2, (canvas.height / 2) - y/scale - (mapsize / scale)/2, mapsize / scale);

	for(var key in apples) {
		displayApple(apples[key]['x'] / scale + canvas.width / 2, apples[key]['y'] / scale + canvas.height / 2, scale, 0);
	}
	for(var key in cards_on_ground) {
		card_on_ground_cost = cardCost(cards_on_ground[key]['card'])

		if(highest_level_discovered >= card_on_ground_cost[1] + 1) {
			displayCardOnGround(cards_on_ground[key]['x']/scale + canvas.width/2, cards_on_ground[key]['y']/scale + canvas.height/2, 
				cards_on_ground[key]['card'], card_on_ground_cost[0], (card_on_ground_cost[0] <= player_apples) && canAfford(card_on_ground_cost[1]), 1);
		}			
		else {
			displayCardOnGround(cards_on_ground[key]['x']/scale + canvas.width/2, cards_on_ground[key]['y']/scale + canvas.height/2,
				5, 0, false, 1);
		}
	}

	for(var key in players) {
		if(players[key]['name'] == username)
			displayPlayer(players[key]['x']/scale + canvas.width/2, players[key]['y']/scale + canvas.height/2, players[key]['size']/scale, players[key]['rot'] + Math.PI/2,players[key]['displaystate'],'',players[key]['webbed'],players[key]['rage'], queen == players[key]['name']);
		else
			displayPlayer(players[key]['x']/scale + canvas.width/2, players[key]['y']/scale + canvas.height/2, players[key]['size']/scale, players[key]['rot'] + Math.PI/2,players[key]['displaystate'],players[key]['name'],players[key]['webbed'],players[key]['rage'], queen == players[key]['name']);
		//x, y, playerSize, rot, blink, name
	}

	requests = {'lost': true}

	ctx.globalAlpha = 0.5;
	ctx.fillStyle ='#000000';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.globalAlpha = 1;

	ctx.globalAlpha = 0.7;
	ctx.fillStyle = '#000000';
	ctx.font = '100px Arial';
	ctx.textAlign ='center'
	ctx.fillText('Game Over', canvas.width / 2 - 0, text_y );

	ctx.font = '50px Arial';
	ctx.fillText('Most ', canvas.width / 2 - 100, text_y + 80 );
	displayImage('darkapple', canvas.width/2 - 30, text_y + 30, 60);
	ctx.textAlign ='left'
	ctx.fillText(': ' + Math.floor(most_apples), canvas.width / 2 + 60, text_y + 80 );
	//ctx.textAlign

	ctx.font = '30px Arial';

	ctx.textAlign = 'center';
	ctx.fillText('[Enter] to respawn', canvas.width / 2 - 20, text_y + 160 );
	ctx.fillText('You will start with:', canvas.width / 2 - 15, text_y + 200 );

	displayHand(false);

	if(keys.has('Enter')) {
		title = 0.5;
	}

	text_y += text_velocity;
	if(text_velocity > 0)
		text_velocity -=0.5;
	ctx.globalAlpha = 1;

	json = JSON.stringify({'dx':0,'dy':0,'rot':r,'displaystate':(blink < 40),'requests':requests,'renderrange': Math.max(canvas.width,canvas.height)*scale * 1.2});
	//console.log("sending back:", json);
	
	socket.send(json);
}

//window.requestAnimationFrame(draw);
};

//setInterval(draw, 15);
setInterval(draw, interval);

//let socket = new WebSocket("ws://135.180.135.14:9000");

let socket = new WebSocket(WSS_ADDRESS);

//let socket = new WebSocket("ws://73.2.104.162:9000");

//let socket2 = new WebSocket("ws://192.168.1.17:8000/websocketrequest");

function cardsKept(totalvalue) {
	if(totalvalue >= 11) return 4;
	if(totalvalue >= 8) return 3;
	if(totalvalue >= 5) return 2;
	if(totalvalue >= 1) return 1;
	return 0;
}

socket.onmessage = (event) => {
	//console.log("received:", event.data);

	if(event.data[0] == 'E') {
		error = event.data.substring(2);
	} else if(event.data[0] == 'A') {
		document.getElementById('usernamebox').style.visibility = 'hidden';
		username = event.data.substring(2);
		if(event.data[1] == '.') {
			devCards();
		}
		title = 0.5;
	} else if(event.data[0] == 'L') {
		//you lost!
		title = 2;
		//rearrange the cards in the hand:
		const temphand = hand.splice(0, hand.length)
		discard = discard.concat(temphand)
		for (let i = 0; i < limbo.length; i++) {
			discard.push(limbo[i]['card']);
		}
		limbo = [];
		//discard = discard.concat(templimbo)

		// find the total value in the discard pile:
		let totalvalue  = 0;
		for (let i = 0; i < discard.length; i++) {
			//cardNameL
			totalvalue += levels[ cardNameLookup(discard[i])] + 1;
		}

		let valuekept = cardsKept(totalvalue);
		let valueadded = 0;
		numlevelx = [0, 0, 0, 0];
		while(valueadded < valuekept) {
			var index = Math.floor(Math.random()*discard.length);
			hand.push(discard[index]);
			valueadded += levels[ cardNameLookup(discard[index])] + 1;
			//numlevelx[levels[discard[index]]] += 1;
			discard.splice(index, 1);
		}
		recount_cards_needed = true;

		discard = [];

		//socket.close();

	} else {
		receive = JSON.parse(event.data);

		if(receive['feedback']['p'] == 1) {
			
			pings_until_update --;
			if(pings_until_update == 0) {
				ping =  Math.round( 100 * (Date.now() - sent_ping_time) ) / 100
				//console.log('new ping:', ping);
				pings_until_update = 20;
			}
			sent_ping_time = 0;
		}
		
		if(receive['feedback']['queen'] != queen) {
			displayNewQueenTime = 350;
		}


		queen = receive['feedback']['queen'];
		console.log('queen:', queen)

		x = receive['players'][username]['x'];
		y = receive['players'][username]['y'];
		//display contains the players with 'size' tag
		players = receive['display']['players'];
		apples = receive['display']['apples'];
		cards_on_ground = receive['display']['cards'];
		projectiles = receive['display']['projectiles'];


		// players contains the players with 'apples' tag 

		players_online = receive['players'];
		playersize =  applesToSize(receive['players'][username]['apples']);
		player_apples = receive['players'][username]['apples'];
		if(player_apples > most_apples)
			most_apples = player_apples;


		if(receive['feedback']['munch'] == true) {
			crunch_fx.play();
		}
		webbed = (receive['players'][username]['webtime'] > 0);
		// if('addcard' in receive['feedback']) {
		// 	newCard(receive['feedback']['addcard']);
		// }


	}



}

function displayLeaderboard() {
	var i = 0;
	for(var key in players_online) {
		if(players_online[key]['ghost'] == false) {
			if(key == username) {
				ctx.font = 'bold 30px Arial';
			}
				
			else
				ctx.font = '30px Arial';
			ctx.textAlign = 'right';
			
			ctx.fillStyle = '#000000';
			if(queen == key) {
				ctx.fillStyle = '#c700b6';
				ctx.globalAlpha = 1;
				let image = getImg(getCardInfo('crown_side').path)
				ctx.drawImage(image, canvas.width - 165 - 12 * key.length, 10 + 30 * i, 20 * 2472 / 1145, 20);
			}
			ctx.globalAlpha = 0.5;
			ctx.fillText(key, canvas.width - 80, 30 + 30 * i);
			ctx.globalAlpha = 1;

			ctx.fillStyle = '#b20000';
			ctx.fillText( Math.floor(players_online[key]['apples']), canvas.width - 10, 30 + 30 * i);
			i++;



			ctx.fontWeight = '400';
		}
		
	}
}

//cards display

var spacing = 120;
var cardsize = 120;

var selected = -1;

var enlarge = 1.5;



draw();

// function sizeToApples(size) {
// 	return Math.floor ((size - start_size) / 4);
// }

function applesToSize(apples) {
	// (size is the diameter)
	var area = 4420 + 500 * apples;
	return 2 * Math.pow((area / Math.PI), 0.5);
}

function displayHand(interactive) {
	displayHarvest = false;
	//selected = -1;
	let cards_darkened = 0;
	let darken_card = false;
	let darken_selected_card = false;
	for(var i = 0; i < hand.length; i++) {
		darken_card = false;
		if(upgrade_offer > -1 && cards_darkened < 2)
			if(levels[ (cardNameLookup(hand[i])) ] == upgrade_offer) {
				darken_card = true;
				cards_darkened ++;
				if(selected == i) darken_selected_card = true;
			}
		//21/15
		if (selected != i || interactive == false)
			displayCard(hand[i],
			canvas.width/2 - (hand.length-1)*(spacing/2) +i*spacing - spacing/2,
			canvas.height - cardsize*21/15 + handyshift,
			cardsize, 1, darken_card);

		if(hand[i] == 'harvest' && selected == i){
			displayHarvest = true;
		}
		
		
	}
	if(selected != -1 && interactive == true)
		displayCard(hand[selected],
				canvas.width/2 - (hand.length-1)*(spacing/2) +selected*spacing - (spacing/2)*enlarge,
				canvas.height-cardsize*21/15*enlarge + handyshift,
				cardsize*enlarge, 1, darken_selected_card);

}

window.onmousedown = function(e) {

	if(selected != -1 && naptime <= 0 && title == 1)
		playCard(selected);
	// for(var i=0;i<hand.length;i++){
	// 	//21/15
	// 	if(mouseX>canvas.width/2 - (hand.length-1)*(spacing/2) +i*spacing - spacing/2
	// 	&&mouseX<canvas.width/2 - (hand.length-1)*(spacing/2) +i*spacing - spacing/2+spacing
	// 	&&mouseY>canvas.height-cardsize*21/15){
	// 		if(naptime <= 0)
			
	// 	}
	// }
	checkForSelectedCard();
}

var discardspacing=40;


// displayProjectile(projectiles[key]['x'] / scale + canvas.width / 2, projectiles[key]['y'] / scale + canvas.height / 2, projectiles[key]['size'], scale, projectiles[key]['type'], projectiles[key]['d']);
function displayProjectile(proj, scale) {

	let px = proj['x'] / scale + canvas.width / 2;
	let py = proj['y'] / scale + canvas.height / 2;
	let size = proj['size'];
	let type = proj['type'];
	let direction = proj['d']
	ctx.save();
	image = 'harbloo_projectile'
	if(type == 2)
		image = 'player_web'
	if(type == 3)
		image = 'tractor_image'
		ctx.translate(px, py);
		ctx.rotate(direction + Math.PI/2);
		ctx.translate(-px, -py);
	
	if(type == 0 || type == 1) {
		ctx.translate(px, py);
		ctx.rotate(globalrotation);
		ctx.translate(-px, -py);
	}
	if(type != 4)
		displayImage(image, px - size / scale, py - size / scale, 2 * size / scale, 2 * size / scale);
	else {
		ctx.restore();
		//draw a line for the beam from the src to the location
		ctx.fillStyle = '#000000';
		//ctx.beginPath();
		//ctx.ellipse(px, py, size / scale, size / scale, 0, 0, Math.PI * 2)
		//ctx.fill();
		ctx.beginPath();
		ctx.moveTo((proj['src'][0] - x) / scale + canvas.width / 2, (proj['src'][1] - y) / scale + canvas.height / 2);
		//ctx.moveTo(canvas.width / 2, canvas.height / 2);
		ctx.lineTo(px, py);
		ctx.strokeStyle = '#ff00ea';
		
		ctx.globalAlpha = 0.5;
		ctx.lineWidth = size / scale;
		ctx.stroke();
		
		ctx.globalAlpha = 1;

	}
	ctx.restore();
}

function displayApple(x, y, scale, golden) {
	//apple radius344333443433343434343434
	var applesize = 20;
	// ctx.globalAlpha = 0.5;
	// ctx.fillStyle = '#00FF00';
	// ctx.beginPath();
	// ctx.ellipse(x,y,applesize /scale,applesize/scale,0,0,Math.PI*2)
	// ctx.fill();
	var image = 'apple';
	if(golden) image = 'apple_golden';
	displayImage(image, x - applesize / scale, y - applesize / scale, 2 * applesize / scale, 2 * applesize / scale);
	//ctx.globalAlpha = 1;
}

function displayDiscard(){
	for(var i = 0; i < discard.length; i++){
		ctx.save();
		ctx.translate(i * discardspacing, 1 * (canvas.height - cardsize));
		ctx.rotate(-1*Math.PI/2);
		ctx.translate(-i * discardspacing, -1 * (canvas.height - cardsize));
		displayCard(discard[i], i * discardspacing - cardsize, canvas.height - cardsize, cardsize, 1);
		
		ctx.restore();
	}

}

images = {};
function getImg(path) {
	if(images[path]) {
		return images[path];
	} else {
		var image = new Image();
		image.src = path;
		images[path] = image;
		return image;
	}
}
function displayPlayer(x, y, playerSize, rot, displaystate, name, webbed, rage, queen) {

	//console.log("displaying player", name,'at position:',x,',',y);

	ctx.save();
	ctx.translate(x,y);
	ctx.rotate(rot);
	ctx.translate(-1 * x,-1 * y);
	let opacity = 1;
	var image = 'bugg';
	if(displaystate == 2){
		image = 'buggiclosed';
	} 
	else if(displaystate <= -1) image = 'buggowchie';
	else if(displaystate >= 0 && displaystate < 1) opacity = displaystate;
	ctx.globalAlpha = opacity;
	if(displaystate >=0 && displaystate < 0.2 && name == '')
		displaystate = ctx.globalAlpha = 0.2;
	displayImage(image, x - playerSize / 2, y - playerSize / 2, playerSize, playerSize);

	if(webbed) {
		displayImage('player_web', x - playerSize / 2, y - playerSize / 2, playerSize, playerSize);
	}

	if(rage) {
		ctx.fillStyle = '#FF0000';
		ctx.globalAlpha = (0.25 + 0.5 *Math.abs(card_pulse) / 100) * opacity;

		ctx.beginPath();
		ctx.ellipse(x, y, Math.abs(playerSize / 2), Math.abs(playerSize / 2), 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = opacity;
	}

	if(queen) {
		ctx.fillStyle = '#ff11eb';
		ctx.globalAlpha = 0.15;
		ctx.beginPath();
		ctx.ellipse(x, y, Math.abs(playerSize / 2), Math.abs(playerSize / 2), 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = opacity;

		//ctx.restore();

		ctx.translate(x,y);
		ctx.rotate(crownrotation - rot);
		ctx.translate(-1 * x,-1 * y);

		displayImage('crown_img', x - playerSize*0.7 / 2, y - playerSize*0.7 / 2, playerSize*0.7, playerSize*0.7);
	}

	ctx.restore();


	
	ctx.textAlign = 'center';
	ctx.fillStyle = '#444444'
	ctx.font = '30px Arial';
	if(displaystate > 0)
	ctx.fillText(name, x, y - playerSize / 2)

	ctx.globalAlpha = 1;
	

}

function drawWheel(x, y, angle, radius) {
	ctx.fillStyle = '#222222';
	ctx.beginPath();
	ctx.moveTo(x, y);

	ctx.arc(x,y,radius,-Math.PI/2,-Math.PI/2 + angle);
	ctx.lineTo(x, y-radius);
	ctx.lineTo(x + radius*Math.cos(angle -Math.PI/2), y + radius*Math.sin(angle -Math.PI/2));
	ctx.fill();
}

function displayCard(card, x, y, cardSize, xstretch, darkencard){
	var image = getImg(getCardInfo(card).path);
	ctx.drawImage(image, x + 0.5 * cardSize * (1 - xstretch), y, cardSize * xstretch, cardSize* 21 / 15);
	if(darkencard) {
		ctx.fillStyle = '#000000';
		ctx.globalAlpha = 0.5;
		ctx.fillRect( x + 0.5 * cardSize * (1 - xstretch), y, cardSize * xstretch, cardSize* 21 / 15);
		ctx.globalAlpha = 1;
	}
}
function displayImage(card, x, y, size) {
	var image = getImg(getCardInfo(card).path);
	ctx.drawImage(image, x, y, size, size);
}

function displayLimbo() {
	for (var i = 0; i < limbo.length; i++) {
		if(limbo[i]['source'] == 'discard' || limbo[i]['destination'] == 'discard') {
			// Note: cards NOT always discarded and draw to the rightmost part of hand/discard
			let handposition = limbo[i]['handposition'];
			let handsize = limbo[i]['handsize'];
			//hand position:
			var initial_pos = [canvas.width / 2 - (handsize) * (spacing / 2) + (handposition)* spacing - spacing / 2 , 
						canvas.height - cardsize * 21 / 15 + handyshift]; //[x,y]
			var final_pos = [discard.length * discardspacing - cardsize, canvas.height - cardsize]; //[x,y]

			var displayx = final_pos[0] + (initial_pos[0] - final_pos[0]) * (limbo[i]['step'] / migration_time);
			var displayy = final_pos[1] + (initial_pos[1] - final_pos[1]) * (limbo[i]['step'] / migration_time);
			
			ctx.save();
			ctx.translate(displayx + cardsize, 1 * displayy);
			ctx.rotate( (1 - limbo[i]['step']/migration_time) * -1 * Math.PI / 2);
			ctx.translate(-1 * (displayx + cardsize), -1 * displayy);
			displayCard(limbo[i]['card'], displayx, displayy, cardsize, 1);
			ctx.restore();

			if(limbo[i]['destination'] == 'discard') {
				limbo[i]['step'] --;
				if(limbo[i]['step'] <= 0) {
					discard.push(limbo[i]['card']);
					limbo.splice(i, 1);
				}

			} else {
				limbo[i]['step'] ++;
				if(limbo[i]['step'] >= migration_time) {
					//numlevelx[levels[cardNameLookup(limbo[i]['card'])]] ++;
					hand.push(limbo[i]['card']);
					limbo.splice(i, 1);
					recount_cards_needed = true;
					
				}
			}

		} else {
			var initial_card_size = 2 * cardsize;

			let handposition = limbo[i]['handposition'];
			let handsize = limbo[i]['handsize'];

			var initial_pos = [canvas.width / 2 - initial_card_size / 2 , canvas.height / 2 - initial_card_size * (21 / 15) / 2]; //[x,y]
			var final_pos = [canvas.width / 2 - (handsize) * (spacing / 2) + (handposition)* spacing - spacing / 2 , 
						canvas.height - cardsize * 21 / 15 + handyshift]; //[x,y]

			var displayx = final_pos[0] + (initial_pos[0] - final_pos[0]) * (limbo[i]['step'] / migration_time);
			var displayy = final_pos[1] + (initial_pos[1] - final_pos[1]) * (limbo[i]['step'] / migration_time);

			if(limbo[i]['step'] <= migration_time)
				displayCard(limbo[i]['card'], displayx, displayy, 
					cardsize + ((initial_card_size - cardsize) * (limbo[i]['step'] / migration_time)), 1);

			else
				displayCard(limbo[i]['card'], initial_pos[0], initial_pos[1], initial_card_size, 1);

			if(limbo[i]['destination'] == 'hand') {
				limbo[i]['step'] --;
				if(limbo[i]['step'] <= 0) {
					hand.push(limbo[i]['card']);
					//numlevelx[levels[cardNameLookup(limbo[i]['card'])]] ++;
					limbo.splice(i, 1);
					recount_cards_needed = true;
					if(tutorial == 1)
						tutorial = 2;

				}
				
			} else {
				limbo[i]['step'] ++;
				if(limbo[i]['step'] >= migration_time) {
					limbo.splice(i, 1);
				}
			}
			
		}

	}
}

// cards info

//takes in card id which is a string and returns information about each card like the name of the image
function getCardInfo(cardId) {
	if(cardId == "harvest") {
		return {
			path: "cards/harvest.png"
		};
	} else if(cardId == "boost") {
		return {
			path: "cards/boost.png"
		};
	} else if(cardId == "bugg") {
		return {
			path: "graphics/bugg.png"
		};
	} else if(cardId == "buggiclosed") {
		return {
			path: "graphics/buggiclosed.png"
		};
	} else if(cardId == "apple") {
		return {
			path: "graphics/apple.png"
		};
	} else if(cardId == "map") {
		return {
			path: "https://pixelscape.org/games/buggly/map.jpg"
		};
	} else if(cardId == 'darkapple') {
		return {
			path: 'graphics/apple_dark.png'
		};
	} else if(cardId == 'survey') {
		return {
			path: 'cards/survey.png'
		};
	} else if(cardId == 'teleport') {
		return {
			path: 'cards/teleport.png'
		};
	} else if(cardId == 'harbloo') {
		return {
			path: 'cards/harbloo.png'
		};
	} else if(cardId == 'harbloo_projectile') {
		return {
			path: 'graphics/harbloo_projectile.png'
		};
	} else if(cardId == 'secret') {
		return {
			path: 'graphics/secret.png'
		};
	} else if(cardId == 'buggowchie') {
		return {
			path: 'graphics/bugg_eaten.png'
		};
	} else if(cardId == 'burst') {
		return {
			path: 'cards/burst.png'
		};
	} else if(cardId =='cloak') {
		return {
			path: 'cards/camoflauge.png'
		};
	} else if(cardId == 'honeycrisp') {
		return {
			path: 'cards/honeycrisp.png'
		};
	} else if(cardId == 'apple_golden') {
		return {
			path: 'graphics/apple_gold.png'
		};
	} else if(cardId == 'nap') {
		return {
			path: 'archive/nap.png'
		};
	} else if(cardId == 'web') {
		return {
			path: 'cards/web.png'
		};
	} else if(cardId == 'player_web') {
		return {
			path: 'graphics/player_web.png'
		};
	} else if(cardId == 'tractor') {
		return {
			path: 'cards/tractor.png'
		};
	} else if(cardId == 'tractor_image') {
		return {
			path: 'graphics/tractor_image_noshadow.png'
		};
	} else if(cardId == 'tutorial') {
		return {
			path: 'graphics/artwork.png'
		};
	} else if(cardId == 'beam') {
		return {
			path: 'cards/laser.png'
		};
	} else if(cardId == 'juggernaut') {
		return {
			path: 'cards/juggernaut.png'
		};
	} else if(cardId == 'crown') {
		return {
			path: 'cards/crown.png'
		};
	} else if(cardId == 'crown_img') {
		return {
			path: 'graphics/crown.png'
		};
	} else if(cardId == 'crown_side') {
		return {
			path: 'graphics/crownside.png'
		};
	}
}
function getCardRange(cardId){
	if(cardId == "harvest") {
		return 300 + playersize*0.6;
	}
	else if(cardId == 'teleport') {
		return 1200 + playersize * 0.5;
	}
	return 0;
}

function cardNameLookup(card_name) {
	return cardnames.indexOf(card_name);
}

function cardIdLookup(int_id) {
	return cardnames[int_id];
}


function cardCost(int_id) {
	// apple cost, level
	if(int_id == 14)
		return costs[3]
	return costs[levels[int_id]];
}

function canAfford(cardLevel, markCards) {
	// card level comes from cardCost(int_id)[1]

	// the markCards

	// the level -1 cards are always free
	if(cardLevel == -1) {
		return cardsOwned() < maxhandsize;
	}
	// the other cards require two of the one they combine from
	if(recount_cards_needed) {
		count_cards();
		recount_cards_needed = false;
	}


	return numlevelx[cardLevel] >= 2;

}

function cardsOwned() {
	return  discard.length + hand.length + limbo.length;
}

function newCard(int_id) {
	if(discard.length == 0)
		drawtime = maxdrawtime;
	limbo.push({'card' : cardIdLookup(int_id),'step' : migration_time * 3,'source':'field','destination':'hand', 'handposition':hand.length, 'handsize':hand.length});
	//discard.push(cardIdLookup(int_id));
}



function displayCardOnGround(x, y, card, cost, afford, multiplier) {

	let shift = 0;

	if(multiplier > 1)
		shift = ((cards_on_ground_card_size / scale) * 1.5 - (cards_on_ground_card_size / scale) ) * 21/15;

	ctx.fillStyle = '#000000';
	ctx.globalAlpha = 0.4;
	ctx.beginPath();
	ctx.ellipse(x, y, 0.5 * cards_on_ground_card_size / scale, cards_on_ground_size / scale, 0, 0, Math.PI * 2)
	ctx.fill();

	if(afford) ctx.globalAlpha = 0.8;
	else ctx.globalAlpha = 0.4;



	if(card != 5) {
		var text_size = String(35 / scale) ;
		ctx.font = (text_size) +'px Arial';
		ctx.fillText(cost, x - 0.5 * cards_on_ground_card_size / scale, y - (cards_on_ground_card_size / scale) * 1.5  - shift);
		displayImage('darkapple',x + 0.05 * cards_on_ground_card_size / scale , y - (cards_on_ground_card_size / scale) * 1.9 - shift, 33 / scale);
		if(levels[card] > 0) {
			img = 'graphics/level1.png'
			if(levels[card] == 2) img = 'graphics/level2.png'
			ctx.drawImage(getImg(img), x - 0.35 * cards_on_ground_card_size / scale , y - (cards_on_ground_card_size / scale) * 2.34 - shift, 33 /scale, 33/scale );
			ctx.drawImage(getImg(img), x - 0.05 * cards_on_ground_card_size / scale , y - (cards_on_ground_card_size / scale) * 2.34 - shift, 33 /scale, 33/scale );
		}
	}
	if(levels[card] == 0 && cardsOwned() >= maxhandsize) {
		var text_size = String(20 / scale) ;
		ctx.font = (text_size) +'px Arial';
		ctx.fillText('Max Cards', x - 0.6 * cards_on_ground_card_size / scale, y - (cards_on_ground_card_size / scale) * 2)
	}

	if(afford) ctx.globalAlpha = 1;
	else ctx.globalAlpha = 0.6
	displayCard(cardIdLookup(card)  , x - 0.5 * multiplier * cards_on_ground_card_size / scale, y - (multiplier * cards_on_ground_card_size / scale) * 21/15, multiplier * cards_on_ground_card_size / scale, Math.abs(card_pulse / 100))
	ctx.globalAlpha = 1;
}

function drawCard() {
	card_draw_fx.play()
	var index = Math.floor(Math.random()*discard.length);
	limbo.push({'card' : discard[index],'step' : 0,'source':'discard','destination':'hand','handposition':hand.length,'handsize':hand.length });
	// numlevelx[levels[cardNameLookup(discard[index])]] ++;
	//hand.push(discard[index]);
	recount_cards_needed = true;
	discard.splice(index, 1);
}

function playCard(index) {
	if(tutorial == 2)
		tutorial = 3;
	selected = -1;
	cardEffect(hand[index]);
	if(hand[index] == 'crown') {
		hand.splice(index, 1);
	} else 
		discardCard(index);
}

function discardCard(index) {
	if(discard.length == 0)
		drawtime = maxdrawtime;
	//discard.push(hand[index]);
	//numlevelx[levels[cardNameLookup(hand[index])]] --;
	limbo.push({'card' : hand[index],'step' : migration_time,'source':'hand','destination':'discard','handposition':index,'handsize':hand.length});
	recount_cards_needed = true;
	hand.splice(index, 1);
}

function cardEffect(cardId){
	if(cardId == "harvest") {
		request_harvest = getCardRange('harvest');
		harvest_fx.play();
	} else if(cardId == "teleport") {
		request_teleport = 1;
		teleport_fx.play();
	} else if(cardId == "survey") {
		surveytime += 300;
		survey_fx.play();
	} else if(cardId == "boost") {
	 	boosttime += 24;
	 	augmentcarddrawtime += 24;
	 	boost_fx.play();
	} else if(cardId == 'harbloo') {
		request_projectile = 1;
		burst_fx.play();
	} else if(cardId == 'burst') {
		request_projectile = 2;
		burst_fx.play();
	} else if(cardId == 'cloak') {
		request_cloak = 1;
		cloak_fx.play();
	} else if(cardId == 'honeycrisp') {
		honey_crisp_time += 290;
		honeycrisp_fx.play()
	} else if(cardId == 'nap') {
		naptime += 300;
	} else if(cardId == 'web') {
		boosttime += 12;
		web_fx.play();
		request_projectile = 3;
	} else if(cardId == 'tractor') {
		boosttime += 10;
		request_projectile = 4;
		tractor_fx.play();
	} else if(cardId == 'beam') {
		naptime += 55;
		request_projectile = 5;
		beam_fx.play();
	} else if(cardId == 'juggernaut') {
		ragetime += 150;
		// fx for juggernaut
	} else if(cardId == 'crown') {
		buy_card_wait_time = 100;
		request_drop_card = 1;
		boosttime += 32;
	}
}