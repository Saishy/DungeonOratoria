# DungeonOratoria
A discord bot to request data from the Memoria Freese game

## How to Install
- Run **npm install** to install all required packages.
- You will need a valid **Token** for a working **Discord Bot** from http://discordapp.com/developers/applications/me.
- Set an ENV variable called **TOKEN** with your valid token.

## Optional
If you want events to work:
- Install a **redis** server and get it's port.
- Set another ENV variable called **EVENTS** to ***true***.
- Set two ENV variables called **REDIS_PORT** and **REDIS_PWD** to your redis server port and password (if set).
