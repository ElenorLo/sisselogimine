const express = require('express');
const fs = require('fs').promises;
//moodul POST päringute lahti harutamiseks, parsimiseks
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos asynciga)
const mysql = require('mysql2/promise');
//moodul .env keskkonna muutujate lugemiseks
require('dotenv').config();
const galleryPhotoRouter = require('./routes/galleryPhotoRoutes');

const dateET = require('./src/dateTimeET');

const textRef = "public/txt/vanasonad.txt";
const regtextRef = "public/txt/visits.txt";

//käivitan funk. express() ja annan nimeks app
const app = express();
//määrame renderdusmootori: EJS
app.set('view engine', 'ejs');
//määrame avalikuna kasutatava kataloogi
app.use(express.static('public'));
//määrame vormide sisu
//määrame vormide sisu parsimise, kui false, siis ainult tekst
app.use(bodyparser.urlencoded({extended: true}));

//marsruudid
/* app.get('/', (req, res)=>{
	//const dayNow = dateET.day();
	const dateNow = dateET.date(0);
	const timeNow = dateET.time();
	//res.send('Express.js veeb lÃkski kÃima!');
	res.render('index', {dayNow: 'suvaline päev', dateNow: dateNow, timeNow: timeNow});
});
 */
 
 //sisselog. kasutajate avaleht
 app.get('/home', (req,res) => {
	 res.render('home');
 });
 
  //väljalog. kasutajate avaleht
 app.get('/logout', (req,res) => {
	 res.redirect('/');
 });
 
app.post('/vanasona', async (req,res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(";");
		res.render('vanasona', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
	}
	catch (err) {
		console.log(err);
		res.render('vanasona', {wisdom: 'Kahjuks ei leidnud ühtegi vanasõna!'});
	}
});

app.get('/', async (req, res) => {
	const dateNow = dateET.date(0);
	const timeNow = dateET.time();
	let conn;
	let photo = null;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		
		const sqlReq = "SELECT filename, alttext FROM galleryphotos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC LIMIT 1";
        const [rows] = await conn.execute(sqlReq, [3]);

        if (rows.length > 0) {
            photo = { 
                filename: rows[0].filename, 
                alt: rows[0].alttext || 'Uusim avalik foto' 
            };
        }
		
			await conn.end();
	}catch (err) {
		console.log('Viga: ' + err);
	}finally {
		
	}
	res.render('index', { dayNow: 'suvaline päev', dateNow: dateNow, timeNow: timeNow, photo: photo });
});

/* app.get('/regvisit', (req,res)=>{
	res.render('regvisit');
});

	function dateFormattedET(){
	let timeNow = new Date();
	let dayNow = timeNow.getDay();
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	let monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	let dayNamesET = ['esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev', 'pühapäev'];
	return dayNamesET[dayNow] + ', ' + dateNow + '. ' + monthNamesET[monthNow] + ' ' + yearNow;
	}
	
const timeFormattedET = function(){	
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	return hourNow + ':' + minuteNow + ':' + secondNow;
}


app.post('/regvisit', async (req,res)=>{
	try{
		await fs.open(regtextRef, 'a');
		let entry = `${req.body.inputName}; ${dateFormattedET()}; ${timeFormattedET()}\r\n`;
		
		await fs.appendFile(regtextRef, entry);
		res.render('regvisit');
	}
	catch (err) {
		console.log(err);
		res.render('regvisit');
	}

}); */

//Eesti filmi marsruudid
const eestiFilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestiFilmRouter);

/* app.get('/eestifilm', (req,res)=>{
	res.render('eestifilm');
}); */

/*aapp.get('/eestifilm/inimesed', async (req,res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//defineerime sql päringu
		let  sqlReq = 'SELECT * FROM person';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('eestifilminimesed', {personList: sqlRes});
	}
	catch(err) {
		console.log('Andmebaasiga suhtlemise viga!' + err);
		res.render('eestifilminimesed', {personList:[]});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	
}); */

app.get('/eestifilm/inimesed_lisa', (req,res)=>{
	res.render('eestifilminimesed_lisa', {notice: 'Ootan sisestust!'});
});

/* app.post('/eestifilm/inimesed_lisa', async (req,res)=>{
	console.log(req.body);
	//kontrollime andmeid
	const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime() || bornDate > timeNow)){
		console.log("Andmed pole korrektsed!");
		return res.render('eestifilminimesed_lisa');
	}
	let deceasedDate = null;
if(req.body.deceasedInput != ''){
		deceasedDate = req.body.deceasedInput;
	}
	let conn
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('eestifilminimesed_lisa', {notice: req.body.firstNameInput + ' ' + req.body.lastNameInput + ' ' + req.body.bornInput + ' ' + 'Sisestatud'});
	}
	catch(err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilminimesed_lisa');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
}); */

const zanrRouter = require('./routes/zanrRoutes');
app.use('/zanr', zanrRouter);

 /* app.get('/zanr', (req,res)=>{
	res.render('zanr');
});

app.get('/zanrnimed', async (req,res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//defineerime sql päringu
		let  sqlReq = 'SELECT * FROM genre';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('zanrnimed', {genreList: sqlRes});
	}
	catch(err) {
		console.log('Andmebaasiga suhtlemise viga!' + err);
		res.render('zanrnimed', {genreList:[]});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	
});

app.get('/zanrnimed_lisa', (req,res)=>{
	res.render('zanrnimed_lisa', {notice: 'Ootan sisestust!'});
});

app.post('/zanrnimed_lisa', async (req,res)=>{
	console.log(req.body);
	let conn
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO genre (id, name, description) VALUES (?,?,?)';
		await conn.execute(sqlReq, [
			req.body.nameInput,
			req.body.descriptionInput,
		]);
		res.render('zanrnimed_lisa', {notice: req.body.nameInput + ' ' + req.body.descriptionInput + 'Sisestatud'});
	}
	catch(err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('zanrnimed_lisa');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/ametid', (req,res)=>{
	res.render('ametid');
});

app.get('/ametid/nimed', async (req,res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'SELECT * FROM profession';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('ametidnimed', {professionList: sqlRes});
	}
	catch(err) {
		console.log('Andmebaasiga suhtlemise viga!' + err);
		res.render('ametidnimed', {professionList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/ametid/nimed_lisa', (req,res)=>{
	res.render('ametidnimed_lisa', {notice: 'Ootan sisestust!'});
});

app.post('/ametid/nimed_lisa', async (req,res)=>{
	if(!req.body.nameInput){
		return res.render('ametidnimed_lisa', {notice: 'Nimi puudub!'});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO profession (name, description) VALUES (?,?)';
		await conn.execute(sqlReq, [
			req.body.nameInput,
			req.body.descriptionInput
		]);
		res.render('ametidnimed_lisa', {notice: req.body.nameInput + ' sisestatud'});
	}
	catch(err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('ametidnimed_lisa', {notice: 'Viga sisestamisel!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
}); */

const photoGalleryRouter = require('./routes/galleryPhotoRoutes');
app.use('/photogallery', galleryPhotoRouter);

const ametidRouter = require('./routes/ametidRoutes');
app.use('/ametid', ametidRouter);


//Galeriipiltide üleslaadimine
const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryPhotoUpload', galleryPhotoUploadRouter);


//kasutajakonto loomine
const signupRouter = require('./routes/signupRoutes');
app.use('/signup', signupRouter);

//kasutajakonto sisselogimine
const signinRouter = require('./routes/signinRoutes');
app.use('/signin', signinRouter);

app.use('/galleryPhoto', galleryPhotoRouter);


app.listen(5212);