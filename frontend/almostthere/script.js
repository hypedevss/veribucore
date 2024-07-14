// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    var btnCaptcha = document.getElementById('btnCaptcha');
	var btnCloseVerification = document.getElementById('btnCloseVerification');
	var closeFail = document.getElementById('closeFail');
	// the main box
	var centeredRectangle = document.getElementById('centeredRectangle');
	var verificationPopup = document.getElementById('verificationPopup');
	// the rest of the code
    btnCaptcha.addEventListener('click', async function (e) {
        e.preventDefault();
        // captchaPopup.style.display = 'flex';
		// centeredRectangle.style.display = 'none';
    });

	// Close the tab
	btnCloseVerification.addEventListener('click', function () {
		closeFail.style.display = 'flex';
		window.close()
	});
});
