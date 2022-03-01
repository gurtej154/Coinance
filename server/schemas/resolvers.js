const { AuthenticationError } = require('apollo-server-express')
const { User } = require('../models')
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        users: async () => {
            return User.find().populate('thoughts')
        },
        user: async (parent, { username }) => {
            return User.findOne({ username }).populate('thoughts')
        },
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({ username, email, password })
                const token = signToken(user)
                return { token, user }
            } catch (error) {
                throw new Error('User Creation fail!')
            }
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email })

            if (!user) {
                throw new AuthenticationError(
                    'No user found with this email address'
                )
            }

            const correctPw = await user.isCorrectPassword(password)

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials')
            }

            const token = signToken(user)

            return { token, user }
        },
    },
}

module.exports = resolvers