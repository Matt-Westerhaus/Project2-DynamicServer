// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'drug_use.sqlite3'); 

let app = express();
let port = 8000;

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// Serve static files from 'public' directory
app.use(express.static(public_dir));


// GET request handler for home page '/' (redirect to desired route)
// app.get('/', (req, res) => {
//     let home = ''; // <-- change this
//     res.redirect(home);

    
// });




// Example GET request handler for data about a specific year
app.get('/', (req, res) => {
    fs.readFile(path.join(template_dir, 'year.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        let query= 'SELECT * from drug_use';
        response = "Query is: ";
        db.all(query, [], (err, rows) => {
            if (err) {
              throw err;
            }
            rows.forEach((row) => {
              console.log(row.name);
            });
            res.status(200).type('html').send(response); // <-- you may need to change this
          });
    });
});


app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
