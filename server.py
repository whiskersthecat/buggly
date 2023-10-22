import socket
import hashlib, base64
import traceback

from concurrent.futures import ThreadPoolExecutor
#HOSTNAME = '192.168.1.17'
HOSTNAME = '192.168.1.14'
#HOSTNAME = '135.180.135.14'
HOSTNAME = '10.0.0.141'
#HOSTNAME = '73.2.104.162'
PORT = 8000

#192.168.1.17:8000

EXTENSION_CODES = {'.png':'image/png','.js':'application/javascript','.html':'text/html','.ico':'image/x-icon','.jpg':'image/jpeg','.m4a':'audio/m4a'}

def convertKeyToAccept(key):
	append = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
	hashed = hashlib.sha1((key + append).encode('utf-8'))
	return base64.b64encode(hashed.digest()).decode()

def sync_websocket(socket, request):

	#send back a websocket sync

	#find the key of the request
	index = request.find('Sec-WebSocket-Key:')
	i = index + 19
	while True:
		if(request[i] == '\n'):
			break
		i +=1
	key = request[index + 19: i]

	accept = convertKeyToAccept(key)
	print("key:",key)
	

	message = ''
	message += 'HTTP/1.1 101 Switching Protocols\r\n'
	message += 'Upgrade: websocket\r\n'
	message += 'Connection: Upgrade\r\n'
	
	#message += 'Sec-WebSocket-Protocol: soap\r\n'
	
	message += 'Sec-WebSocket-Accept: ' + accept + '\r\n'
	message += 'Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits=12\r\n'
	message += 'Server: Python/3.10 websockets/10.4\r\n\r\n'



	print("Sending back:\n" + message)

	socket.sendall(message.encode('utf-8'))


def get_file(socket, directory, extensioncode, client_id):

	#send back resource
			
	file = open(directory, 'rb')
	filebytes = file.read()
	message = ''
	message += 'HTTP/1.1 200 OK\n'
	message += 'Connection: keep-alive\n'
	message += 'Content-Length: ' + str(len(filebytes)) + '\n'
	if(not(extensioncode == 'na')):
		message += 'Content-Type: ' + extensioncode + '\n\n'

	#print("Sending back:\n", message)

	socket.sendall(message.encode('utf-8')  + filebytes)
	#print("send back on connection ", client_id)

	file.close()


def client_handler(socket, addr, client_id):
	try:
		print("New client connected: client", client_id)
		while True:
			message = socket.recv(1024)
			try:
				message = message.decode('ascii')
			except Exception:
				print("the message couldn't be decoded, printing the raw bytes")
				print(message)
			print("Message received on client:",client_id,'\n', message)
			directory = ''
			extension = ''
			extensioncode = ''
			i = 5
			if(message[0:3] == 'GET'):
				while True:
					if(message[i] == ' '):
						break
					directory += message[i]
					i+=1

				if(directory == ''):
					directory = "main.html"

				if(directory == 'websocketrequest'):
					sync_websocket(socket, message)

				else:
					print("Message requests directory:",directory)
					i = len(directory) - 1
					while True:
						if(directory[i] == '.'):
							break
						i-=1
					extension = directory[i:]
					print("Message has extension:", extension)
					extensioncode = EXTENSION_CODES[extension]
					get_file(socket, directory, extensioncode, client_id)

			elif not(message):
				print("Empty packet, connection closed")
				socket.close()
				break

	except Exception as e:
		print(e)

		traceback.print_exc()
		return e


#socket.socket(Ip Version, Transport layer protocol)
#server
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
	connectionnumber = 1
	s.bind((HOSTNAME, PORT))
	s.listen()
	print("Listening on Host, Port", HOSTNAME, PORT)

	with ThreadPoolExecutor(max_workers = 1000) as threader:
		try:
			while True:
				socket, clientaddr = s.accept()
				print('##CONNECTED TO CLIENT with address:', clientaddr[0], clientaddr[1])
				threader.submit(client_handler, socket, clientaddr, connectionnumber)
				connectionnumber += 1
		except Exception as e:
			print("Error occured in thread:", e)
			s.close()

	s.close()