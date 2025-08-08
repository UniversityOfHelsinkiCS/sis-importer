# importer-api

Fetches data from sis export apis and sends it to mankeli through BullMQ which is connected to Redis (https://docs.bullmq.io/).

# Overview of the data flow

1. The run function is triggered by a cronjob which is part of the same node.js process
2. Each time the cornjob is triggered, run function goes through each of the services i.e. endpoints (check `services/index.js`) such as person info, study info, enrollment info, etc.
3. For each of the services i.e. endpoints the importer will fetch all the updates since the last one (more on how later). It will fetch data in batches, not all at once. For each batch of data, it will publish a message to BullMQ message queue with all the fetched data included in the payload.
4. The app fetches data from one service at a time, sequentially
5. For each service, the app keeps an ordinal number (`LATEST_<service_key>_ORDINAL`) in redis to keep track about what updates in SISU data were already fetched and which ones not yet.
6. The app fetches the next batch of data from the SISU API starting from the last ordinal number saved in Redis (`LATEST_<service_key>_ORDINAL`) and using `FETCH_AMOUNT` from `config.js` as a limit.
7. Once the data is fetched, the app publishes the fetched data to BullMQ (to the `<service_key>_CHANNEL` channel depending on a service). For each fetch from SISU, the app publishes one or more BullMQ messages, each containing up to 1000 entities.
8. The app then listens on the feedback BullMQ queueEvents and each time it receives a message or a job that has failed that a chunk of data is divided by half and sent to the queue again until there is no more failed jobs or messages or there is only entities that always fail. Eventually, when the queue receives the ack messages for all the sent chunks, the app considers the batch to be fully processed and unsubscribes from the feedback channel.
9. Then, the app updates the ordinal number (e.g. `LATEST_<service_key>_ORDINAL`) for the corresponding service in Redis
10. If there are still updates in SISU to be fetched, the app moves on to fetching the next batch. If not, the app moves on to processing the next service.

# Overview of the fetched data

With some exceptions, the data fetched from SISU and sent to BullMQ contains an array of entities for each of the endpoints. Each of the entities is marked as either ACTIVE or DELETED. The DELETED entities are included to make sure we on Toska side know what entities to delete once they are gone from SISU.

