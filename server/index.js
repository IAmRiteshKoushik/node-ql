const express = require("express");
const { ApolloServer } = require("@apollo/server")
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

async function startServer(){
    const app = express();
    const server = new ApolloServer({
        // Things to Know :
        // 1. An exclaimation point after a datatype means that it is a 
        // mandatory field. Other fields can be empty but these cannot be.
        // 2. Fetching using GraphQL - Query 
        // 3. Updating / Adding using GraphQL - Mutation
        typeDefs: `
            type User {
                id: ID!
                name: String!
                username: String!
                email: String!
                phone: String!
                website: String!
            }

            type Todo {
                id: ID!
                title: String
                completed: Boolean
                userId: ID!
            }
            
            type Query {
                getTodos: [Todo]
                getAllUsers: [User]
                getUser(id: ID!): User
            }
        `,
        // Resolvers is where the logic lies 
        resolvers: {
            Query: {
                // getTodos: () => [{ 
                //     id: 1, 
                //     title: "Something something", 
                //     completed: false,
                // }]
                getTodos: async () => (await axios.get("https://jsonplaceholder.typicode.com/todos")).data,
                getAllUsers: async () => (await axios.get("https://jsonplaceholder.typicode.com/users")).data,
                getUser: async (parent, { id }) => 
                    (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`))
                        .data,
            }
        },
    });

    // Adding basic middleware
    app.use(bodyParser.json());
    app.use(cors());

    // Starting graphql-Hserver
    await server.start();

    // If any request url begins with /graphql then that is redirected to be 
    // handled by the expressMiddleware provided by @apollo/server
    app.use("/graphql", expressMiddleware(server));

    app.listen(8000, () => console.log("Server listening at PORT 8000"));
}

startServer();
