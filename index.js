// Weather app backend: saved cities and feedback, stored in TiDB.
// Same setup as the CSC452 backend lesson (Express + mysql2 + Vercel).
const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// A pool reconnects by itself, which works better on Vercel than one connection.
const connection = mysql.createPool(process.env.DATABASE_URL)

app.get('/', (req, res) => {
    res.send('Weather backend is running')
})

// ---------- Saved cities ----------
// There are no user accounts. Each phone makes a random device_id and
// sends it, so every phone only sees its own cities.

// GET /cities?device_id=abc
app.get('/cities', (req, res) => {
    const deviceId = req.query.device_id
    if (!deviceId) {
        return res.status(400).send({ error: 'device_id is required' })
    }
    connection.query(
        'SELECT `id`, `name`, `country`, `latitude`, `longitude` FROM `saved_cities` WHERE `device_id` = ? ORDER BY `id`',
        [deviceId],
        function (err, results) {
            if (err) {
                console.error('Error in GET /cities:', err)
                return res.status(500).send({ error: 'Could not load cities' })
            }
            res.send(results)
        }
    )
})

// POST /cities  body: { device_id, name, country, latitude, longitude }
app.post('/cities', (req, res) => {
    const { device_id, name, country, latitude, longitude } = req.body
    if (!device_id || !name || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).send({ error: 'device_id, name, latitude and longitude are required' })
    }
    connection.query(
        'INSERT INTO `saved_cities` (`device_id`, `name`, `country`, `latitude`, `longitude`) VALUES (?, ?, ?, ?, ?)',
        [device_id, name, country || '', latitude, longitude],
        function (err, results) {
            if (err) {
                console.error('Error in POST /cities:', err)
                return res.status(500).send({ error: 'Could not save city' })
            }
            res.status(200).send({ id: results.insertId, name, country: country || '', latitude, longitude })
        }
    )
})

// DELETE /cities  body: { id, device_id }
app.delete('/cities', (req, res) => {
    const { id, device_id } = req.body
    if (!id || !device_id) {
        return res.status(400).send({ error: 'id and device_id are required' })
    }
    connection.query(
        // device_id check stops one phone deleting another phone's city.
        'DELETE FROM `saved_cities` WHERE `id` = ? AND `device_id` = ?',
        [id, device_id],
        function (err, results) {
            if (err) {
                console.error('Error in DELETE /cities:', err)
                return res.status(500).send({ error: 'Could not delete city' })
            }
            res.send({ deleted: results.affectedRows })
        }
    )
})

// ---------- Feedback ----------

// POST /feedback  body: { device_id, name, rating (1-5), message }
app.post('/feedback', (req, res) => {
    const { device_id, name, rating, message } = req.body
    if (!device_id || !message || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).send({ error: 'device_id, message and a rating from 1 to 5 are required' })
    }
    if (message.length > 2000) {
        return res.status(400).send({ error: 'Message is too long' })
    }
    connection.query(
        'INSERT INTO `feedback` (`device_id`, `name`, `rating`, `message`) VALUES (?, ?, ?, ?)',
        [device_id, (name || '').slice(0, 255), rating, message],
        function (err, results) {
            if (err) {
                console.error('Error in POST /feedback:', err)
                return res.status(500).send({ error: 'Could not save feedback' })
            }
            res.status(200).send({ id: results.insertId })
        }
    )
})

// GET /feedback  (for you to read feedback in the browser or Thunder Client)
app.get('/feedback', (req, res) => {
    connection.query(
        'SELECT `id`, `name`, `rating`, `message`, `created_at` FROM `feedback` ORDER BY `id` DESC',
        function (err, results) {
            if (err) {
                console.error('Error in GET /feedback:', err)
                return res.status(500).send({ error: 'Could not load feedback' })
            }
            res.send(results)
        }
    )
})

app.listen(process.env.PORT || 3000, () => {
    console.log('CORS-enabled web server listening on port ' + (process.env.PORT || 3000))
})

// export the app for vercel serverless functions
module.exports = app
