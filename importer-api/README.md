# importer-api

Fetches data from sis export apis and sends it to mankeli through nats (STAN actually https://github.com/nats-io/stan.go?tab=readme-ov-file).

# Overview of the data flow

1. The run function is triggered by a cronjob which is part of the same node.js process
2. Each time the cornjob is triggered, run function goes through each of the services i.e. endpoints (check `services/index.js`) such as person info, study info, enrollment info, etc.
3. For each of the services i.e. endpoints the importer will fetch all the updates since the last one (more on how later). It will fetch data in batches, not all at once. For each batch of data, it will publish a message to STAN with all the fetched data included in the payload.
4. The app fetches data from one service at a time, sequentially
5. For each service, the app keeps an ordinal number in redis to keep track about what updates in SISU data were already fetched and which ones not yet.
6. The app fetches the next batch of data from the SISU API starting from the last ordinal number saved in Redis and using FETCH_AMOUNT from `config.js` as a limit.
7. Once the data is fetched, the app publishes the fetched data to STAN. For each fetch from SISU, the app publishes multiple STAN messages splitting the fetched data in equal smaller chunks.
8. The app then sets Redis keys corresponding with the current service indicating how many entities were scheduled i.e. sent to STAN and how many entities were ackonwledged via the STAN's feedback channel. Immediately after each publish, the values are equal to `entities.length` and `0` respectively.
9. The app then listens on the feedback STAN channel and each time it receives a message that a chunk of the previously sent data was processed, it increments the `<service_key>_UPDATED` Redis key by the amount of the processed entities. Eventually, when the app receives the ack messages for all the sent chunks, the app considers the batch to be fully processed and unsubscribes from the feedback channel.
10. Then, the app updates the ordinal number for the corresponding service in Redis
11. If there are still updates in SISU to be fetched, the app moves on to fetching the next batch. If not, the app moves on to processing the next service.
12. Once all the updates for all the services, were fetched, published and processed i.e. acknowledged, the app sends a post-update message on the `POST_UPDATE` channel. The message is meant to indicate that all the updates in the current cronjob run are done.

# Overview of the fetched data

With some exceptions, the data fetched from SISU and sent to STAN contains an array of entities for each of the endpoints. Each of the entities is marked as either ACTIVE or DELETED. The DELETED entities are included to make sure we on Toska side know what entities to delete once they are gone from SISU.

