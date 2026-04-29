# Notion 講義 → W3Schools 題目對照表

兩份 Notion 講義主題對應到 `data/w3s-*-exercises.json` 與 `data/w3s-nodejs-quiz.json` 的具體題目。
每題附 W3Schools URL（可直接點過去寫程式）以及繁體中文翻譯。

題型說明：**MCQ** 多選題（含答案）／ **FILL** 填空（補完程式碼）／ **DND** 拖拉填空。
每題下方 `🌏` 為中文翻譯（持久化在 `data/translations.json`）。

## 講義 1：Todo List Web API (get/post)

Notion 連結：[講義 1：Todo List Web API (get/post)](https://www.notion.so/mcliu/Todo-List-Web-API-get-post-3494d6634bf680aabe60eb05bb3544e5)

### 為什麼設計 API / API First

> 概念性章節，無對應練習題。可以閱讀 Q4 (Quiz)。

### 建立 Express 專案 / 啟動 server

**`xrcise_express`** (3 題)

- [MCQ] What is Express.js?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_express1)
  - 🌏 Express.js 是什麼？
  - **答案：The most popular web application framework for Node.js**
    - 🌏 Node.js 最熱門的網頁應用程式框架
- [FILL] Complete the code to create a basic Express.js server  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_express2)
  - 🌏 完成建立基本 Express.js 伺服器的程式碼
  - `const express = require('express'); / const app = express(); / app.@(3)('/', (req, res) => { /   res`
- [MCQ] Which method is used to start an Express server?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_express3)
  - 🌏 哪個方法用來啟動 Express 伺服器？
  - **答案：app.listen()**

**`xrcise_get_started`** (3 題)

- [DND] Drag and drop the correct command to run the Node.js file.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_get_started1)
  - 🌏 拖放正確的指令以執行 Node.js 檔案
  - 選項：`run`, `node`, `execute`, `start`
- [FILL] Complete the code to create your first Node.js application:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_get_started2)
  - 🌏 完成建立第一個 Node.js 應用程式的程式碼
  - `let http = require('http'); / http.@(12)(function (req, res) { /   res.writeHead(200, {'Content-Type`
- [MCQ] What does a Node.js file contain?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_get_started3)
  - 🌏 Node.js 檔案包含什麼？
  - **答案：JavaScript code to be executed on the server**
    - 🌏 將在伺服器執行的 JavaScript 程式碼

**`xrcise_intro`** (3 題)

- [DND] Drag and drop the correct word to complete the sentence.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_intro1)
  - 🌏 拖放正確字詞以完成句子
  - 選項：`HTML`, `JavaScript`, `CSS`, `Python`
- [FILL] Complete the code snippet to create a simple Node.js web server  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_intro2)
  - 🌏 完成建立簡單 Node.js 網頁伺服器的程式碼片段
  - `const http = require('http'); / http.@(12)((req, res) => { /   res.writeHead(200, {'Content-Type': '`
- [MCQ] What is Node.js built on?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_intro3)
  - 🌏 Node.js 建構在什麼之上？
  - **答案：Chrome's V8 JavaScript engine**
    - 🌏 Chrome 的 V8 JavaScript 引擎

### Express 路由 (app.get / app.post)

**`xrcise_rest_api`** (3 題)

- [DND] Drag and drop the correct term.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_rest_api1)
  - 🌏 拖放正確的詞彙
  - 選項：`urls`, `methods`, `headers`, `statuses`
- [FILL] Complete the Express code for a RESTful API endpoint:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_rest_api2)
  - 🌏 完成 RESTful API 端點的 Express 程式碼
  - `app.@(3)('/api/users/:id', (req, res) => { /   const userId = req.@(6).id; /   const user = findUser`
- [MCQ] Which HTTP method is commonly used to update a resource?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_rest_api3)
  - 🌏 哪個 HTTP 方法通常用來更新資源？
  - **答案：PUT**

### HTTP 概念 / 狀態碼 / 方法 (GET/POST/PUT/DELETE)

**`xrcise_http`** (3 題)

- [DND] Drag and drop the correct method is used to create an HTTP server in Node.js.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_http1)
  - 🌏 拖放正確的方法（用於在 Node.js 建立 HTTP 伺服器）
  - 選項：`http.server()`, `http.createServer()`, `http.listen()`, `http.makeServer()`
