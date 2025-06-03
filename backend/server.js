import express from 'express';
import fs from 'fs';
import users_router from './routes/user_routes.js';
const app = express();

const corsOptions = {
  origin: 'https://e2425-wads-l4ccg3-client.csbihub.id', // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true, // Allow cookies, authorization headers
};

// Use CORS middleware BEFORE your routes
app.use(cors(corsOptions));

app.use(express.json());
app.use('/api', users_router);


// // dummy database
// var obj;
// fs.readFile("./database/users.json", "utf-8", (err, data) => {
//     if (err) throw err;
//     obj = JSON.parse(data);
// })

// PORT, .env variables
const port = process.env.PORT || 30;

app.listen(port, (req, res) => {
    console.log(`Listening on port ${port}`);
});

// setting basic endpoints
app.get('/', (req, res) => {
    console.log(`Connect to server at port ${port}`);
    res.send(`Goodbye World`);
});