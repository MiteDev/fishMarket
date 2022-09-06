const mysql = require('mysql');
require('dotenv').config({path: '.env'});

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// const reconn = () => {
//   db.query(`SELECT 1`, (err, db_data) => {
//     if(err) {
//       console.log(err);
//     } else {
//       console.log(db_data);
//     }
//   })
// }

// const handleDisconnect = () => {
//     db.connect(function(err) {            
//         if(err) {                            
//           console.log('error when connecting to db:', err);
//           //setTimeout(handleDisconnect, 2000); 
//           setTimeout(reconn, 2000);
//         }                               
//         console.log("connect");
//       });                                 
                                             
//       db.on('error', function(err) {
//         // if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
//         if(err) {
//           return handleDisconnect();                      
//         } else {          
//           console.log('db error', err);                          
//           throw err;                            
//         }
//       });
// }

// handleDisconnect();

setInterval(()=> {
  db.query('SELECT 1');
}, 19000);

module.exports = db