# WorkAround
Context-aware productivity space advisor for remote workers and students.

Usage requires a Google Maps API Key. After obtaining your Google Maps API key, create a file called ".env" in the root directory that contains:
```
GOOGLE_MAPS_API_KEY=[Google Maps API Key]
PORT=3000
```
The ".env" will be ignored by Git thorugh ".gitignore", so the API key won't be visible to others.

To run the app, open a terminal in the root folder. Then run on your computer (install Node.js if not installed):

`npm start`

To access the app, visit the following on your browser:

Computer: `http://localhost:3000`

Mobile: `http://192.168.x.x:3000` (using your computer's machine's LAN IP address; on Windows, type "ipconfig" and look for IPv4 Address); on Mac, "System Settings" > "Network" > [active network] > "Details"/"Advanced" > [IPv4 address]").

To rebuild the locations database (heavy Google Maps API usage), use the following command:

`node crawler.js`
