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
      res.status(200).type('html').send(template); // <-- you may need to change this
    });
  });
});


//Loads the drug-age.html page and executes the query to get the data for the selected age.
app.get('/drug-age/:age', (req, res) => { //Might have to change this to be more like the expressdynamic class example... 
  fs.readFile(path.join(template_dir, 'drug-age.html'), (err, template) => {
    let age = parseInt(req.params.age);
    let query = 'SELECT number, alcohol_use, marijuana_use, cocaine_use, crack_use, heroin_use, hallucinogen_use, inhalant_use, pain_releiver_use, oxycontin_use, tranquilizer_use, stimulant_use, meth_use, sedative_use FROM drug_use WHERE age_group = ' + age;
    console.log(query);

    db.all(query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        console.log(row);
      });
      template = template + '<p id="returned-json">';
      rows.forEach((row) => {
        template = template + row.number + ', ';
        template = template + row.alcohol_use + ', ';
        template = template + row.marijuana_use + ', ';
        template = template + row.cocaine_use + ', ';
        template = template + row.crack_use + ', ';
        template = template + row.heroin_use + ', ';
        template = template + row.hallucinogen_use + ', ';
        template = template + row.inhalant_use + ', ';
        template = template + row.pain_releiver_use + ', ';
        template = template + row.oxycontin_use + ', ';
        template = template + row.tranquilizer_use + ', ';
        template - template + row.stimulant_use + ', ';
        template = template + row.meth_use + ', ';
        template = template + row.sedative_use + ', ';

      })
      template = template +'</p>';
      res.status(200).type('html').send(template); //html & template, or json & rows
    });
  });
});

//Loads the drug-frequency.html page and executes the query to get the data for the specific page
app.get('/drug-frequency/:name/:order', (req, res) => {
  fs.readFile(path.join(template_dir, 'drug-frequency.html'), (err, template) => {
    // modify `template` and send response
    // this will require a query to the SQL database
    let name = req.params.name;
    let drugUse = req.params.name + '_use';
    let order = name + "_" + req.params.order;
    let formOrder = req.params.order.charAt(0).toUpperCase() + req.params.order.slice(1)
    let drugFrequency = req.params.name + '_frequency';
    let nameCapital = name.charAt(0).toUpperCase() + name.slice(1);
    let secondaryOrder = "";
    if(order === name + '_frequency'){
      secondaryOrder = name + '_use';
    } else{
      secondaryOrder = name + '_frequency';
    }
    let query = 'SELECT age, ' + drugUse + ", " + drugFrequency + ' FROM drug_use ORDER BY ' + order + ' DESC, ' + secondaryOrder + ' DESC';
    //some fuckery with null values
    console.log(query);

    response = template.toString();
    response = response.replaceAll("%%DRUG%%", nameCapital);
    response = response.replaceAll('%%DRUG_ORDER%%', formOrder);
    db.all(query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      let table = "";
      for(let i =0; i<rows.length; i++) {
        console.log(rows[i]); //add if rows freq = '' replace with 0, add note that data only goes to the tenth of a percent
        table = table + "<tr>" + "<td>" + rows[i].age + "</td>" + "<td>" + rows[i][drugUse] + "</td>" + "<td>" + rows[i][drugFrequency] + "</td>" + "</tr>";
      };
      response = response.replace("%%DRUG_DATA%%", table);
      res.status(200).type('html').send(response); // <-- you may need to change this
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