- [FILL] Complete the code for an HTTP server that sends a status code: 200 and a content type: text/html  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_http2)
  - 🌏 完成 HTTP 伺服器程式碼，使其回傳狀態碼 200 與內容類型 text/html
  - `const server = http.createServer((req, res) => { /   res.@(9)(200, {'Content-Type': 'text/html'}); /`
- [MCQ] Which Node.js object represents the HTTP request from the client?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_http3)
  - 🌏 哪個 Node.js 物件代表來自客戶端的 HTTP 請求？
  - **答案：req**

**`xrcise_https`** (3 題)

- [MCQ] What is the default port number for HTTPS?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_https1)
  - 🌏 HTTPS 的預設連接埠是什麼？
  - **答案：443**
- [MCQ] What is the purpose of the 'key' and 'cert' options when creating an HTTPS server in Node.js?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_https2)
  - 🌏 在 Node.js 建立 HTTPS 伺服器時，'key' 與 'cert' 選項的用途是什麼？
  - **答案：They provide the SSL/TLS private key and certificate for the server**
    - 🌏 它們提供伺服器的 SSL/TLS 私鑰與憑證
- [FILL] Complete the code to create a basic HTTPS server:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_https3)
  - 🌏 完成建立基本 HTTPS 伺服器的程式碼
  - `const server = @(5).createServer(options, (req, res) => { /   res.writeHead(200, {'Content-Type': 't`

### 回應方法 (res.send / res.json / res.sendFile)

> 與「Express 路由」共用題目，可重做以強化 res 物件用法。

**`xrcise_rest_api`** (3 題)

- [DND] Drag and drop the correct term.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_rest_api1)
  - 🌏 拖放正確的詞彙
  - 選項：`urls`, `methods`, `headers`, `statuses`
- [FILL] Complete the Express code for a RESTful API endpoint:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_rest_api2)
  - 🌏 完成 RESTful API 端點的 Express 程式碼
  - `app.@(3)('/api/users/:id', (req, res) => { /   const userId = req.@(6).id; /   const user = findUser`
- [MCQ] Which HTTP method is commonly used to update a resource?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_rest_api3)
  - 🌏 哪個 HTTP 方法通常用來更新資源？
  - **答案：PUT**

### 中介軟體 (express.json() / app.use)

**`xrcise_middleware`** (3 題)

- [DND] Drag and drop the correct answer.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_middleware1)
  - 🌏 拖放正確答案
  - 選項：`server`, `app`, `next`, `router`
- [FILL] Complete the Express middleware function:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_middleware2)
  - 🌏 完成 Express middleware 函式
  - `function authenticate(req, res, @(4)) { /   const token = req.@(6)('authorization'); /   if (!token)`
- [MCQ] What happens if you don't call next() in middleware?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_middleware3)
  - 🌏 在 middleware 中不呼叫 next() 會發生什麼？
  - **答案：The request will hang and eventually timeout**
    - 🌏 請求會卡住並最終逾時

### 讀取 GET query 與 POST body

> 同上，重點放在 req.query / req.body 對照。

**`xrcise_middleware`** (3 題)

- [DND] Drag and drop the correct answer.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_middleware1)
  - 🌏 拖放正確答案
  - 選項：`server`, `app`, `next`, `router`
- [FILL] Complete the Express middleware function:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_middleware2)
  - 🌏 完成 Express middleware 函式
  - `function authenticate(req, res, @(4)) { /   const token = req.@(6)('authorization'); /   if (!token)`
- [MCQ] What happens if you don't call next() in middleware?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_middleware3)
  - 🌏 在 middleware 中不呼叫 next() 會發生什麼？
  - **答案：The request will hang and eventually timeout**
    - 🌏 請求會卡住並最終逾時

**`xrcise_rest_api`** (3 題)

- [DND] Drag and drop the correct term.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_rest_api1)
  - 🌏 拖放正確的詞彙
  - 選項：`urls`, `methods`, `headers`, `statuses`
- [FILL] Complete the Express code for a RESTful API endpoint:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_rest_api2)
  - 🌏 完成 RESTful API 端點的 Express 程式碼
  - `app.@(3)('/api/users/:id', (req, res) => { /   const userId = req.@(6).id; /   const user = findUser`
- [MCQ] Which HTTP method is commonly used to update a resource?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_rest_api3)
  - 🌏 哪個 HTTP 方法通常用來更新資源？
  - **答案：PUT**

### 前端 fetch + async/await

**`xrcise_async`** (5 題)

- [DND] Drag and drop the correct model.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_async1)
  - 🌏 拖放正確的模型
  - 選項：`synchronous`, `asynchronous`, `blocking`, `sequential`
