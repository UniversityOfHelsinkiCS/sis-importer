# importer-mankeli
Receives data through NATS and parses it into db

# Overview of the data flow

1. Mankeli subscribes to Redis listener and listens on the CURRENT_EXECUTION_HASH channel.
2. Once it receives the message on this channel, it knows that the importer-api started the update process, so it subscribes to all the "service" channels.
3. When it receives a message on one of the service channels, it splits the received entities into two arrays: active and deleted ones.
4. For most entity types, it then bulk upserts the active entities and bulk deletes the deleted ones. There are also quite many entity types that are never deleted such as `admissionType` or `degreeTitle` for example. For such cases, we only upsert the received entities. There are some exception entity types though when the Mankeli "soft deletes" the deleted rows i.e. sets the field to `state=DELETED` in the DB. The soft deletion is done for some entities because of some services using importer and needing the information about the deleted rows. For example, the information that an enrolment has been deleted must be propagated to [Norppa](https://github.com/UniversityOfHelsinkiCS/palaute) so it can delete the corresponding "enrolment" from its own DB.
5. Below is the full list of entity types are being soft-deleted:
- `studyRight`
- `organization`
- `enrolment`
- `assessmentItem`

# Overview of the received data

With some exceptions, the data received from STAN contains an array of entities. Each of the entities is marked as either ACTIVE or DELETED. The DELETED entities are included to make sure we on Toska side know what entities to delete once they are gone from SISU.
