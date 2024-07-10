const twitter = require('twitter-api-v2');
const {google} = require('googleapis');

const { oauth } = require('./config.json');

const twitterClient = new twitter.TwitterApi({clientId: oauth.twitter.client_id, clientSecret: oauth.twitter.client_secret});

// generate twitter oauth

const twitterOauth = twitterClient.generateOAuth2AuthLink(oauth.twitter.callback_url, {scope: ['users.read', 'tweet.read']});

// generate google oauth

const googleClient = new google.auth.OAuth2(
	oauth.google.client_id,
	oauth.google.client_secret,
	oauth.google.callback_url
)

const googleOauth = googleClient.generateAuthUrl({access_type: "online", prompt: "consent", scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]})

console.log(`-------------- Twitter --------------`)
console.log(`URL: ${twitterOauth.url}`)
console.log(`Code Verifier: ${twitterOauth.codeVerifier}`)

console.log(`-------------- Google --------------`)
console.log(`URL: ${googleOauth}`)
console.log(`--------------- DONE ---------------`)