- [FILL] Complete the code for asynchronous file read  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_async2)
  - 🌏 完成非同步讀取檔案的程式碼
  - `fs.@(8)('data.txt', 'utf8', (err, @(4)) => { /   console.log(data); / });`
- [MCQ] Which of the following best describes the non-blocking I/O model in Node.js?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_async3)
  - 🌏 下列哪一項最能描述 Node.js 的非阻塞 I/O 模型？
  - **答案：The program continues executing while I/O operations are processed in the background**
    - 🌏 程式繼續執行，I/O 操作在背景處理
- [MCQ] What is 'callback hell' in Node.js?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_async4)
  - 🌏 Node.js 中的「callback hell」是什麼？
  - **答案：Deeply nested callbacks that make code hard to read and maintain**
    - 🌏 深度巢狀的 callback，使程式碼難以閱讀與維護
- [DND] Drag and drop the correct word.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_async5)
  - 🌏 拖放正確字詞
  - 選項：`non-blocking`, `multi-threaded`, `blocking`, `sequential`

**`xrcise_async_await`** (4 題)

- [DND] Drag and drop the correct keyword.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_async_await1)
  - 🌏 拖放正確的關鍵字
  - 選項：`await`, `async`, `then`, `yield`
- [FILL] Complete the code for parallel async  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_async_await2)
  - 🌏 完成平行非同步程式碼（同時等待多個 Promise）
  - `async function getMultipleData() { /   const results = await @(7).@(3)([fetch1(), fetch2()]); /   re`
- [MCQ] What is returned by an async function?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_async_await3)
  - 🌏 async 函式回傳的是什麼？
  - **答案：A Promise**
    - 🌏 一個 Promise 物件
- [DND] Drag and drop the correct answer.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_async_await4)
  - 🌏 拖放正確答案（async/await 的錯誤處理機制）
  - 選項：`then/catch`, `try/catch`, `if/else`, `success/error`

**`xrcise_promises`** (4 題)

- [DND] Drag and drop the correct state to complete the sentence.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_promises1)
  - 🌏 拖放正確的狀態以完成句子（Promise 的三種狀態）
  - 選項：`resolved`, `fulfilled`, `completed`, `successful`
- [FILL] Create a Promise that resolves after a delay  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_promises2)
  - 🌏 建立一個延遲後 resolve 的 Promise
  - `function createDelayedPromise(ms) { /   return new @(7)((resolve, reject) => { /     setTimeout(() =`
- [MCQ] Which method is used to handle errors in a Promise chain?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_promises3)
  - 🌏 哪個方法用於處理 Promise 鏈中的錯誤？
  - **答案：catch()**
- [DND] Drag and drop the correct method name.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_promises4)
  - 🌏 拖放正確的方法名稱（同時等待多個 Promise）
  - 選項：`wait`, `all`, `combine`, `resolve`

### 模組系統 (type:module / import)

**`xrcise_modules_esm`** (3 題)

- [DND] Drag and drop the correct keyword.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_modules_esm1)
  - 🌏 拖放正確的關鍵字（ES module 引入）
  - 選項：`require`, `import`, `include`, `load`
- [FILL] Complete the ES modules syntax:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_modules_esm2)
  - 🌏 完成 ES modules 語法
  - `@(6) { add } @(4) './math.mjs';`
- [MCQ] Which file extension is often used for ES modules in Node.js?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_modules_esm3)
  - 🌏 Node.js 中 ES modules 常用的副檔名是什麼？
  - **答案：.mjs**

**`xrcise_modules`** (3 題)

- [DND] Drag and drop the correct syntax to import the HTTP module.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_modules1)
  - 🌏 拖放正確的語法以匯入 HTTP 模組
  - 選項：`name`, `default`, `require`, `*`
- [FILL] Create a module named myDateTime:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_modules2)
  - 🌏 建立名為 myDateTime 的模組（CommonJS 匯出）
  - `@(7).myDateTime = function () { /   return Date(); / };`
- [MCQ] Which of the following is correct way to import your own module?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_modules3)
  - 🌏 下列哪一項是匯入自訂模組的正確方式？
  - **答案：const myMod = require('./mymodule');**

### NPM / package.json

**`xrcise_npm`** (4 題)

- [DND] Drag and drop the correct syntax to install a package from npm:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_npm1)
  - 🌏 拖放正確語法以從 npm 安裝套件
  - 選項：`get`, `npm`, `save`, `local`
