import express from 'express';
import cors from 'cors';
import {
  AccountIdentityVerificationStatusEnum,
  ItemPublicTokenExchangeRequest,
  LinkTokenCreateRequest,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum
} from 'plaid';
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors())
console.log("dayan")

const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, linkTokenCreate } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
      'PLAID-SECRET': process.env.PLAID_SECRET
    }
});

const client = new PlaidApi(configuration);

app.post('/api/exchange_public_token', async function (

    request,

    response,

    next,

) {

  const publicToken = request.body.public_token;

  try {

    const response = await client.itemPublicTokenExchange({

      public_token: publicToken,

    });

    const accessToken = response.data.access_token;

    const itemID = response.data.item_id;

  } catch (error) {

    // handle error

  }

});


app.post('/api/create_link_token', async function (request, response) {

    console.log(process.env.PLAID_CLIENT_ID + "\n" + process.env.PLAID_SECRET)
  // Get the client_user_id by searching for the current user

  const user = {id: "user_good"};

  const clientUserId = user.id;

  const Request: LinkTokenCreateRequest = {
    client_id: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    user: {

      // This should correspond to a unique id for the current user.

      client_user_id: clientUserId,

    },

    client_name: 'unibit',

    language: 'en',

    webhook: 'https://webhook.example.com',
    products: [Products.Auth,Products.Identity],
    country_codes: [CountryCode.Us]

  };

  try {

    const createTokenResponse = await client.linkTokenCreate(Request);

    response.json(createTokenResponse.data);

  } catch (error) {

    // handle error
    console.log(error)
    response.sendStatus(500)
  }

});


app.post("/api/create_access_token", async (request,response) => {
  console.log(request.body)
  try {

    const exchangeRequest : ItemPublicTokenExchangeRequest = {
      public_token: request.body.public_token,
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET
    }

    const tokenResponse = await client.itemPublicTokenExchange(exchangeRequest)
    const accessToken = tokenResponse.data.access_token;

    const Request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: request.body.accounts[0].id,
      processor: ProcessorTokenCreateRequestProcessorEnum.Wyre
    };

    const processorTokenResponse = await client.processorTokenCreate(Request);
    const processorToken = processorTokenResponse.data.processor_token;

    response.send(processorTokenResponse)
  }catch(err)
  {
    console.log(err)
  }
})

app.listen(3000)