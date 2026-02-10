# WorkAround
Context-aware productivity space advisor for remote workers and students.

---
Set up
---
Usage requires a Google Maps API Key. After obtaining your Google Maps API key, create hidden files to store your Google Maps API key.

Backend:
In `root` directory, create a file called `.env` that contains:
```
GOOGLE_MAPS_API_KEY=[Google Maps API Key]
PORT=3000
```

Frontend:
In `frontend` directory, create a file called `.env` that contains:
```
VITE_GOOGLE_MAPS_API_KEY=[Google Maps API Key]
```

The `.env` will be ignored by Git thorugh ".gitignore", so the API key won't be visible to others.

---
Run
---
To run the app, run on your computer (install Node.js if not installed) these commands:

Backend:
In `root` directory, open a terminal and run:
`node server.js`

Frontend:
In `frontend` folder, open a aterminal and run:
`npm run dev` 

To access the app, visit the following on your browser:

Computer: `http://localhost:5173`

Mobile: `http://192.168.x.x:5173` (using your computer's machine's LAN IP address; on Windows, type "ipconfig" and look for IPv4 Address); on Mac, "System Settings" > "Network" > [active network] > "Details"/"Advanced" > [IPv4 address]").

To rebuild the locations database (warning: heavy Google Maps API usage), use the following command in `root` directory:

`node crawler.js`