- [FILL] Complete the command to list the module globally:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_npm2)
  - 🌏 完成全域安裝模組的指令
  - `npm install @(2) http-server`
- [MCQ] Which command updates all packages to their latest versions according to semantic versioning?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_npm3)
  - 🌏 哪個指令依語意化版本（semver）將所有套件更新至最新版？
  - **答案：npm update**
- [MCQ] Which command removes a package from your node_modules directory?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_npm4)
  - 🌏 哪個指令從 node_modules 資料夾移除套件？
  - **答案：npm uninstall package-name**

**`xrcise_package_json`** (3 題)

- [DND] Drag and drop the correct field name.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_package_json1)
  - 🌏 拖放正確的欄位名稱（指定進入點檔案）
  - 選項：`point`, `main`, `entry`, `index`
- [FILL] Complete the minimal package.json file:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_package_json2)
  - 🌏 完成最小可用的 package.json 檔案
  - `{ /   "@(4)": "my-node-app", /   "@(7)": "1.0.0", /   "main": "index.js", /   "scripts": { /     "st`
- [MCQ] Which command creates a new package.json file with default values?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_package_json3)
  - 🌏 哪個指令以預設值建立新的 package.json 檔案？
  - **答案：npm init -y**

## 講義 2：Express + SQLite（電影台詞）

Notion 連結：[講義 2：Express + SQLite（電影台詞）](https://www.notion.so/mcliu/Express-JS-SQLite-3514d6634bf680d8b6a2f47ba606796b)

### 建立 SQLite table (CREATE TABLE)

> W3Schools 沒 SQLite 專屬 topic，但 MySQL CRUD 概念 100% 可遷移

**`xrcise_mysql_create_table`** (3 題)

- [DND] Drag and drop the correct SQL statement.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_create_table1)
  - 🌏 拖放正確的 SQL 語句（建立資料表）
  - 選項：`CREATE TABLE`, `MAKE TABLE`, `NEW TABLE`, `INSERT TABLE`
- [MCQ] Which SQL clause creates an auto-incrementing primary key column?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_create_table2)
  - 🌏 哪個 SQL 子句建立自動遞增的主鍵欄位？
  - **答案：INT AUTO_INCREMENT PRIMARY KEY**
    - 🌏 註：SQLite 對應的是 `INTEGER PRIMARY KEY AUTOINCREMENT`
- [MCQ] Which SQL statement is used to add a primary key to an existing table?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_create_table3)
  - 🌏 哪個 SQL 語句用於將主鍵加到現有表格？
  - **答案：ALTER TABLE**

### 新增資料 (INSERT)

**`xrcise_mysql_insert`** (3 題)

- [DND] Drag and drop the correct SQL statement.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_insert1)
  - 🌏 拖放正確的屬性名稱（取得受影響的列數）
  - 選項：`rowsAffected`, `affectedRows`, `changedRows`, `rowsChanged`
- [FILL] Complete the code to insert a record into a MySQL table:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_insert2)
  - 🌏 完成將資料列插入 MySQL 表格的程式碼
  - `// Insert a record into the "customers" table / const sql = "@(11) customers (name, address) VALUES `
- [MCQ] Which property of the result object gives you the ID of the inserted row?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_insert3)
  - 🌏 result 物件的哪個屬性給你插入資料列的 ID？
  - **答案：result.insertId**
    - 🌏 註：SQLite 用 `this.lastID`（在 `db.run` callback 內）

### 查詢資料 (SELECT + WHERE / LIKE)

**`xrcise_mysql_select`** (4 題)

- [DND] Drag and drop the correct SQL statement.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_select1)
  - 🌏 拖放正確的 SQL 語句（查詢資料）
  - 選項：`FETCH`, `SELECT`, `GET`, `RETRIEVE`
- [FILL] Complete the code to select all records from a MySQL table:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_select2)
  - 🌏 完成查詢 MySQL 表格所有資料列的程式碼
  - `// Select all records from the "customers" table / connection.query("@(13) customers", function (err`
- [MCQ] How do you access the address of the third record in a query result?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_select3)
  - 🌏 如何存取查詢結果中第三筆紀錄的 address 欄位？
  - **答案：result[2].address**
- [MCQ] Which parameter of the query callback function contains information about each field in the result?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_select4)
  - 🌏 查詢 callback 函式的哪個參數包含結果中每個欄位的資訊？
  - **答案：The third parameter (fields)**
    - 🌏 第三個參數（fields）

