# Agora example of DeepAR Web SDK 

- Go to https://developer.deepar.ai
  - Sign up
  - Create a project and a Web app
  - Copy the license key
  - Paste it into `src/index.js` (replace `your_license_key_goes_here`)
- Sign up on Agora.
  - Create a project and get the App ID.
  - Generate a temp RTC token. Get the token and the channel name associated with it.
- Paste the App ID, RTC token, and channel name into `src/index.js`.
- Open the terminal in the root of the project
  - Run `npm install`
  - Run `npm run dev`
  - If the browser doesn't open automatically, open http://localhost:8888
  - Open http://localhost:8888 in another tab or browser to join as a second user
