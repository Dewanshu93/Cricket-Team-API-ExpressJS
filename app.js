const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const dbPath = path.join(__dirname, 'cricketTeam.db')

let database = null

app.use(express.json())

const intializeDBandServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

intializeDBandServer()
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
  SELECT *
  FROM cricket_team;`
  const playersArray = await database.all(getPlayerQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postSQLQuery = `
  INSERT INTO 
  cricket_team(player_name,jersey_number,role)
  VALUES (
    '${playerName}',
    ${jerseyNumber},
    '${role}'
  );`
  const dbResponse = await database.run(postSQLQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerwithPlayerId = `
  SELECT *
  FROM cricket_team
  WHERE 
  player_id=${playerId};`
  const player = await database.get(getPlayerwithPlayerId)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`
  const updatedPlayerArray = await database.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`
  await database.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports=app;