**`xrcise_mysql_where`** (3 題)

- [DND] Drag and drop the correct SQL clause.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_where1)
  - 🌏 拖放正確的 SQL 子句（條件過濾）
  - 選項：`FILTER`, `WHERE`, `HAVING`, `CONDITION`
- [FILL] Complete the code to safely use user input in a query with placeholders:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_where2)
  - 🌏 完成程式碼：在查詢中安全地使用使用者輸入（用 placeholder 防 SQL injection）
  - `// Safely query with user-provided address / const userAddress = 'Mountain 21'; / const sql = 'SELEC`
- [MCQ] Which is the safest way to include user input in a SQL query?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_where3)
  - 🌏 哪一種方式最能安全地把使用者輸入放進 SQL 查詢？
  - **答案：Use ? as a placeholder and pass values as an array**
    - 🌏 使用 ? 當 placeholder 並把值用陣列傳入

### 更新資料 (UPDATE 票數+1)

**`xrcise_mysql_update`** (3 題)

- [DND] Drag and drop the correct SQL statement.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_update1)
  - 🌏 拖放正確的 SQL 語句（更新資料）
  - 選項：`MODIFY`, `CHANGE`, `UPDATE`, `ALTER`
- [FILL] Complete the code to update records in a MySQL table:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_update2)
  - 🌏 完成更新 MySQL 表格資料列的程式碼
  - `// Update the address for customers named 'John' / const sql = "@(6) customers @(3) address = 'Highw`
- [MCQ] What happens if you omit the WHERE clause in an UPDATE statement?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_update3)
  - 🌏 UPDATE 語句省略 WHERE 子句會發生什麼？⚠️
  - **答案：All records will be updated**
    - 🌏 所有資料列都會被更新（危險！）

### 排序與分頁 (ORDER BY / LIMIT)

**`xrcise_mysql_orderby`** (3 題)

- [DND] Drag and drop the correct SQL clause.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_orderby1)
  - 🌏 拖放正確的 SQL 子句（排序）
  - 選項：`SORT BY`, `ORDER BY`, `ARRANGE BY`, `SEQUENCE BY`
- [FILL] Complete the code to sort results in descending order:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_orderby2)
  - 🌏 完成將結果倒序排序的程式碼
  - `// Sort results by name in reverse alphabetical order / connection.query("SELECT * FROM customers OR`
- [MCQ] What does the '%' wildcard represent?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_orderby3)
  - 🌏 '%' 萬用字元代表什麼？
  - **答案：Any number of characters**
    - 🌏 任意數量的字元（含 0 個）

**`xrcise_mysql_limit`** (3 題)

- [DND] Drag and drop the correct SQL clause.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_limit1)
  - 🌏 拖放正確的 SQL 子句（限制筆數）
  - 選項：`MAX`, `LIMIT`, `RESTRICT`, `TOP`
- [FILL] Complete the code to fetch records starting from a specific position:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_limit2)
  - 🌏 完成從指定位置開始抓取資料列的程式碼（分頁）
  - `// Return 5 records starting from position 3 (the 4th record) / const sql = "SELECT * FROM customers`
- [MCQ] Which of the following is equivalent to 'LIMIT 5 OFFSET 2'?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_limit3)
  - 🌏 下列哪一項等同於 'LIMIT 5 OFFSET 2'？
  - **答案：LIMIT 2, 5**
    - 🌏 MySQL 簡寫語法（offset, count）

### 刪除資料 (DELETE)

**`xrcise_mysql_delete`** (3 題)

- [MCQ] Which property of the result object shows how many rows were deleted?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_delete1)
  - 🌏 result 物件的哪個屬性顯示刪除了幾筆資料列？
  - **答案：result.affectedRows**
- [FILL] Complete the code to delete records from a MySQL table:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_delete2)
  - 🌏 完成從 MySQL 表格刪除資料列的程式碼
  - `// Delete records where address is "Mountain 21" / const sql = "@(11) customers WHERE address = 'Mou`
- [MCQ] What happens if you omit the WHERE clause in a DELETE statement?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_delete3)
  - 🌏 DELETE 語句省略 WHERE 子句會發生什麼？⚠️
  - **答案：All records will be deleted**
    - 🌏 所有資料列都會被刪除（危險！）

### MySQL 連線基礎（觀念遷移到 sqlite3）

**`xrcise_mysql`** (3 題)

