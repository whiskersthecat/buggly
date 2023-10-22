
import asyncio
# TO SETUP BUGGLY
#   >> 1. Find your devices LOCAL IP address in the Wifi settings
# 			this is the IP assigned by the router. This can change occasionally when the lease expires!
#   >> 2. Change the local address below to bind this socket and the HTTP server socket
#    >>   Also, change the local address in the HTTP server (server.py) variable HOSTNAME
#   >> 3. Then, sign into the router to enable port forwarding 8000 - 9000 to this device
#   >> 4. Start to terminal sessions and run both python scripts
#   >> 5. Determine your public IP address by using a google search tool, and share this 'ADDRESS:9000' to others
LOCAL_ADDRESS = '10.0.0.141'


import websockets
import json

import random

import math
 
import traceback

from concurrent.futures import ThreadPoolExecutor
import threading
from threading import Timer

import time

#stores the position of every player, and their username
#stores the position of every apple

spawnrange = 2000
edgeofmaprange = spawnrange * 1.2

applediameter = 20

appleHarvestSpeed = 12

numcards = 5




# number 9 (nap) is discontinued as level0
level_0_card_ids = [0, 1, 4, 10]
level_1_card_ids = [2, 3, 6, 8]
level_2_card_ids = [7, 11, 12, 13]
crown_card_id = 14

queen = ''

total_levelx_cards_on_board = [7, 3, 2]

def getNewCard(card_id):
	if(card_id < total_levelx_cards_on_board[0] + 1):
		return level_0_card_ids[random.randint(0, len(level_0_card_ids) - 1)]
	elif(card_id < total_levelx_cards_on_board[0] + total_levelx_cards_on_board[1] + 1):
		return level_1_card_ids[random.randint(0, len(level_1_card_ids) - 1)]
	elif(card_id < total_levelx_cards_on_board[0] + total_levelx_cards_on_board[1] + total_levelx_cards_on_board[2] + 1):
		return level_2_card_ids[random.randint(0, len(level_2_card_ids) - 1)]


def decayRate(n_apples):
	if(n_apples > 5):
		return ( 0.02*pow((0.01*n_apples),2) ) / ( (1 + pow(0.01*n_apples, 2)) )
	return 0
	#note 0.05 is the rate at which the tractor harvests

apples = []
for a in range(0,80):
	apples.append({'x':random.randint(-spawnrange, spawnrange), 'y': random.randint(-spawnrange, spawnrange),'harvested' : '','temp':''})




carddiameter = 20
cards = []

cards.append({'x':random.randint(-spawnrange, spawnrange), 'y': random.randint(-spawnrange, spawnrange), 'card' : 14, 'id': 0})

for a in range(0, sum(total_levelx_cards_on_board, 0)):
	cards.append({'x':random.randint(-spawnrange, spawnrange), 'y': random.randint(-spawnrange, spawnrange), 'card' : getNewCard(a), 'id': a + 1})

print(cards[0])


players = {}

projectiles = {}
#                  tumbler, burst, web, tractor, beam
projectile_speed = [15, 10, 9, 6, 30]
projectile_damage = [7, 5, 4, 0.2, 2.1]
projectile_ttl = [150, 100, 1500, 540, 50]
#how big is the projectile compared to the player
#projectileproportion = [0.2, 0.12, 0.1, 0.1]
projectileproportion = [0.1, 0.06, 0.1, 0.15, 0.02]
projectileinitialsize = [35, 22, 100, 60, 20]

webstalltime = 200
webmovementime = 40


start_size = 75

teleportspeed = 0.05
teleportdistance = 1500
#tolerance for teleport location
teleportrange = 750

def getSpawnLocation(item_diameter):
	#generate a random place to spawn an item (e.g. player, apple, card...)
	#rules: the item cannot be touching a player!
	x = 0
	y = 0
	
	veto = True
	tolerance = 0
	while(veto):
		x = random.randint(- (spawnrange + tolerance), (spawnrange + tolerance))
		y = random.randint(- (spawnrange + tolerance), (spawnrange + tolerance))
		veto = False
		for p in players:
			#check if the player is touching the 
			this_player_size = applesToSize(players[p]['apples'])
			
			if (math.dist([x, y],[players[p]['x'], players[p]['y']]) < (this_player_size + item_diameter)/2):
				# this is a bad location
				#print("VETO spawning location x, y =", x, y, " touching player", p)
				
				veto = True
				tolerance += 50
				break

	return [x, y];


