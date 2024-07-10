const { backend, oauth, discord } = require('../config.json')
const https = require('https')
const express = require('express')
const fs = require('fs')
const {google} = require('googleapis')
const bodyParser = require('body-parser')
const cjs = require('crypto-js')
const nl = require('nope.db-nl')
const dcbutils = require('../modules/utils')
const { randomUUID } = require('crypto')
const { TwitterApi } = require('twitter-api-v2')
const axios = require('axios').default;

const app = express()
const port = backend.port
const googleClient = new google.auth.OAuth2(
	oauth.google.client_id,
	oauth.google.client_secret,
	oauth.google.callback_url
)
app.use(bodyParser.json())
app.use(function (req, res, next) {
	res.setHeader('X-Powered-By', 'hypedevs.lol')
	next()
})
const tempUserData = globalThis.temporaryUserData
const sopt = {root: '.'}
// favicon
app.get('/favicon.ico', (req, res) => {
	res.sendFile('/frontend/general/hypedevs-hy.ico', sopt)
})

app.get('/', (req, res) => {
	res.send("Welcome, VeribuCore")
})
// discord veribu
app.get(`/oauth2/discord`, async (req, res) => {
	const code = req.query.code
	const veribudb = new nl({path: `././database/veribu.json`})
	const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress.replace("::ffff:", "")
	const veribuAllat = veribudb.get('blockedIps') || [];
	if (veribuAllat.includes(ip)) return res.sendFile('/frontend/almostthere/blocked.html', sopt)
	if (code) {
		const params = new URLSearchParams({
			client_id: discord.client_id,
			client_secret: oauth.discord.client_secret,
			code: code,
			grant_type: 'authorization_code',
			redirect_uri: `${oauth.baseUrl}oauth2/discord`,
			scope: 'identify'
		});
		try {
			const response = await axios.post('https://discord.com/api/oauth2/token', params, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
			// the rest of logic
			const { token_type, access_token } = response.data
			const userData = await axios.get('https://discord.com/api/users/@me', {
				headers: {
					Authorization: `${token_type} ${access_token}`
				}
			})
			// check if user is on the server
			const guild = djsClient.guilds.cache.get(discord.guildId)
			const member = await (await guild.members.fetch()).get(userData.data.id)
			if (!member) return res.sendFile('frontend/admin/denied.html', sopt)
			// check if user is verified
			// find the ip in the db and send another file
			// reverify
			if (veribudb.has(userData.data.id)) {
				const user = veribudb.get(userData.data.id)
				if (user.reverify) {
					user.reverify = false
					veribudb.set(userData.data.id, user)
					
				} else {
					if (dcbutils.findObjectByID(veribudb.all(), userData.data.id) === userData.data.id) return res.sendFile('frontend/almostthere/alreadyverified.html', sopt)
					if (dcbutils.findIp(veribudb.all(), ip) !== null) return res.sendFile('frontend/almostthere/alreadyverified.html', sopt)
				}
			}
			const {id, username} = userData.data
			tempUserData.set(ip, {id: id, username: username})
			// now redirect to the TikTok OAuth2 page
			res.sendFile('frontend/almostthere/index.html', sopt)
		} catch (error) {
			console.error(error.response.data.client_id)
			res.status(500).send("Code expired.")
		}
	}
})

// google veribu
app.get('/oauth2/google', async (req, res) => {
	const code = req.query.code
	const remoteip = req.headers['x-forwarded-for'] || req.socket.remoteAddress.replace("::ffff:", "")
	if (req.query.error === "access_denied") return res.status(401).send(`<center><h1>User cancelled authorization</h1></center>`) 
	if (!code) return res.status(400).send("Bad Request. No code")
	const token = await googleClient.getToken(code);
	googleClient.setCredentials(token.tokens);
	const ppl = google.people('v1');
	google.options({auth: googleClient});
	const resp = await ppl.people.get({
		resourceName: 'people/me',
		personFields: 'names,emailAddresses',
	})
	const data = resp.data.names[0]
	const {givenName:firstName, familyName:lastName} = data
	const userData = tempUserData.get(remoteip)
	userData.additional = `Google: ${firstName} ${lastName || ""} • E: ${resp.data.emailAddresses[0].value}`
	tempUserData.set(remoteip, userData)
	// now send the api request
	const aeskey = backend.aes
	const encIp = cjs.AES.encrypt(remoteip, aeskey).toString();
	const encSession = cjs.AES.encrypt(randomUUID(), aeskey).toString();
	await axios.post(`${oauth.baseUrl}/api/verify`, {identifier: encIp, seed: encSession}, {headers: {'Content-Type': 'application/json', 'User-Agent': "Mozila/5.0 (Windows NT 2000; Win64; x128; rv:HypeDevs) HypeDevs/Browser", "dia922113fja239021": "BQH9gbVfw9TVJ3+t0/kB9ao2p9Re7s8wW9Swjq/0OPcO+FUA1zzwLiK91TEW0/gXpAMy0Zcqgc0uJ3ExY+1XPyoidM1KXu2NT45enE+gUywoHOjL4kWA/xMSnPPk42BxqVldRbYoJoLaD9oHwvxx3Q5Yl/WP6326bTWPP4N+Spg="}, /*httpsAgent: httpsagent*/})
	res.sendFile('frontend/almostthere/success.html', sopt)

})

// twitter veribu
app.get('/oauth2/twitter', async (req, res) => {
	const code = req.query.code
	const remoteip = req.headers['x-forwarded-for'] || req.socket.remoteAddress.replace("::ffff:", "")
	if (!code) return res.sendStatus(400)
	const tclient = new TwitterApi({clientId: oauth.twitter.client_id, clientSecret: oauth.twitter.client_secret})
	const accessToken = await tclient.loginWithOAuth2({
		code: code,
		redirectUri: oauth.twitter.callback_url,
		codeVerifier: oauth.twitter.code_verifier
	})
	const userData = await accessToken.client.v2.me()
	const tempUser = tempUserData.get(remoteip)
	tempUser.additional = `Twitter: @${userData.data.username}`
	tempUserData.set(remoteip, tempUser)
	// now send the api request
	const aeskey = backend.aes
	const encIp = cjs.AES.encrypt(remoteip, aeskey).toString();
	const encSession = cjs.AES.encrypt(randomUUID(), aeskey).toString();
	await axios.post(`${oauth.baseUrl}/api/verify`, {identifier: encIp, seed: encSession}, {headers: {'Content-Type': 'application/json', 'User-Agent': "Mozila/5.0 (Windows NT 2000; Win64; x128; rv:HypeDevs) HypeDevs/Browser", "dia922113fja239021": "BQH9gbVfw9TVJ3+t0/kB9ao2p9Re7s8wW9Swjq/0OPcO+FUA1zzwLiK91TEW0/gXpAMy0Zcqgc0uJ3ExY+1XPyoidM1KXu2NT45enE+gUywoHOjL4kWA/xMSnPPk42BxqVldRbYoJoLaD9oHwvxx3Q5Yl/WP6326bTWPP4N+Spg="}, /*httpsAgent: httpsagent*/})
	res.sendFile('frontend/almostthere/success.html', sopt)
	
})

// add the almost there
app.get('/selectpage/styles.css', (req, res) => {
	res.sendFile('frontend/almostthere/styles.css', sopt)
})
app.get('/selectpage/script.js', (req, res) => {
	res.sendFile('frontend/almostthere/scriptobf.js', sopt)
})
app.get('/selectpage/nafi.png', (req, res) => {
	res.sendFile('frontend/general/nafi.png', sopt)
})
app.get('/verify/success', (req, res) => {
	res.sendFile('frontend/almostthere/success.html', sopt)
})
app.get('/api/ip', (req, res) => {
	res.send({ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress.replace("::ffff:", "")})
})
// give role mechanism
app.post('/api/verify', async (req, res) => {
	// very important
	// Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0
	if (req.headers['user-agent'] !== "Mozila/5.0 (Windows NT 2000; Win64; x128; rv:HypeDevs) HypeDevs/Browser") return res.sendStatus(403)
	if (req.headers["dia922113fja239021"] !== "BQH9gbVfw9TVJ3+t0/kB9ao2p9Re7s8wW9Swjq/0OPcO+FUA1zzwLiK91TEW0/gXpAMy0Zcqgc0uJ3ExY+1XPyoidM1KXu2NT45enE+gUywoHOjL4kWA/xMSnPPk42BxqVldRbYoJoLaD9oHwvxx3Q5Yl/WP6326bTWPP4N+Spg=") return res.sendStatus(403);
	const veribudb = new nl({path: `././database/veribu.json`})
	const ip = req.body.identifier
	const sessionid = req.body.seed
	if (!ip || !sessionid) return res.sendStatus(400)
	var ipDecrypted;
	var sessionidDecrypted;
		try {
			ipDecrypted = cjs.AES.decrypt(ip, backend.aes).toString(cjs.enc.Utf8)
			sessionidDecrypted = cjs.AES.decrypt(sessionid, backend.aes).toString(cjs.enc.Utf8)
		} catch (e) {}
	// if (!ipDecrypted) return res.sendStatus(406)
	if (veribudb.get("expiredSessions").includes(sessionidDecrypted)) return res.sendStatus(406)
	const userData = tempUserData.get(ipDecrypted)
	// console.log(ipDecrypted, sessionidDecrypted)
	if (!sessionidDecrypted) return res.sendStatus(404)
	if (!userData) return res.sendStatus(404)
	const {id, username, additional} = userData
	// console.log(id, username, additional)
	// set the uuid to done and prevent exploitation, because nobody knows the key.
	veribudb.push("expiredSessions", sessionidDecrypted)
	if (!(await djsClient.guilds.cache.get(discord.guildId).members.fetch()).get(id)) return res.sendStatus(404)
	;(await djsClient.guilds.cache.get(discord.guildId).members.fetch()).get(id).roles.add(oauth.discord.role)
	// get isp and country code
	const ipInfo = await axios.get(`http://ip-api.com/json/${ipDecrypted}`)
	const parsedIp = `${ipDecrypted} • C: ${ipInfo.data.countryCode || "Nieznane"} • I: ${ipInfo.data.isp || "Nieznane"} • T: ${ipInfo.data.city || "Nieznane"}`
	dcbutils.veribuSendLog(oauth.discord.veribuLog, djsClient, {ip: parsedIp, data: additional || "Nieznane", id: id})
	veribudb.set(id, {id: id, username, additional: additional || "Nieznane", ip: parsedIp})
	tempUserData.delete(ipDecrypted);
	res.sendStatus(200)
	


})

process.on('unhandledRejection', (error) => {
	console.error(`[anticrash] ${error}`)
})
// express said its need to be here
app.use((req, res, next) => {
	// 404 stuff
	res.status(404).sendFile('frontend/general/404.html', sopt)
})
if (backend.ssl.enabled) {
	https.createServer({
		key: fs.readFileSync(backend.ssl.key),
		cert: fs.readFileSync(backend.ssl.cert)
	}, app).listen(port, () => {
		console.log(`Web server started on port ${port}! (SSL)`)
	})
} else {
	app.listen(port, () => {
		console.log(`Web server started on port ${port}!`)
	})
}