- [DND] Drag and drop the correct method name.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql1)
  - 🌏 拖放正確的方法名稱（執行 SQL 查詢）
  - 選項：`execute`, `query`, `run`, `sql`
- [FILL] Complete the code to create a MySQL connection:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql2)
  - 🌏 完成建立 MySQL 連線的程式碼
  - `const mysql = require('mysql'); / const connection = mysql.@(16)({ /   host: "localhost", /   user: `
- [MCQ] What is the correct way to handle errors in MySQL operations?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql3)
  - 🌏 在 MySQL 操作中處理錯誤的正確方式是什麼？
  - **答案：Check the 'err' parameter in callback functions**
    - 🌏 檢查 callback 函式中的 'err' 參數

**`xrcise_mysql_create_db`** (3 題)

- [DND] Drag and drop the correct SQL statement.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_create_db1)
  - 🌏 拖放正確的 SQL 語句（建立資料庫）
  - 選項：`CREATE NEW DATABASE`, `CREATE DATABASE`, `NEW DATABASE`, `MAKE DATABASE`
- [FILL] Complete the code to create a MySQL database:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_create_db2)
  - 🌏 完成建立 MySQL 資料庫的程式碼
  - `// Create a database named "mydb" / connection.query("@(15) mydb", function (err, result) { /   if (`
- [MCQ] Which of the following correctly creates a MySQL database named 'testdb'?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_mysql_create_db3)
  - 🌏 下列哪一項正確建立名為 'testdb' 的 MySQL 資料庫？
  - **答案：con.query('CREATE DATABASE testdb', callback);**

### 檔案系統（資料庫檔位置）

**`xrcise_filesystem`** (3 題)

- [DND] Drag and drop the correct word to complete the sentence.  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_filesystem1)
  - 🌏 拖放正確字詞以完成句子
  - 選項：`synchronous`, `blocking`, `concurrent`, `parallel`
- [FILL] Complete the code for read and write file operations:  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_filesystem2)
  - 🌏 完成讀取與寫入檔案的程式碼
  - `fs.@(13)('data.txt', 'Hello Node.js', 'utf8'); / const data = fs.@(12)('data.txt', 'utf8');`
- [MCQ] Which method would you use to read a file asynchronously?  [→ 開啟](https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_filesystem3)
  - 🌏 你會用哪個方法非同步讀取檔案？
  - **答案：fs.readFile()**

### HTML 表單 (form 標籤 / submit)

**`xrcise_forms`** (3 題)

- [MCQ] What is the correct HTML element for defining a form?  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_forms1)
  - 🌏 用於定義表單的正確 HTML 元素是什麼？（提示：`<form>`）
- [FILL] In the form below, add an input field with the type "button" and the value "OK".  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_forms2)
  - 🌏 在下方表單中加入一個 type="button"、value="OK" 的 input 欄位
  - `<form> / <@(30)> / </form>`
- [FILL] In the form below, add two radio buttons, both with the name "fav_language".  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_forms3)
  - 🌏 在下方表單中加入兩個 name="fav_language" 的 radio button
  - `<form> / <@(38) value="html"> HTML / <@(38) value="css"> CSS / </form>`

**`xrcise_form_elements`** (4 題)

- [MCQ] What is the correct HTML element to group related data in a form and also, by default, draw a border around it?  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_elements1)
  - 🌏 哪個 HTML 元素用於將表單中相關資料分組並預設會繪製邊框？（提示：`<fieldset>`）
- [FILL] In the form below, add an empty drop down list with the name "cars".  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_elements2)
  - 🌏 在下方表單中加入一個 name="cars" 的空下拉式選單
  - `<form action="/action_page.php"> / <@(18)> / </@(6)> / </form>`
- [FILL] In the form below, add two option elements to the drop down list.  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_elements3)
  - 🌏 在下方表單中加入兩個 option 元素到下拉式選單
  - `<form action="/action_page.php"> / <select name="cars"> / <@(20)>Volvo</@(6)> / <@(19)>Ford</@(6)> /`
- [FILL] In the form below, add a text area with the name "note".  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_elements4)
  - 🌏 在下方表單中加入一個 name="note" 的 text area
  - `<form action="/action_page.php"> / <@(20)></@(8)> / </form>`

**`xrcise_form_input_types`** (6 題)

- [MCQ] What is the default value of the INPUT element's type attribute?  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_input_types1)
  - 🌏 INPUT 元素的 type 屬性預設值是什麼？
  - **答案：text**