def applesToSize(apples):
	# print('apples:', apples)
	# (size is the diameter)
	area = 4420 + 500 * apples
	return 2 * math.pow(abs((area / math.pi)), 0.5)

#def sizeToApples(size):
#	return math.floor ((size - start_size) / 4);

# create handler for each connection
 
async def handler(websocket, path):
	global queen
	username = ''
	renderRange = 2000
	alert_loss = False
	dev = False
	print("Opened up a websocket")
	while True:
		try:
			data = await websocket.recv()
			#print('received:' , data)
			reply = ''
			if(data[0] == 'R'):
				username = data[1:]
				#request for new user
				if((username in players) or (username == '')):
					if(username in players):
						reply = 'E:username_taken'
						print('username taken')
						username = ''
					elif username == '':
						reply = 'E:username_empty'
						print("username empty")
					#there is already a player with this username
				else:
					username = data[1:]

					if(username == 'Pumita.io:Kittish'):
						username = 'Pumita.io'
						dev = True

					if(username == 'dev:meow'):
						username = 'dev'
						dev = True
					
					players[username] = {}

					players[username]['x'] = 0
					players[username]['y'] = 0
					players[username]['rot'] = 0
					players[username]['apples'] = 0
					players[username]['displaystate'] = 3
					players[username]['ghost'] = True
					players[username]['teleport_time'] = 1;
					players[username]['webtime'] =  0;
					players[username]['rage'] = False

					


					#NOTE: delete the projectile element for this user after they leave
					projectiles[username] = []

					reply = 'A:' + username
					if(dev):
						reply = 'A.' + username
			elif (data[0] == 'S'):
				#request to actually spawn the player, after loading all of the resources
				location = getSpawnLocation(start_size * 20)
				players[username]['rot'] = random.random() * math.pi * 2
				players[username]['apples'] = 0
				if(dev):
						players[username]['apples'] = 100
				players[username]['displaystate'] = 3
				players[username]['ghost'] = False
				players[username]['teleport_time'] = 1;
				players[username]['webtime'] =  0;
				players[username]['x'] = location[0]
				players[username]['y'] = location[1]
				players[username]['rage'] = False
				print("spawned player at x, y", players[username]['x'], ',', players[username]['y'])
				players[username]['ghost'] = False
				alert_loss = False

			else:
				receive = json.loads(data)

				# UPDATE BASED ON DATA RECEIVED FROM CLIENT
				#update the player's x and y value
				players[username]['x'] += receive['dx']
				players[username]['y'] += receive['dy']
				players[username]['rot'] = receive['rot']

				if(players[username]['x'] >= edgeofmaprange):
					players[username]['x'] = edgeofmaprange
				if(players[username]['x'] <= -1 * edgeofmaprange):
					players[username]['x'] = -1 * edgeofmaprange
				if(players[username]['y'] >= edgeofmaprange):
					players[username]['y'] = edgeofmaprange
				if(players[username]['y'] <= -1 * edgeofmaprange):
					players[username]['y'] = -1 * edgeofmaprange

				if(players[username]['displaystate'] > 1):
					players[username]['displaystate'] = receive['displaystate']
				else:
					if(players[username]['displaystate'] <= -1):
						#recover from the injury
						players[username]['displaystate'] += 0.02
						if(players[username]['displaystate'] > -1):
							players[username]['displaystate'] = 3

					elif(players[username]['displaystate'] <= 1):
						#going invisible
						players[username]['displaystate'] -= 0.02
						if(players[username]['displaystate'] < 0):
							players[username]['displaystate'] = 0


				playerx = players[username]['x'] 
				playery = players[username]['y']

				if(players[username]['webtime'] > 0):
					players[username]['webtime'] -= 1

				playersize = applesToSize(players[username]['apples'])

				#DECAY
				players[username]['apples'] -= decayRate(players[username]['apples'])

				renderRange = receive['renderrange']

				applemultiplier = 1

				harvestrange = 0

				# CREATE DATA TO SEND BACK
				# if the client needs to know anything temporary (ex: play the munching sounds if it ate an apple, send a ping back to client)
				feedback = {}
				feedback ['p'] = 0
				feedback ['queen'] = ''
				feedback ['queen'] = queen

				players[username]['rage'] = False;

				#print('REQUESTS',receive['requests'])
				for key in receive['requests']:
					decloak = False;
					#print('key = ', key)
					#print('data type of receive[requests]:',type(receive['requests']))
					if(key == 'rage'):
						players[username]['rage'] = True;
						decloak = True;
					elif(key == 'harvest'):
						harvestrange = receive['requests'][key]
					elif(key == 'cloak'):
						players[username]['displaystate'] = 1
					elif(key == 'teleport'):
						players[username]['teleport_time'] -= teleportspeed
					elif(key == 'dropcrown'):
						respawnCrown(username)

					elif(key == 'projectile'):
						#print("PROJECTILE MADE")
						if(receive['requests']['projectile'] == 'harbloo'):
							decloak = True;
							if(dev and username == 'dev'):
								players[username]['apples'] -= 20;
							#print("HARBLOO MADE")
							projectilesize =  projectileinitialsize[0] + playersize * projectileproportion[0]
							projectilestartx = players[username]['x']  + math.cos(players[username]['rot']) * (playersize - projectilesize) * 0.5
							projectilestarty = players[username]['y']  + math.sin(players[username]['rot']) * (playersize - projectilesize) * 0.5

							projectiles[username].append({'x':projectilestartx,'y':projectilestarty,'size':projectilesize,'ttl':projectile_ttl[0],'direction':players[username]['rot'],'t':0,'src':0})
						elif(receive['requests']['projectile'] == 'burst'):
							decloak = True;
							#print("BURST MADE")
							projectilesize = projectileinitialsize[1] + playersize * projectileproportion[1]
							rotate = 0
							for a in range(0, 8):

								projectilestartx = players[username]['x']  + math.cos(players[username]['rot'] + a * math.pi / 4) * (playersize - projectilesize) * 0.5
								projectilestarty = players[username]['y']  + math.sin(players[username]['rot'] + a * math.pi / 4) * (playersize - projectilesize) * 0.5

								projectiles[username].append({'x':projectilestartx,'y':projectilestarty,'size':projectilesize,'ttl':projectile_ttl[1],'direction':players[username]['rot'] + a * math.pi / 4,'t':1,'src':0})
						elif(receive['requests']['projectile'] == 'web'):
							#print("WEB MADE")
							projectilesize = projectileinitialsize[2] + playersize * projectileproportion[2]

							projectilestartx = players[username]['x']  - math.cos(players[username]['rot']) * (playersize - projectilesize) * 0.5
							projectilestarty = players[username]['y']  - math.sin(players[username]['rot']) * (playersize - projectilesize) * 0.5

							projectiles[username].append({'x':projectilestartx,'y':projectilestarty,'size':projectilesize,'ttl':projectile_ttl[2],'direction':players[username]['rot'] + math.pi,'t':2,'src':0})
						elif(receive['requests']['projectile'] == 'tractor'):
							#print("TRACTOR MADE")
							projectilesize = projectileinitialsize[3] + playersize * projectileproportion[3]
							projectilestartx = players[username]['x']  - math.cos(players[username]['rot']) * (playersize - projectilesize) * 0.5
							projectilestarty = players[username]['y']  - math.sin(players[username]['rot']) * (playersize - projectilesize) * 0.5

							projectiles[username].append({'x':projectilestartx,'y':projectilestarty,'size':projectilesize,'ttl':projectile_ttl[3],'direction':players[username]['rot'] + math.pi,'t':3,'src':0})

						elif(receive['requests']['projectile'] == 'beam'):
							decloak = True;
							print("BEAM MADE")
							projectilesize = projectileinitialsize[4] + playersize * projectileproportion[4]
							projectilestartx = players[username]['x']  + math.cos(players[username]['rot']) * (playersize - projectilesize) * 0.5
							projectilestarty = players[username]['y']  + math.sin(players[username]['rot']) * (playersize - projectilesize) * 0.5

							projectiles[username].append({'x':projectilestartx,'y':projectilestarty,'size':projectilesize,'ttl':projectile_ttl[4],'direction':players[username]['rot'],'t':4,'src':[projectilestartx, projectilestarty]})

						
					if(decloak):
						if(players[username]['displaystate'] >= 0):
							players[username]['displaystate'] = 3;
					if(key == 'buycard'):
						cardidbought = receive['requests']['buycard']['card']

						players[username]['apples'] -= receive['requests']['buycard']['applecost']
						#print()

						if(cardidbought != 0):
							location = getSpawnLocation(carddiameter)

							cards[cardidbought]['x'] = location[0]
							cards[cardidbought]['y'] = location[1]

							cards[cardidbought]['card'] = getNewCard(cardidbought)

							#

						if(cardidbought == 0):
							#bought the crown card
							cards[0]['x'] = 77777
							#this means that the crown is in someone's hand
							print('bought the queen card, username', username)

							queen = username



					if(key == 'honeycrisp'):
						applemultiplier = 2

					if(key == 'p'):
						feedback['p'] = 1

				if(players[username]['teleport_time'] < 1):
					players[username]['teleport_time'] -= teleportspeed
					if( abs(players[username]['teleport_time'] -0) < 0.001):
						#print("TELEPORT")
						respawnlocation = [0, 0]
						teleportcenter = [players[username]['x'] + math.cos(players[username]['rot']) * teleportdistance,players[username]['y'] + math.sin(players[username]['rot']) * teleportdistance]
						teleport_tolerance = 0
						while True:
							respawnlocation = getSpawnLocation(playersize)
							if(math.dist(respawnlocation, teleportcenter  ) < teleportrange + teleport_tolerance):
								break
							teleport_tolerance += 50
						players[username]['x'] = respawnlocation[0]
						players[username]['y'] = respawnlocation[1]

					if(players[username]['teleport_time'] < -1):
						players[username]['teleport_time'] = 1


				

				# what is in range of the client, what should it render?
				display = {'apples':[],'players':[],'cards':[],'projectiles':[]}

				# finds the cards that are close to the player:
				for c in cards:
					#scale = (((players[username]['size']-100)*0.1)+100) / 100
					if (c['x'] != 77777 and math.dist([c['x'], c['y']], [playerx, playery]) < (renderRange + carddiameter)):

						display['cards'].append( {'x':c['x']-playerx,'y':c['y']-playery,'card':c['card'],'id':c['id']} )

						# buyrange = (carddiameter + playersize )/2
						# if ((math.dist([c['x'], c['y']], [playerx, playery]) < buyrange) and (players[username]['apples'] >= c['cost'])):
						# 	players[username]['apples'] -= c['cost']
						# 	feedback['addcard'] = c['card']

						# 	location = getSpawnLocation(carddiameter)

						# 	c['x'] = location[0]
						# 	c['y'] = location[1]
						# 	c['card'] =random.randint(0,numcards - 1)

				# finds the apples that are close to the player:
				for index in range(len(apples) - 1, -1, -1):
					a = apples[index]
					#scale = (((players[username]['size']-100)*0.1)+100) / 100
					if (math.dist([a['x'], a['y']], [playerx, playery]) < (renderRange + applediameter)):
						#if harvesting, move the apple towards the location

						if(a['harvested'] == username):
							dist = math.dist([a['x'], a['y']], [playerx, playery])
							dx = a['x'] - playerx
							dy = a['y'] - playery

							a['x'] -= appleHarvestSpeed * dx / dist
							a['y'] -= appleHarvestSpeed * dy / dist



						#check if nearby apples are to be harvested from the CARD effect
						if (harvestrange > 0) and (math.dist([a['x'], a['y']], [playerx, playery]) < harvestrange + applediameter / 2) and a['temp'] == '':
							a['harvested'] = username

						#check if nearby apples are touching, they will be harvested naturally (for the animation)
						eatrange = (applediameter + playersize )/2
						if (math.dist([a['x'], a['y']], [playerx, playery]) < eatrange):
							#make sure that temp apples can only be harvested this way
							if(not(a['temp'] == 'yes' and a['harvested'] != username)):
								a['harvested'] = username



						#check if they can actually consume the apple:
						#the consumption occurs when the apple reaches the center of the player
						if (math.dist([a['x'], a['y']], [playerx, playery]) < applediameter):
							#make sure that temp apples can only be eaten this way by the player who deserves them
							if(not(a['temp'] == 'yes' and a['harvested'] != username)):
								

								if(a['temp'] == ''):
									players[username]['apples'] += 1 * applemultiplier
									location = getSpawnLocation(applediameter)
									a['x'] = location[0]
									a['y'] = location[1]
									a['harvested'] = ''
								else:
									players[username]['apples'] += 0.8 * applemultiplier
									#delete the temporary apple
									apples.pop(index)
								
								feedback['munch'] = True
								#yum!

						else:
							display['apples'].append( {'x':a['x']-playerx,'y':a['y']-playery} )
					#index ++

				#find the players that are close to the player:
				for p in players:
					#don't include players that have lost
					if(players[p]['ghost'] == False):

						opponent_size = applesToSize(players[p]['apples'])

						if (math.dist([players[p]['x'], players[p]['y']], [playerx, playery]) < renderRange + applesToSize(players[p]['apples'])):
							playerinfo = {'name':p,'x':players[p]['x']-playerx,'y':players[p]['y']-playery,'rot':players[p]['rot'] + players[p]['teleport_time'] * 2 * math.pi,'size':opponent_size * players[p]['teleport_time'],'displaystate':players[p]['displaystate'],'webbed':(players[p]['webtime'] > 0),'rage':players[p]['rage']}
							display['players'].append(playerinfo)

							#check if they are fighting:
							fightrange = (opponent_size  + playersize) / 2
							if (p != username and math.dist([players[p]['x'], players[p]['y']], [playerx, playery]) < fightrange and ((players[username]['apples'] > players[p]['apples']) or players[username]['rage']) and players[p]['apples'] >= 0):
								if(players[username]['displaystate'] >= 0):
									players[username]['displaystate'] = 3
								multiplier = 1
								if(players[username]['rage']):
									multiplier = 3.5
									if(players[username]['apples'] > players[p]['apples']):
										multiplier = 2
									
								players[username]['apples'] += 0.16 * multiplier
								players[p]['apples'] -= 0.22 * multiplier
								feedback['munch'] = True
								players[p]['displaystate'] = -1.4
								if(players[p]['apples'] < 0):
									players[p]['ghost'] = True

				for p in projectiles:
					for projectile in projectiles[p]:
						#print('dist returns:',math.dist([projectile['x'], projectile['y']], [playerx, playery]))
						if (math.dist([projectile['x'], projectile['y']], [playerx, playery]) < renderRange + projectile['size']):
							display['projectiles'].append({'x':projectile['x'] - playerx,'y':projectile['y'] - playery,'size':projectile['size'],'type':projectile['t'],'d':projectile['direction'],'src':projectile['src']})

				#generate the array of players to print on the client side
				# players.items() = [ ('bob',{'x':3,'y':4}) , ('joe',{'x':4,'y':38,'rot':4,'size':400}) ]
				players_array_sorted = sorted(players.items(), key = lambda player : player[1]['apples'] , reverse = True)
				players_dictionary_sorted = dict(players_array_sorted)

				# a ping for the data in the server (e.g. nearby players, players list)
				if(players[username]['apples'] < 0 and (alert_loss == False)):
					# print('clearing projectiles')
					alert_loss = True
					reply += 'L'
					players[username]['ghost'] = True

					projectiles[username].clear()
				else:
					reply += json.dumps({'players':players_dictionary_sorted, 'display':display, 'feedback':feedback})
				

			#reply = f"Data recieved as:  {data}!"
			# print("reply:", reply)
			await websocket.send(reply)
		except Exception as e:
			print(e)
			traceback.print_exc()
			print("CONNECTION ENDED")

			if(queen == username):
				respawnCrown(username)

			if(username != ''):
				projectiles[username].clear()
				players.pop(username)
				for index in range(len(apples) - 1, -1, -1):
					if(apples[index]['harvested'] == username):
						apples.pop(index)
				#pop the temporary apples

			



			#players[username]
			break

