import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import passport from 'passport'
import { User } from '../models/userModel.js'

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
        let user = User.findOneAndUpdate({ googleId: profile.id });
        
        if(!user) {
            user = await User.create({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.email[0].value,
                avatar: profile.photos[0].value
            })
        }

        return cb(null, user);
    } catch (error) {
        return cb(error, null)
    }
    
  }
));