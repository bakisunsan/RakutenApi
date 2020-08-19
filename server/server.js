const express = require ("express");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./knex")

const PORT = process.env.PORT || 5000;
const app = express();

// Serve static assets
app.use(express.static(path.resolve(__dirname, "..", "dist")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET retrieve jokes
app.get('/api', async (req, res) => {
    try {
        const jokes = await db.select().table("jokes");
        res.json(jokes);

    } catch (err) {
        console.error("Error loading jokes!", err);
        res.sendStatus(500);
    }    
});

// POST add joke
app.post("/api/addJoke/:joke", async (req, res) => {
    try {
      await db("jokes").insert(req.body)
      // console.log("Added Recipe", req.body);
    } catch (err) {
      console.error("Error adding joke!", err);
      res.sendStatus(500);
    }
})

app.patch('/api', async (req, res) => {
    const likeOrDislike = req.body.likeOrDislike;
    const joke_ID = req.body.joke_ID;
    const joke = req.body.joke;

    try {
        let table = await db.select().table("jokes").where("joke_ID", joke_ID);
        if (table.length === 0) {
            await db.table("jokes").insert({"joke_ID": joke_ID, "joke": joke, "like": 0, "dislike": 0});
            table = await db.select().table("jokes").where("joke_ID", joke_ID);
        }

        if(likeOrDislike === "like") {
            const result = await db.table("jokes").update({"like": table[0][likeOrDislike] + 1}).where("joke_ID", joke_ID);
            res.json(result);
        } else if (likeOrDislike === "dislike") {
            const result = await db.table("jokes").update({"dislike": table[0][likeOrDislike] + 1}).where("joke_ID", joke_ID);
            res.json(result);
        }
    } catch (err) {
        console.error("Error updating table!", err);
        res.sendStatus(500);    
    }
});

// Always return the main index.html, so react-router render the route in the client
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});