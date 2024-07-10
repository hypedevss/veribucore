// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    var btnCaptcha = document.getElementById('btnCaptcha');
    var captchaPopup = document.getElementById('captchaPopup');
	var btnCloseVerification = document.getElementById('btnCloseVerification');
	var closeFail = document.getElementById('closeFail');
	// the main box
	var centeredRectangle = document.getElementById('centeredRectangle');
	var verificationPopup = document.getElementById('verificationPopup');
    var captchaSiteKey = '6LchCvgpAAAAANQElUdhUH9dIoWGrQzbPHB4Fobb'; // Replace with your reCAPTCHA site key
	// aes stuff
	async function encryptIP(str) {
		const key = "UCL)~N8Z2_,5$HE:;K?#JYVF4.=+]WQ&*-!SG`T{>M<}63PD(@".toString("hex")
		const encrypted = CryptoJS.AES.encrypt(str, key).toString()
		return encrypted;
		
	}
	// the rest of the code
    btnCaptcha.addEventListener('click', async function (e) {
        e.preventDefault();
        // captchaPopup.style.display = 'flex';
		// centeredRectangle.style.display = 'none';
    });

    // Initialize reCAPTCHA
    var recaptchaWidget;
    btnCaptcha.addEventListener('click', function () {
        if (true) return alert("crazy bypass??")
    });

	// Close the tab
	btnCloseVerification.addEventListener('click', function () {
		closeFail.style.display = 'flex';
		window.close()
	});
});
