import serverless from 'serverless-http'
import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors'

const appV1 = express();
appV1.use(cors({ optionsSuccessStatus: 200 }));
appV1.use(bodyParser.json({ strict: true }));
appV1.use(bodyParser.urlencoded({ extended: true }));

module.exports.v1 = serverless(appV1)
