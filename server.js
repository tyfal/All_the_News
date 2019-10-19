const express = require(`express`);
const logger = require(`morgan`);
const mongoose = require(`mongoose`);

// Scraping tools
const axios = require(`axios`);
const cheerio = require(`cheerio`);

// Require models
const db = require(`./models`);

const PORT = 3001;

// Initialize Express
const app = express();

// Configuring middleware

// Morgan logger for logging requests
app.use(logger(`dev`));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static(`public`));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

// Routes

// Index html route
app.get(`/`, function (req, res) {

    res.render(`index`);

});


// A GET route for scraping the New York Times website
app.get(`/scrapeNYT`, function (req, res) {

    axios.get(`https://www.nytimes.com/`).then(function (response) {

        let $ = cheerio.load(response.data);



        $(`article div div`).each(function (i, element) {
            let result = {};

            result.title = $(this).text();

            result.link = `https://www.nytimes.com/${$(this).children().attr(`href`)}`;

            console.log(result.link);

            if (result.link) {
                db.Article.create(result)
                    .then(dbArticle => console.log(dbArticle))
                    .catch(err => console.log(err));
            }
        });
        res.send(`~~~~~\tScrape complete\t~~~~~`);
    });


});


// Get all articles
app.get(`/api/articles`, function (req, res) {

    db.Article.find({})
        .then(articles => res.json(articles))
        .catch(err => res.json(err));

});

app.get("/articles/:id", (req, res) => {
    db.Article.findOne({ _id: req.param.id })
        .populate("note")
        .then(dbArticle => res.json(dbArticle))
        .catch((err) => res.json(err));
});

app.post("/articles/:id", (req, res) => {
    db.Note.create(req.body)
        .then(dbNote => { return db.Article.findOneAndUpdate({ _id:req.params.id }, { note: dbNote._id }), { new: true } })
        .then(dbArticle => res.json(dbArticle))
        .catch(err => res.json(err));
})

// Start the server
app.listen(PORT, function () {
    console.log(`App is running at http://localhost:${PORT}`);
})