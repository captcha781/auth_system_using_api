require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const Verifications = require("../../models/Verifications");
const nodemailer = require("nodemailer")

function makeUrl(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

}


const sendEmail = async (mailObj) => {
  const { from, recipients, subject, message } = mailObj;

  try {
    // Create a transporter
    // console.log(`API_KEY = ${process.env.API_KEY}`);
    let transporter = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: process.env.NODEMAILER_USER,
        apikey: process.env.API_KEY,
        pass: process.env.NODEMAILER_PASS
      },
    });

    // send mail with defined transport object
    let mailStatus = await transporter.sendMail({
      from: from, // sender address
      to: recipients, // list of recipients
      subject: subject, // Subject line
      text: message, // plain text
    });

    console.log(`Message sent: ${mailStatus.messageId}`);
    return `Message sent: ${mailStatus.messageId}`;
  } catch (error) {
    console.error(error);
    throw new Error(
      `Something went wrong in the sendmail method. Error: ${error.message}`
    );
  }
};

// To get Status of Authentication
exports.getAuthStatus = (req, res) => {
  if (req.session.user) {
    res.json({ auth: true, user: req.session.user, redirection: null });
    return;
  }
  res.json({ auth: false, user: req.session.user, redirection: "/signin" });
};

// To sign up the user and create a session for the corresponding user
exports.postSignUp = (req, res) => {
  // checking the existance of the user
  User.exists({
    $or: [
      { email: req.body.email },
      { username: req.body.username },
      { phonenumber: req.body.phonenumber, countryCode: req.body.countryCode },
    ],
  })
    // this returns null if no user exists
    .then((result) => {
      if (result !== null) {
        res.json({
          creation: false,
          message:
            "An User already exists with the given credentials, please change your credentials in order to continue",
        });
        return;
      }
      // Checking the password eqaulity and requireds
      if (
        req.body.password.trim() === req.body.confirmpassword.trim() &&
        req.body.username &&
        req.body.phonenumber &&
        req.body.email &&
        req.body.countryCode &&
        req.body.firstname &&
        req.body.lastname &&
        req.body.dateOfBirth &&
        req.body.address &&
        /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/.test(
          req.body.password
        ) &&
        /^[a-zA-Z\-]+$/.test(req.body.username) &&
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email) &&
        /^\d{10}$/.test(req.body.phonenumber)
      ) {
        bcrypt
          .hash(req.body.password.trim(), parseInt(process.env.SALT_ROUNDS))
          .then((password) => {
            User.create({
              firstname: req.body.firstname.trim(),
              lastname: req.body.lastname.trim(),
              username: req.body.username.toLowerCase().trim(),
              password: password,
              role: "user",
              subscribed: false,
              dateOfBirth: req.body.dateOfBirth,
              email: req.body.email.trim().toLowerCase(),
              countryCode: req.body.countryCode,
              phonenumber: req.body.phonenumber.trim(),
              address: req.body.address.trim(),
              profilePicture: req.body.profilePicture,
              verified: false,
            })
              .then((creationResponse) => {
                const verifyURL = makeUrl(20);
                Verifications.create({
                  username: creationResponse.username,
                  url: verifyURL,
                  validity: Date.now() + 5 * 60 * 1000,
                }).then((verifyResponse) => {
                  req.session.user = creationResponse;
                  const token = jwt.sign(
                    { id: creationResponse._id },
                    process.env.JWT_SECRET
                  );
                  
                  const mailObj = {
                    from: process.env.NODEMAILER_USER,
                    recipients: [creationResponse.email],
                    subject: "Verification Mail",
                    message: `
                    Yayy.., Mr.${creationResponse.firstname}, your account has been successfully created.,
                    
                    Your Verification URL is \n
                      http://localhost:3001/verification/${verifyResponse.url}
                    `,
                  };
                  
                  sendEmail(mailObj).then((mailres) => {
                    console.log(mailres);
                    res.json({
                      creation: true,
                      auth: true,
                      message:
                        "Yayy..., Your Account has been created Successfully",
                      redirection: null,
                      user: creationResponse,
                      token,
                    });
                    return;
                  });

                });
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  creation: false,
                  message: "Some error occured please try again layer inner",
                });
                return;
              });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              creation: false,
              message: "Some error occured please try again layer outer",
            });
            return;
          });
      } else {
        res.json({
          creation: false,
          message: "Passwords you entered didn't match, please enter correctly",
        });
        return;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogin = (req, res) => {
  const input = req.body.userEntry;
  const password = req.body.password;
  if (req.session.user && req.session.user.subscribed) {
    console.log(req.session.user);
    const token = jwt.sign(
      { id: req.session.user._id },
      process.env.JWT_SECRET
    );
    res.json({
      auth: true,
      message: "Yo, You are already logged in !!!",
      redirection: "/dashboard",
      token: token,
    });
    return;
  }
  User.findOne({
    $or: [{ username: input }, { email: input }, { phonenumber: input }],
  })
    .then((response) => {
      bcrypt
        .compare(password, response.password)
        .then((passcomparison) => {
          if (!passcomparison) {
            res.json({
              auth: false,
              message:
                "Oh oh.., You've entered the wrong password, please enter the correct password",
            });
            return;
          }
          const token = jwt.sign({ id: response._id }, process.env.JWT_SECRET);
          req.session.user = response;

          if (!response.verified) {
            const verifyURL = makeUrl(20);
            Verifications.create({
              username: response.username,
              url: verifyURL,
              validity: Date.now() + 5 * 60 * 1000,
            })
              .then((verifyResponse) => {

                const mailObj = {
                  from: process.env.NODEMAILER_USER,
                  recipients: [response.email],
                  subject: "Verification Mail",
                  message: `
                  Your Verification URL is \n
                    http://localhost:3001/verification/${verifyResponse.url}
                  `,
                };
                
                sendEmail(mailObj).then((mailres) => {
                  console.log(mailres);
                  res.json({
                    auth: true,
                    message: "Yayy..., Logged in Successfully",
                    redirection: null,
                    user: response,
                    token,
                  });
                  return;
                });

              })
              .catch((err) => {
                console.log(err);
              });
          } else if (!response.subscription) {
            res.json({
              auth: true,
              message: "Yayy..., Logged in Successfully",
              redirection: "/subscription",
              user: response,
              token,
            });
            return;
          } else {
            res.json({
              auth: true,
              message: "Yayy..., Logged in Successfully",
              redirection: "/dashboard",
              user: response,
              token,
            });
            return;
          }
        })
        .catch((err) => {
          console.log(err);
          res.json({
            auth: false,
            message: "Oh no, Some Error occured please try again.",
          });
          return;
        });
    })
    .catch((err) => {
      res.json({
        auth: false,
        message:
          "Ahhh.., No user found with this credential, Please enter the correct credential",
      });
    });
};

exports.verifyController = (req, res) => {
  let url = req.params.requrl;

  Verifications.findOne({ url: url })
    .then((response) => {
      

      if (response == null) {
        res.json({
          message: "You are already Verified",
          redirection: "/subscription",
        });
        return;
      }

      if (response !== null) {
        User.findOne({ username: response.username }).then((userRes) => {
          if (userRes.verified) {
            Verifications.deleteOne({ username: response.username }).then(
              (deleteResponse) => {
                res.json({
                  message: "You are already Verified",
                  redirection: "/subscription",
                });
                return;
              }
            );
            return;
          }
        });
      }

      let now = Date.now();
      if (response.validity >= now) {
        User.updateOne({ username: response.username }, { verified: true })
          .then((updateResponse) => {
            console.log(updateResponse);
            Verifications.deleteOne({ username: response.username }).then(
              (deleteResponse) => {
                res.json({
                  message: "Verified Successfully",
                  redirection: "/subscription",
                });
                return;
              }
            );
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (response.validity < now) {
        Verifications.deleteOne({ username: response.username }).then(
          (deleteResponse) => {
            res.json({
              message: "Verification Link expired",
              redirection: null,
            });
            return;
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.reVerify = (req, res) => {
  const verifyURL = makeUrl(20);

  Verifications.deleteOne({ username: req.query.username }).then((delRes) => {
    console.log(delRes);
    Verifications.create({
      username: req.query.username,
      url: verifyURL,
      validity: Date.now() + 5 * 60 * 1000,
    })
      .then((verifyResponse) => {

        const mailObj = {
          from: process.env.NODEMAILER_USER,
          recipients: [response.email],
          subject: "Verification Mail",
          message: `
          Your Verification URL is \n
            http://localhost:3001/verification/${verifyResponse.url}
          `,
        };
        
        sendEmail(mailObj).then((mailres) => {
          console.log(mailres);
          res.json({
            message: "Your New Verification URL is sent to your registered email",
            redirection: null,
          });
          return;
        });

        
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.signout = (req,res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.json({auth: false, redirection: "/signin"})
    return
  })
}