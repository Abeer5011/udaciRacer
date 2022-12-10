const express = require("express")
const bodyParser = require("body-parser")
const fetch = require("node-fetch")
const path = require("path")
const fs = require("fs")
const app = express()
const cors = require("cors")

const port = 3000

let resp = JSON.parse(fs.readFileSync("./data.json"))

const cars = resp.cars

////////////////////////////////////////////////////////////////////////////////////////////////////////////

let state = {
  status: "unstarted",
  positions: [
    {
      final_position: 0,
      speed: 0,
      segment: 0,
    },
  ],
}
for (let i = 0; i < cars.length; i++) {
  state.positions.push(cars[i])
}
const progressF = async (timeToDelay, positions) => {
  state.status = "in-progress"
  await fetching(timeToDelay, positions).then(updateState)
  console.log(state)
}

const updateState = positions => {
  state.status = "finished"
  state.positions = positions
  console.log(state)
}

const fetching = (timeToDelay, positions) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(positions)
    }, timeToDelay)
  })
}

// setup the ability to see into response bodies
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
// setup the express assets path
app.use("/", express.static(path.join(__dirname, "../client")))

// API calls ------------------------------------------------------------------------------------
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "../client/pages/home.html"))
})

app.get("/race", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/pages/race.html"))
})

app.get("/api/cars", (req, res) => {
  try {
    let response = JSON.parse(fs.readFileSync("./data.json"))

    res.status(200).json(response.cars)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: `Internal Server Error.` })
  }
})

app.get("/api/tracks", (req, res) => {
  try {
    let response = JSON.parse(fs.readFileSync("./data.json"))

    res.status(200).json(response.tracks)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: `Internal Server Error.` })
  }
})

app.get("/api/races/:carId", (req, res) => {
  console.log(state)

  res.json(state)
  progressF(100000, [
    {
      final_position: 0,
      speed: 0,
      segment: 0,
    },
  ])
})

app.post("/api/races/:racer/start", (req, res) => {
  res.send(req.params.racer)
})

app.post("/api/races", (req, res) => {
  let { track_id, player_id } = req.body

  let response = JSON.parse(fs.readFileSync("./data.json"))

  const tracks = response.tracks
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].id === track_id) {
      track_id = tracks[i]
    }
  }
  let car = []
  for (let i = 0; i < cars.length; i++) {
    if (cars[i].id === player_id) {
      player_id = cars[i].id
    } else if (cars[i].id !== player_id) {
      car.push(cars[i])
    }
  }
  let body = {
    id: 1,
    track_id: track_id,
    player_id: player_id,
    cars: car,
    results: [state],
  }

  console.log(body)

  res.json(body)
})
app.post("/api/races/:ac/accelerate", (req, res) => {
  res.send(req.params.ac)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
