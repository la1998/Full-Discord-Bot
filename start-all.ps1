Start-Process powershell -ArgumentList 'cd ./backend; npm install; node index.js' -NoNewWindow
Start-Process powershell -ArgumentList 'cd ./frontend; npm install; npm run dev' -NoNewWindow
