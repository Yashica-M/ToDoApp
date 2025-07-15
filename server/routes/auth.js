const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', (req, res, next) => {
    console.log('Google OAuth initiated from:', req.get('origin') || req.get('referer'));
    console.log('Full request URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback', 
    (req, res, next) => {
        console.log('Google callback received at:', req.protocol + '://' + req.get('host') + req.originalUrl);
        console.log('Query params:', req.query);
        next();
    },
    passport.authenticate('google', { 
        failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`, // Redirect to login on failure
        session: false // We are using JWTs, so no session is needed
    }), 
    (req, res) => {
        // On successful authentication, user object is attached to req.user
        const payload = {
            id: req.user.id,
            name: req.user.name,
            avatar: req.user.avatar
        };

        // Sign the token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // Redirect to the frontend with the token
        res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
    }
);

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    // The 'jwt' strategy in passport.js will find the user and attach it to req
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
    });
});

// @desc    Logout user (optional, as JWT is client-side)
// @route   GET /api/auth/logout
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;