def respawnCrown(username):
	location = getSpawnLocation(carddiameter)
	cards[0]['x'] = players[username]['x']
	cards[0]['y'] = players[username]['y']
	print('respawning the queen card')
	print('new x, y = ', cards[0]['x'], cards[0]['y'])
	global queen
	queen = ''


def respawnCard():
	randomCard = random.randint(1, len(cards) - 1)
	location = getSpawnLocation(carddiameter)

	cards[randomCard]['x'] = location[0]
	cards[randomCard]['y'] = location[1]
	cards[randomCard]['card'] = getNewCard(randomCard)

def card_respawner():
	while True:
		time.sleep(20)
		print('respawning card...')
		respawnCard()


def server_functions():
	while True:
		#print('server functions')
		#functions on the server to execute every 40 ms, these include
		#  ~moving projectiles and checking for hit

		for username in players:
			#print('updating projectiles for player', username)
			for index in range(len(projectiles[username]) - 1, -1, -1):
				projectile = projectiles[username][index]
				projectile['ttl'] -= 1;
				if(projectile['ttl'] < 0):
					projectiles[username].pop(index)
					continue

				projectiletype = projectile['t']

				if(projectiletype == 2):
					timesincespawn = projectile_ttl[2]-projectile['ttl']
					if(timesincespawn < webmovementime):
						projectile['x'] += (webmovementime - timesincespawn) * math.cos(projectile['direction']) * projectile_speed[2] / webmovementime
						projectile['y'] += (webmovementime - timesincespawn) * math.sin(projectile['direction']) * projectile_speed[2] / webmovementime
				else:
					projectile['x'] += projectile_speed[projectiletype] * math.cos(projectile['direction'])
					projectile['y'] += projectile_speed[projectiletype] * math.sin(projectile['direction'])

				#check for collision with another player
				for p in players:
					if((p != username) and math.dist([projectile['x'],projectile['y']],[players[p]['x'], players[p]['y']]) < (projectile['size'] + applesToSize(players[p]['apples']))*0.5 and players[p]['ghost'] == False):
						#collision, player is injured and player who shot collects apples
						beforeapples = math.floor(players[p]['apples'])
						players[p]['apples'] -= projectile_damage[projectiletype]
						afterapples = math.floor(players[p]['apples'])
						if(projectiletype == 2):
							players[p]['webtime'] = webstalltime

						for a in range(0, int(beforeapples - afterapples)):
							victimsize = math.floor(applesToSize(players[p]['apples']) * 0.5)
							apples.append({'x':players[p]['x'] + random.randint(-victimsize,victimsize), 'y': players[p]['y']+random.randint(-victimsize,victimsize),'harvested' : username,'temp':'yes'})
						if(projectiletype != 3 and projectiletype != 4):
							try:
								projectiles[username].pop(index)
							except:
								print("CAUGHT ERORR: failed to pop projectile")
						players[p]['displaystate'] = -2

				#tractor can harvest apples
				if(projectiletype == 3):
					harvestrange = projectile['size'] * 1
					for a in apples:
						if (math.dist([a['x'], a['y']], [projectile['x'], projectile['y']]) < harvestrange + applediameter / 2) and a['temp'] == '':
							a['harvested'] = username


		time.sleep(0.015)

y = threading.Thread(target = card_respawner)
y.start()

z = threading.Thread(target = server_functions)
z.start()


start_server = websockets.serve(handler, LOCAL_ADDRESS, 9000)
# print('server started')
 
asyncio.get_event_loop().run_until_complete(start_server)
#asyncio.get_event_loop().run_until_complete(server_functions)
asyncio.get_event_loop().run_forever()


# with ThreadPoolExecutor(max_workers = 10) as threader:
# 	while True:
# 		threader.submit(start_server)
# 		threader.submit(server_functions)



#asyncio.get_event_loop().run_forever()
