const express = require("express")
const router = express.Router()
const globalController = require("../../controllers/Global/GlobalController")
const auth = require("../../middleware/auth")
const login = require("../../middleware/login")

router.get("/getAuthStatus", auth ,globalController.getAuthStatus) //completed

router.post("/signup",login, globalController.postSignUp) //completed

router.post("/signin",login ,globalController.postLogin) //completed

router.post("/verification/:requrl", globalController.verifyController) //completed

router.get("/reverification", globalController.reVerify) //completed

router.post("/subscription", auth, globalController.subscriptionController) //completed

router.post("/signout", auth,globalController.signout) //completed

router.post("/forgot-password", globalController.getForgotPassword) //completed

router.post("/forgot-reset/:forgotURL", globalController.forgot_reset) //completed

router.post("/reset-password", auth, globalController.reset_password) // incomplete

// Things need to be completed : node-cron-setup, 
// Things need to be re-enabled: node-mailer

module.exports = router