const express = require("express")
const router = express.Router()
const globalController = require("../../controllers/Global/GlobalController")
const auth = require("../../middleware/auth")
const login = require("../../middleware/login")

router.get("/getAuthStatus", auth ,globalController.getAuthStatus)

router.post("/signup",login, globalController.postSignUp)

router.post("/signin",login ,globalController.postLogin)

router.post("/verification/:requrl", globalController.verifyController)

router.get("/reverification", globalController.reVerify)

router.post("/signout", globalController.signout)

module.exports = router