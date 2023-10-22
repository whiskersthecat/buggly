# buggly
Online multiplayer io game

# Usage
Download all of the files in this repository.
Then, follow the instructions below in the file websocketserver.py

# TO SETUP BUGGLY
  >> 1. Find your devices LOCAL IP address in the Wifi settings
			this is the IP assigned by the router. This can change occasionally when the lease expires!
  >> 2. Change the local address below to bind this socket and the HTTP server socket
   >>   Also, change the local address in the HTTP server (server.py) variable HOSTNAME
  >> 3. Then, sign into the router to enable port forwarding 8000 - 9000 to this device
  >> 4. Start to terminal sessions and run both python scripts
  >> 5. Determine your public IP address by using a google search tool, and share this 'ADDRESS:9000' to others
