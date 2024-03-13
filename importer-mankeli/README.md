# importer-mankeli
Receives data through NATS and parses it into db

# Overview of the data flow

1. Mankeli subscribes to Redis listener and listens on the CURRENT_EXECUTION_HASH channel.
2. Once it receives the message on this channel, it knows that the importer-api started the update process, so it subscribes to all the "service" channels.
3. When it receives a message on one of the service channels, it splits the received entities into two arrays: active and deleted ones.
4. It then bulk upserts the active entities and bulk deletes the deleted ones.

# Overview of the received data

With some exceptions, the data received from STAN contains an array of entities. Each of the entities is marked as either ACTIVE or DELETED. The DELETED entities are included to make sure we on Toska side know what entities to delete once they are gone from SISU.