- [FILL] In the form below, add an input field for text, with the name "username" .  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_input_types2)
  - 🌏 在下方表單中加入一個 name="username" 的文字輸入欄位
  - `<form action="/action_page.php"> / <@(33)> / </form>`
- [FILL] In the form below, add a submit button with the value "Submit Form".  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_input_types3)
  - 🌏 在下方表單中加入一個 value="Submit Form" 的 submit 按鈕
  - `<form action="/action_page.php"> / <input type="text" name="username"> / <input @(33)> / </form>`
- [FILL] Add two radio buttons with the name "color".  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_input_types4)
  - 🌏 加入兩個 name="color" 的 radio button
  - `<form action="/action_page.php"> / &nbsp;&nbsp;Favorite color: / &nbsp;&nbsp;Blue / &nbsp;&nbsp;<inp`
- [FILL] In the form below, add an input field for button with the value "Click Me".  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_input_types5)
  - 🌏 在下方表單中加入一個 value="Click Me" 的 button 欄位
  - `<form action="/action_page.php"> / <@(36)> / </form>`
- [FILL] In the form below, add an input field that can only contain numbers, and use the correct input attributes to only allow numbers between 1 and 5.  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_form_input_types6)
  - 🌏 在下方表單中加入只能輸入數字的欄位，並用適當的 input 屬性限制只能輸入 1 到 5 之間的數字
  - `<form action="/action_page.php"> / <input type="@(6)" @(3)="1" @(3)="5"> / </form>`

**`xrcise_forms_attributes`** (3 題)

- [MCQ] What is the correct syntax for opening the form's result in a new browser tab?  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_forms_attributes1)
  - 🌏 用什麼語法可讓表單結果在新瀏覽器分頁開啟？（提示：`target="_blank"`）
- [FILL] Add a submit button, and specify that the form should go to "/action_page.php".  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_forms_attributes2)
  - 🌏 加入 submit 按鈕，並指定表單送到 "/action_page.php"
  - `<form @(6)="/action_page.php"> / Name: <input type="text" name="name"> / <@(19)> / </form>`
