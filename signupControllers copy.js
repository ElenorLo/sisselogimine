const mysql = require('mysql2/promise');
const validator = require('validator');
const argon = require('argon2');
// @desc page creating user account
// @route GET /signup
// @access public

const signupPage = (req, res) =>{
	res.render('signup', {notice: 'ootan andmeid!'});
};

// @desc page creating user account
// @route POST /signup
// @access public

const signupPagePost = async (req, res) =>{
	let conn; 
	//andmete puhastamiine ja valideerimine
	const firstName = validator.escape(req.body.firstNameInput.trim());
	const lastName = validator.escape(req.body.lastNameInput.trim());
	const birthDate = req.body.birthDateInput
	const gender = req.body.genderInput
	const email = req.body.emailInput.trim();
	const password = req.body.passwordInput;
	const confirmPassword = req.body.confirmPasswordInput;
	
	//kontrollime kas kõik oluline on olemas
	if(!firstName || !lastName || !birthDate || !gender || !email || !password || !confirmPassword){
		
	}
	
	//kas email on korrektne
	if(!validator.isEmail(email)){
		notice = 'E-maili aadress pole korrektne!';
		return res.render('signup', {notice: notice});
	}
	
	//kas parool on tugev
	const passwordOptions = {minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers:1, minSymbols: 0};
	if(!validator.isStrongPassword(password, passwordOptions)){
		
	}
	
	//kas paroolid ühtivad 
	if(password !== confirmPassword) {
		notice = 'Sisestatud salasõnad ei ole ühesugused!';
		return res.render('signup', {notice: notice});
	}
	
	//kas sünnikuupäev on korrektne
	if(!validator.isDate(birthDate) || validator.isAfter(birthDate)){
		notice = 'Sisestatud sünnikuupäev ei ole korrektne!';
		return res.render('signup', {notice: notice});
	}
	
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//kontrollin kas selline kasutaja on juba olemas
		let sqlReq = 'SELECT id FROM users WHERE email = ?';
		const [users] = await conn.execute(sqlReq, [email]);
		if(users.length > 0){
			notice = 'Selline kasutaja juba eksisteerib!';
			return res.render('signup', {notice: notice});
		}
		
		//krüpteerime koodi
		const pwdHash = await argon.hash(password);
		
		sqlReq = 'INSERT INTO users (firstname, lastname, birthdate, gender, email, password) VALUES (?,?,?,?,?,?)';
		const [result] = await conn.execute(sqlReq, [
			firstName, 
			lastName,
			birthDate,
			gender,
			email,
			pwdHash
		]);
		
		res.render('signup', {notice:'Kasutajakonto loodud!'});
		
	}
	catch(err) {
		console.log('Viga' + err);
		res.render('signup', {notice:'Kasutajakonto loomine ei õnnestunud!'});
	}
	finally {
		if(conn)
			await conn.end();
		}
}

module.exports = {
    signupPage,
	signupPagePost
};
