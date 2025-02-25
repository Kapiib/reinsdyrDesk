const db = require("../db/dbConfig.js");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwtUtils.js") 
const jwt = require("jsonwebtoken");

const EIER = require("../models/eier");

const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

const validateEmail = require("../utils/validateEmailConfig.js");

const authController = {
    register: async (req, res) => {
        const { navn, epost, passord, Rpassord } = req.body;
    
        if (!navn || !epost || !passord || !Rpassord) {
            return res.render('register', {
                title: 'Register',
                success: false,
                msg: "Please fill in all fields!",
                navn,
                epost,
                passord,
                Rpassord
            });
        }
    
        if (!validateEmail(epost)) {
            return res.render('register', {
                title: 'Register',
                success: false,
                msg: "Please enter a valid email!",
            });
        }
    
        if (passord !== Rpassord) {
            return res.render('register', {
                title: 'Register',
                success: false,
                msg: "Passwords do not match!",
            });
        }
    
        const existingUser = await EIER.findOne({ epost });
        if (existingUser) {
            return res.render('register', {
                title: 'Register',
                success: false,
                msg: "Email already in use!",
            });
        }
    
        const hashedPassord = await bcrypt.hash(passord, saltRounds);
    
        try {
            await EIER.create({
                navn,
                epost,
                passord: hashedPassord,
            });
    
            return res.redirect("/auth/login");
    
        } catch (error) {
            console.log('Registration error:', error);
            return res.render('register', {
                title: 'Register',
                success: false,
                msg: "Something went wrong, please try again!",
            });
        }
    },
    login: async (req, res) => {
        const { epost, passord } = req.body;

        try {
            const user = await EIER.findOne({ epost });

            if (!user) {
                return res.status(404).send("User not found");
            }

            const isMatch = await bcrypt.compare(passord, user.passord);

            if (!isMatch) {
                return res.status(401).send("Invalid credentials");
            }   

            const payload = {
                _id: user._id,
                epost: user.epost,
                navn: user.navn,
            };

            const token = generateToken(payload);

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 24
            });

            return res.redirect("/api/profile");
        } catch (error) {
            conole.log("Login error", error);
            return res.render('login', {
                title: 'Login',
                success: false,
                msg: "Something went wrong, please try again!",
            });
        }
    },
    logout: async (req, res) => {
        res.clearCookie('jwt');
        return res.redirect("/");
    }
}

module.exports = authController;