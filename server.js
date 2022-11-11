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
/*
app.get('/', (req, res) => {
    let home = '/templates/index.html'; // <-- change this
    res.redirect(home);

});
*/


//This loads the index.html template for menu button click or "/" in the url.
app.get('/', (req, res) => {
  fs.readFile(path.join(template_dir, 'index.html'), (err, template) => {
    // modify `template` and send response
    // this will require a query to the SQL database
    let query = 'SELECT * from drug_use';
    response = "Query is: ";
    db.all(query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      res.status(200).type('html').send(template); 
    });
  });
});


//Loads the drug-age.html page and executes the query to get the data for the selected age.
app.get('/drug-age/:age', (req, res) => {
  fs.readFile(path.join(template_dir, 'drug-age.html'), (err, template) => {
    let age = parseInt(req.params.age);
    let query = 'SELECT number, alcohol_use, marijuana_use, cocaine_use, crack_use, heroin_use, hallucinogen_use, inhalant_use, pain_releiver_use, oxycontin_use, tranquilizer_use, stimulant_use, meth_use, sedative_use FROM drug_use WHERE age_group = ' + age;
    db.all(query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        console.log(row);
      });
      template = template.toString();
      let dataArray = '[';
      rows.forEach((row) => {
        dataArray = dataArray + row.number + ', ';
        dataArray = dataArray+ row.alcohol_use + ', ';
        dataArray = dataArray + row.marijuana_use + ', ';
        dataArray= dataArray + row.cocaine_use + ', ';
        dataArray= dataArray + row.crack_use + ', ';
        dataArray = dataArray + row.heroin_use + ', ';
        dataArray = dataArray + row.hallucinogen_use + ', ';
        dataArray = dataArray + row.inhalant_use + ', ';
        dataArray= dataArray + row.pain_releiver_use + ', ';
        dataArray = dataArray + row.oxycontin_use + ', ';
        dataArray = dataArray + row.tranquilizer_use + ', ';
        dataArray = dataArray + row.stimulant_use + ', ';
        dataArray = dataArray + row.meth_use + ', ';
        dataArray = dataArray + row.sedative_use;
      })
      dataArray = dataArray + ']';
      template = template.replace('"%%DATAARRAY%%"', dataArray);
      res.status(200).type('html').send(template); 
    });
  });
});

//Loads the drug-frequency.html page and executes the query to get the data for the specific page 
app.get('/drug-frequency/:freq', (req, res) => {
  fs.readFile(path.join(template_dir, 'drug-frequency.html'), (err, template) => {
    // modify `template` and send response
    // this will require a query to the SQL database
    let query = 'SELECT * from drug_use';
    response = "Query is: ";
    db.all(query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        console.log(row.name);
      });
      res.status(200).type('html').send(template); // <-- you may need to change this
    });
  });
});

app.get('/input/:drug/:use/:freq', (req, res) => {
    fs.readFile(path.join(template_dir, 'drug-input.html'), (err, template) => {
        let drug = req.params.drug;

        let drug_capital = drug.charAt(0).toUpperCase() + drug.slice(1);
        let use = req.params.drug +"_use";
        let freq = req.params.drug +"_frequency";
        let use_num = parseFloat(req.params.use);
        let freq_num = parseFloat(req.params.freq);
        
        // modify `template` and send response
        // this will require a query to the SQL database
        let query = "SELECT age, number, " + use + ", " + freq + " FROM drug_use WHERE " + use + " >= " + use_num + " AND " + freq + " >= " +  freq_num;
        //let query1 = "SELECT age, number, ?, ? FROM drug_use WHERE ? >= ? AND ? >= ?";
        db.all(query, [], (err, rows) => {
            let response = template.toString();
            //response = response.replace();
            response = response.replace("%%"+drug+"_SELECTED%%", drug + " selected");
            response = response.replace("%%USE_INPUT%%", use_num);
            response = response.replace("%%FREQ_INPUT%%", freq_num);

            if(rows.length!= 0){
                response = response.replaceAll("%%DRUG%%", drug_capital);
                let drug_data = " ";
                for(let i=0; i< rows.length; i++){
                    drug_data +="<tr>";
                    drug_data +="<td>" + rows[i].age + "</td>";
                    drug_data +="<td>" + rows[i].number + "</td>";
                    drug_data +="<td>" + rows[i][use] + "% </td>";
                    drug_data +="<td>" + rows[i][freq] + "</td>";
                    drug_data +="</tr>";
                }
                response = response.replace("%%DRUG_DATA%%", drug_data);
            } else {
                response = response.replace('"><!--%%DISPLAYNONE%%-->',' display: none;">');
                response = response.replace("%%DRUG_DATA%%", "Hello");
            }
            

            res.status(200).type('html').send(response);
          });
    });
});





app.listen(port, () => {
  console.log('Now listening on port ' + port);
});
