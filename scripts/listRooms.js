require('ciscospark').init({
  credentials: {
    authorization: {
      access_token: process.env.ACCESS_TOKEN
    }
  }
}).rooms.list()
.then(rooms =>
  console.log(rooms.items.map(room => `${room.title}: ${room.id}`).join('\n'))
)
.catch(error => console.log('ERROR:', error))