- [FILL] Specify that the form is submitted using the "POST" method.  [→ 開啟](https://www.w3schools.com/html/exercise.asp?x=xrcise_forms_attributes3)
  - 🌏 指定表單使用 "POST" 方法提交
  - `<form action="/action_page.php" @(13)> / Name: <input type="text" name="name"> / <input type="submit`

### fetch + 表單提交 (POST + JSON.stringify)

**`xrcise_json`** (3 題)

- [MCQ] What does JSON stand for?  [→ 開啟](https://www.w3schools.com/js/exercise.asp?x=xrcise_json1)
  - 🌏 JSON 是什麼的縮寫？
  - **答案：JavaScript Object Notation**
    - 🌏 JavaScript 物件表示法
- [MCQ] What is a correct JavaScript function to convert a string into a JavaScript object?  [→ 開啟](https://www.w3schools.com/js/exercise.asp?x=xrcise_json2)
  - 🌏 將字串轉成 JavaScript 物件的正確函式是哪一個？
  - **答案：JSON.parse()**
- [MCQ] Which one is a legal JSON object?  [→ 開啟](https://www.w3schools.com/js/exercise.asp?x=xrcise_json3)
  - 🌏 下列哪一個是合法的 JSON 物件？
  - **答案：{"firstName":"John", "lastName":"Doe"}**
    - 🌏 註：JSON 的 key 必須加雙引號

### CORS / 同源政策

> W3Schools 沒對應 topic，可看 MDN「Same-origin policy」。

---

## Node.js Quiz：對應講義知識點的 13 題

Quiz 連結：https://www.w3schools.com/quiztest/quiztest.asp?qtest=NODEJS（25 題連續做完才能交卷）

- **Q1** How do you include the HTTP module in a Node.js file?
  - 🌏 如何在 Node.js 檔案中引入 HTTP 模組？
  - import http module from 'http module' 　🌏 從 'http module' 匯入 http 模組
  - **const http = require('http')** ✓ 　🌏 用 require 載入 http
  - include http; 　🌏 此語法在 Node.js 不存在
  - using http; 　🌏 此語法在 Node.js 不存在
- **Q2** Which method is used to create an HTTP server in Node.js?
  - 🌏 Node.js 中用哪個方法建立 HTTP 伺服器？
  - **http.createServer()** ✓
  - http.newServer()
  - http.server()
  - http.startServer()
- **Q4** Which of the following is NOT a valid HTTP method in Node.js?
  - 🌏 下列哪個不是 Node.js 中合法的 HTTP 方法？
  - GET
  - POST
  - DELETE
  - **UPDATE** ✓ 　🌏 沒有 UPDATE，更新用 PUT 或 PATCH
- **Q5** How do you access query parameters in an Express.js?
  - 🌏 Express.js 中如何存取 query parameters？
  - **req.query** ✓ 　🌏 對應講義「讀取 GET 的 query 資料」
  - req.params 　🌏 路徑參數，例如 /users/:id
  - req.body 　🌏 POST body
  - req.param
- **Q6** What is the purpose of the package.json file in a Node.js project?
  - 🌏 Node.js 專案中 package.json 的用途是什麼？
  - It contains the main application code 　🌏 包含主要應用程式碼
  - **It contains metadata about the project and its dependencies** ✓ 　🌏 包含專案 metadata 與相依套件
  - It is required to run JavaScript files 　🌏 執行 JavaScript 檔案所必需
  - It stores database configurations 　🌏 儲存資料庫設定
- **Q7** Which command is used to install all dependencies listed in package.json?
  - 🌏 哪個指令用來安裝 package.json 列出的所有相依套件？
  - **npm install** ✓ 　🌏 對應講義「安裝 module」
  - npm init
  - npm update
  - npm start
- **Q8** What is the purpose of the node_modules folder?
  - 🌏 node_modules 資料夾的用途是什麼？
  - It contains the Node.js source code 　🌏 包含 Node.js 原始碼
  - It stores user configuration files 　🌏 儲存使用者設定檔
  - **It contains all the installed dependencies** ✓ 　🌏 包含所有已安裝的相依套件
  - It holds temporary files 　🌏 儲存暫存檔
- **Q9** Which method is used to parse JSON data in Node.js?
  - 🌏 哪個方法用於解析 Node.js 中的 JSON 資料？
  - JSON.encode()
  - **JSON.parse()** ✓
  - JSON.stringify() 　🌏 反向：物件轉字串
  - JSON.decode()
- **Q11** What is the purpose of the require() function in Node.js?
  - 🌏 Node.js 中 require() 函式的用途是什麼？
  - To include CSS files 　🌏 引入 CSS 檔案
  - **To include modules that exist in separate files** ✓ 　🌏 引入存在獨立檔案中的模組
  - To make HTTP requests 　🌏 發送 HTTP 請求
  - To validate user input 　🌏 驗證使用者輸入
- **Q12** Which method is used to handle GET requests in Express.js?
  - 🌏 Express.js 中哪個方法用於處理 GET 請求？
  - app.post()
  - app.put()
  - app.delete()
  - **app.get()** ✓ 　🌏 對應講義「express 基本路由」
- **Q13** What is the purpose of the crypto module in Node.js?
  - 🌏 Node.js 中 crypto 模組的用途是什麼？
  - **To provide cryptographic functionality** ✓ 　🌏 提供加密功能
  - To handle database connections 　🌏 處理資料庫連線
  - To manage file uploads 　🌏 管理檔案上傳
  - To validate user input 　🌏 驗證使用者輸入
- **Q21** Which method is used to redirect a response in Express.js?
  - 🌏 Express.js 中哪個方法用於重新導向回應？
  - res.forward()
  - res.to()
  - **res.redirect()** ✓
  - res.go()
- **Q22** What is the purpose of the app.use() method in Express.js?
  - 🌏 Express.js 中 app.use() 方法的用途是什麼？
  - **To mount middleware functions** ✓ 　🌏 掛載中介軟體函式（對應講義「express.json()」）
  - To define route handlers 　🌏 定義路由處理函式
  - To send responses 　🌏 送出回應
  - To handle errors 　🌏 處理錯誤

---

## 推薦練習順序

1. **後端骨架**：`xrcise_express` → `xrcise_http` → `xrcise_rest_api`
2. **解析請求**：`xrcise_middleware`（req.body / express.json()）
3. **前端串接**：`xrcise_promises` → `xrcise_async_await`（fetch）
4. **HTML 表單**：`xrcise_forms` → `xrcise_form_elements` → `xrcise_form_input_types`
5. **資料庫 CRUD**：`xrcise_mysql_create_table` → `_insert` → `_select` → `_where` → `_update`
6. **模組系統**：`xrcise_modules_esm`（對應講義「type 改成 module」）
7. **綜合驗收**：上方列出的 Node.js Quiz 13 題
