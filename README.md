# CMSC398K Final Project

## I. Basic Information
Name: Zicong (Jimmy) Bai

Project Topic: Animal Crossing Turnip Exchange Site

URL: [Heroku App Link](https://stalk-markets.herokuapp.com/)

---

## II. MongoDB Schema

### 1. User Schema

This schema holds all login information of users. A new entry is created when a new user signs up.

```javascript
{
  email: String,
  email_lower: String,
  username: Number,
  username_lower: Number,
  password: String,
  uuid: Number
}
```

- `email` User's email address
- `email_lower` User's email address in lower case for comparison
- `username` User's username
- `username_lower` User's username in lower case for comparison
- `password` User's salted and hashed password
- `uuid` An unique UID generated for the user

### 2. User Profile Schema

This schema holds all non login information of users. A new entry is created when a new user signs up.

```javascript
{
  username: String,
  uuid: Number,
  island_hosted: Number,
  island_visited: Number,
  visit_island_list: [Number],
  host_island_list: [Number]
}
```

- `username` User's username
- `uuid` An unique UID generated for the user
- `island_hosted` Number of islands hosted by the user
- `island_visited` Number of islands visited by the user. Only count if user joins and stays on the queue
- `visit_island_list` An array of islands' UUID that the user had visited before 
- `host_island_list` An array of island's UUID that the user had host before or is currently hosting

### 3. Island Schema

This schema holds all islands created by all of the users. A new entry is created when a user creates a new island.

```javascript
{
  island_uuid: Number,
  host_uuid: Number,
  dodo_code: String,
  bell_price: Number,
  start_time: String,
  queue_limit: Number,
  current_queue: Number,
  queue_list: [{
    username: String, 
    uuid: Number
    }],
  visitor_limit: Number,
  visitor_list: [{
    username: String, 
    uuid: Number
    }],
  curr_index: Number,
  description: String,
  fee_required: Boolean,
  active: Boolean
}
```

- `island_uuid` An unique ID generated for the island
- `host_uuid` The uuid of the user that hosted this island
- `dodo_code` The Dodo code that allows other player to visit the host's idland on Animal Crossing
- `bell_price` The current Bell price per turnip on Animal Crossing
- `start_time` The date and time when the host will start giving out Dodo code to users on the queue
- `queue_limit` The number of users that is allow to be on the queue
- `current_queue` The number of users that is currently on the queue
- `queue_list` A list of users' uuid and username that is on the queue
- `visitor_limit` The number of users that is allow to receive the Dodo code at once
- `visitor_list` A list of users' uuid and username that is currently visiting the host's island on Animcal Crossing
- `curr_index` An index that points to how much of the queue list have been process
- `description` The description of the island that includes what the host wants in return, rules of visiting, etc
- `fee_required` Indicates if visiting the island requires a fee to the host. True if yes, false otherwise
- `active` Indicates if the island is currently accepting users into the queue as well as if the queue is being proccess. True if yes, false otherwise

---

## III. API Endpoints

### 1. POST Endpoint Routes

1. `/user/signup`

    This endpoint takes in data through a form and creates a User and UserProfile in MongoDB.

2. `/user/signin`

    This endpoint takes in a case insensitive username and a password and compares it with the username password combo in order to authenticate the user.

3. `/dashboard/profile/deleteVisited/:uuid`

    This endpoint takes in a user's UUID and set the list of islands that the user visited before to an empty array in the UserProfile schema.

4. `/island/create`

    This endpoint takes in data through a form and creates an Island in MongoDb.

### 2. DELTE Endpoint Routes

1. `/dashboard/profile/deleteAll/:uuid`

   This endpoing takes in a user's UUID and deletes all of the islands created by the user from the Island schema as well as to set the list of island that the user created before to an empty array in the UserProfile schema.

2. `/dashboard/profile/deleteInactive/:uuid`

    This endpoing takes in a user's UUID and deletes all of the inactive islands created by the user from the Island schema as well as to set the list of island that the user created before to an empty array in the UserProfile schema.

---

## IV. Navigation Pages

- `/` Main page that user sees before logging in
- `/signup` Sign up page that can be access from `/`
- `/signin` Sign in page that can be access from `/`
- `/about` About page that can be access from `/` or from the navbar that is on all of the pages after the user logs in
- `/dashboard` Main page that user sees after logging in
- `/dashboard/profile/:uuid` The profile page of a user that has that UUID. The current user's profile can be access from the navbar that is on all of the pages after the user logs in
- `/island/:uuid` The island page that has that UUID and can be access by clicking the UUID of the island that is presented on the island cards rendered on `/dashboard`
- `/404` A 404 page that will be redirected to when non of the above url is entered

---

## V. Modules

### 1. app-util.js

```javascript
module.exports = {
  JoinQueue: JoinQueue,
  LeaveQueue: LeaveQueue,
  NextGroup: NextGroup,
  EndIslandHosting: EndIslandHosting
}
```

- `JoinQueue` Handles request when a user joins the queue of an island. Responsible for writing changes to database. Returns a JS object containing necessary data needed by sockets as well as a call back function.
- `LeaveQueue` Handles request when a user leaves the queue of an island. Responsible for writing changes to database. Returns a JS object containing necessary data needed by sockets as well as a call back function.
- `NextGroup` Handles request when the host gives the Dodo code to the next group of users. Responsible for writing changes to database. Returns a JS object containing necessary data needed by sockets as well as a call back function.
- `EndIslandHosting` handles request when the host closes the island. Responsible for writing changes to database. Returns a JS object containing necessary data needed by sockets as well as a call back function.

### 2. auth.js

```javascript
module.exports = {
  ensureAuthenticated: ensureAuthenticated,
  forwardAuthenticated: forwardAuthenticated
}
```

- `ensureAuthenticated` Ensures the user is logged in before accessing certain pages. If the user is logged in, the `next()` function is called and will continue through the middleware. Otherwise, the user will be redirected to the sign in page with a flash message informing the user.

- `forwardAuthenticated` Forward the user from `/signin`, `/signup`, and `/` to `/dashboard` if the user is already logged in. Otherwise, the `next()` function is called and will continue through the middleware.

### 3. passport.js

```javascript
module.exports = {
  Initialize: Initialize
}
```

- `Initialize` Initialize the authentication strategy that is used for authenicating the user when logging in. The strategy used for authentication is `passport-local`. Responsible for comparing the input username password pair with the username password pair on the database.

---

## VI. NPM Packages

### 1. Base NPM packages that are required

- `express`
- `express-handlebars`
- `handlebars`
- `body-parser`
- `mongoose`
- `socket.io`
- `http`
- `dotenv`

### 2. Feature NPM packages that are used in this project

#### For user authentication

- `bcryptjs` Use to salt and hash plain-text password before storing on the database
- `passport` Use to authenticate users
- `passport-local` Strategy use by `passport` to authenticate users

#### For user session

- `connect-flash` Stores flash messages that can be displayed after being redirected to another page. Used on `/signin` and `/signup` page
- `connect-mongodb-session` Stores user's sessions when a user log in on the database. This helps the user to stay logged in on tab closed or server restart.
- `express-session` This is needed for both `connect-mongodb-session` and `connect-flash`

#### Other

- `moment` Use to compare date and time as well as parsing `String` into an `ISO 8601` format
- `@handlebars/allow-prototype-access` Use to bypass a security feature implemented in new version of `handlebars` that forbids the accesss of internal properties of an object

---

## VII. Socket io Usage

### 1. Implementation

The only place socksts are being implemented is on the island page, which means all links that goes with the format `/island/:uuid`. The purpose of this implementation is to alert and updaet all users who are currently on the page. Real time notifications and changes allow users to see what is going on without refreshing. Client side socket functionalities are in `soketio.js` while server side cocket functionalities are in `island.js`.

### 2. Namespace and rooms

In order to differentiate users who are on the island page and who are not, as well as users on different island page, both namespace and rooms are used. Below are the setup for namespace:

- Server side
```javascript
io.of('/island').on('connection', function (socket) {
  ...
});
```

- Client side
```javascript
socket = io(`/island`);
```

This allow users to join a socket server ONLY if they visit an island page. However, with only the setup of namespace, users visiting island page with different UUID will be on the same socket server. In order to separate them, a unique room is created for each island using the UUID. This is achieved by parsing the URL that is in the socket header and extracting the UUID from the url.

```javascript
    // Parse island uuid for room creation
    const url_regex = /^https?:\/\/.+\/island\/(\d+)$/g;
    const curr_url = socket.request.headers.referer;
    const island_uuid = url_regex.exec(curr_url)[1];

    // Upon connecting to the socket server, create room with island_uuid
    socket.join(`${island_uuid}`, function () {
      ...
    });
```

### 3. Functionalities

The general proccess of the socket server-client interaction:

1. User send request. `Client` emits message.
2. `Server` receives message emitted by client. Update database if necessary. Emits message back to client.
3. `Client` receives message emitted by client. Update HTML using Javascript.

In order for the `server` to have the ability to send messages either back to sender only, or all `client` in that specific room, the socket ID is sent from the `client` to the `server` on every emit:

```javascript
socket.emit('message', {
  socket_uuid: socket.id,
  ...other data that is necessary
})
```

Below are the different implementations that allows the `server` send to different groups of `client`:

```javascript
// Sending to sender only
io.of('namespace').to('socket id').emit('message', data);

// Sending to everyone in that specific namespace and room INCLUDING sender
io.of('namespace').to('roomname').emit('message', data);

// Sending to everyone in taht specific namespace and room EXCEPT sender
socket.broadcast.emit('message', data);
```

Below is a list of messages that were implemented:

From `client` to `server`

#### joinQueue
- `Outbound Data` 
    - `socket_uuid` The socket ID of the current user (socket)
    - `island_uuid` The UUID of the current island
    - `curr_user_uuid` The UUID of the current user
- `Server functionalities` 
    - Server adds the `island_uuid` to the visit_island_list of the user that has the same UUID as `curr_user_uuid` and saves the changes to the database
    - Sends the result back to sender only with the message `joinedQueueCurr`
    - Sends a 'Success' notification to sender only with the message `createToast`
    - Tells all user including the sender to rerender with the message `renderIslandAll`
    - Sends a notification that a new user has joined the queue to all other users excpet the sender with the message `createToast`

#### leaveQueue
- `Outbound Data` 
    - `socket_uuid` The socket ID of the current user (socket)
    - `island_uuid` The UUID of the current island
- `Server functionalities` 
    - Server removes the `island_uuid` from the visit_island_list for the user that has the same UUID as `curr_user_uuid` and saves the changes to the database
    - Sends a 'Success' notification to sender only with the message `createToast`
    - Tells all user including the sender to rerender with the message `renderIslandAll`

#### nextGroup
- `Outbound Data` 
    - `socket_uuid` The socket ID of the current user (socket)
    - `island_uuid` The UUID of the current island
- `Server functionalities` 
    - Server prompt the next group of users to visit the island and update the curr_index of the island that has the same UUID as `island_uuid`
    - If everyone in the queue has visited the island and the queue is full, the server prompts the host (sender) to close the island with the message `nextGroupHost`
    - Else, if there is no one on the next visitor list, the server sends a notification to host (sender) with the message `createToast`
    - Tells all user including the sender to update the page with the message `nextGroupAll`
    
#### endIslandHosting
- `Outbound Data` 
    - `socket_uuid` The socket ID of the current user (socket)
    - `island_uuid` The UUID of the current island
- `Server functionalities` 
    - Server set the island with the same UUID as `island_uuid`'s active status to false and saves the change to database
    - Sends a 'Success' notification to sender only with the message `createToast`
    - Tells all user including the sender that the island is close with the message `endIslandAll`
    - Send a notification to all user except the sender that the island is now close with the message `createToast`

From `server` to `client`

#### joinedQueueCurr
- `Inbound Data` 
    - `result['queue_place']` The current place of the user on the queue
- `Client functionalities` 
    - Updates the current place of the user with inbound data

#### renderIslandAll
- `Inbound Data` 
    - `result` Result return by the server after writing changes to the database
- `Client functionalities` 
    - Updates the current number of users on the queue
    - Forbids any more users from joining the queue if the queue is full by hiding the 'Join Queue' element
    - Updates the queue list with an update queue list return by the server

#### nextGroupHost
- `Inbound Data` 
    - `status` Status of the queue. If everybody in queue has visited and queue is full, return true. Otherwise, false.
    - `island_uuid` The UUID of the island that the sender is currently on
- `Client functionalities` 
    - If the status given by `status` is true, create an alert for the host and closes the island when the host confirms

#### nextGroupAll
- `Inbound Data` 
    - `result` Result return by the server after writing changes to the database
- `Client functionalities` 
    - Updates the current index of the queue
    - Updates the visitor list for all users
    - Display the Dodo code for users that are currently on the visitor list 
    - Hide the Dodo code for users that are on the previous visitor list

#### endIslandAll
- `Inbound Data` 
    - `result` Result return by the server after writing changes to the database
- `Client functionalities` 
    - Hide the host control for host
    - Hide all active island elements from all other users besides the host
    - Set the activity text of the island to 'inactive'

#### createToast
- `Inbound Data` 
    - `tag` Indicate if the toast is an error, success, warning, or notification
    - `key` Key use to retrieve messages from TOAST_MSG
- `Client functionalities` 
    - Calls the CreateToast function to create a toast notification