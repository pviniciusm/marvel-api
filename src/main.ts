import express from 'express';
import cors from 'cors';
import axios from 'axios';
import md5 from 'md5';
require('dotenv/config');

const app = express();
app.use(express.json());
app.use(cors());

const apiMarvel = axios.create({
    baseURL: "http://gateway.marvel.com/v1/public"
});

// ts       => timestamp
// apikey   => chave publica
// hash     => md5

function createAuth() {
    const ts = new Date().getTime();
    const apikey = process.env.PUBLICKEY;
    const privatekey = process.env.PRIVATEKEY;
    const hash = md5(ts.toString() + privatekey + apikey);

    return {
        ts, 
        apikey, 
        hash
    }
}

app.get("/", async (req, res) => {
    try {
        const page: number = req.query.page
            ? parseInt(req.query.page as string)
            : 1;

        const limit: number = req.query.limit
            ? parseInt(req.query.limit as string)
            : 10;

        const name = req.query.name
            ? req.query.name as string
            : undefined;

        const offset = limit * (page - 1);

        const apiResponse = await apiMarvel.get("/characters", {
            params: {
                ...createAuth(),
                limit, 
                offset,
                nameStartsWith: name
            }
        });
        let characters = apiResponse.data.data.results;

        characters = characters.map((character: any) => {
            return {
                id: character.id,
                name: character.name,
                photo: `${character.thumbnail.path}.${character.thumbnail.extension}`
            }
        });

        return res.send({
            data: characters,
            message: "it is ok"
        });

    } catch(err: any) {
        return res.status(500).send({
            message: err.toString()
        });
    }
});

app.listen(8081, () => console.log("Server is running..."));
