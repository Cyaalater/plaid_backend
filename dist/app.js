"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const plaid_1 = require("plaid");
require('dotenv').config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
console.log("dayan");
const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, linkTokenCreate } = require('plaid');
const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
        'PLAID-SECRET': process.env.PLAID_SECRET
    }
});
const client = new PlaidApi(configuration);
app.post('/api/create_link_token', function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(process.env.PLAID_CLIENT_ID + "\n" + process.env.PLAID_SECRET);
        // Get the client_user_id by searching for the current user
        const user = { id: "user_good" };
        const clientUserId = user.id;
        const Request = {
            client_id: process.env.PLAID_CLIENT_ID,
            secret: process.env.PLAID_SECRET,
            user: {
                // This should correspond to a unique id for the current user.
                client_user_id: clientUserId,
            },
            client_name: 'unibit',
            language: 'en',
            webhook: 'https://webhook.example.com',
            products: [Products.Auth, Products.Identity],
            country_codes: [CountryCode.Us],
        };
        try {
            const createTokenResponse = yield client.linkTokenCreate(Request);
            response.json(createTokenResponse.data);
        }
        catch (error) {
            // handle error
            console.log(error);
            response.sendStatus(500);
        }
    });
});
app.post("/api/create_access_token", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(request.body);
    try {
        const tokenResponse = yield client.itemPublicTokenExchange({
            public_token: request.body.public_token
        });
        const accessToken = tokenResponse.access_token;
        const Request = {
            access_token: accessToken,
            account_id: request.body.accounts[0].id,
            processor: plaid_1.ProcessorTokenCreateRequestProcessorEnum.Wyre
        };
        const processorTokenResponse = yield client.processorTokenCreate(Request);
        const processorToken = processorTokenResponse.processor_token;
        response.send(processorTokenResponse);
    }
    catch (err) {
        console.log(err);
    }
}));
app.listen(3000);
//# sourceMappingURL=app.js.map