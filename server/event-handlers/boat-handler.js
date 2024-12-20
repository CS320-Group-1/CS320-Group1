import { Boat } from "../models/subscribers.js";
import { Race } from "../models/subscribers.js";

export function BoatHandler(io, socket) {
  socket.on("addBoats", addBoats);
  socket.on("getBoats", getBoats);
  socket.on("getBoatById", getBoatById);
  socket.on("searchBoats", searchBoats);
  socket.on("updateBoat", updateBoat);
  socket.on("deleteBoat", deleteBoat);
}

/**
 * Creates a new boat and associates it with a regatta
 * @param {Object} boatData - The boat data from the frontend
 * @param {Function} callback - Callback function to send back the response
 */
async function addBoats(boat, callback) {
  const response = {};

  try {
    if (!boat.regattaId) {
      throw new Error("Boat must have a regattaId.");
    }

    const doc = await new Boat(boat).save();

    response.data = { boatId: doc._id, boatName: doc.name };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}

/**
 * Fetch all boats associated with a specific regatta
 * @param {String} regattaId - The regatta ID to fetch boats for
 * @param {Function} callback - Callback function to send back the response
 */
async function getBoats(regattaId, callback) {
  const response = {};

  try {
    const boats = await Boat.find({ regattaId }).exec();
    response.data = { boats };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}

/**
 * Searches the database for all boats whose name, id, or participants match
 * the query. The callback is called with an object with a data field that
 * holds the matching boats: { boats: Boat[] }
 * @param {string} query
 * @param {Function} callback
 */
async function searchBoats(query, callback) {
  const response = {};

  try {
    const regex = new RegExp(query, "i");

    const nameMatch = await Boat.find({ name: regex }).exec();
    const idMatch = await Boat.find({ registrationId: regex }).exec();
    const participantMatch = await Boat.find({
      participantNames: regex,
    }).exec();

    const matches = [...nameMatch, ...idMatch, ...participantMatch];
    const boats = [];
    const addedIds = [];

    matches.forEach((boat) => {
      const id = boat._id.toString();
      const isNew = !addedIds.includes(id);
      if (isNew) {
        boats.push(boat);
        addedIds.push(id);
      }
    });

    response.data = { boats };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}

async function getBoatsById(registrationId, callback) {
  const response = {};
  try {
    const boat = await Boat.find({ registrationId: registrationId }).exec();
    const participants = boat.participantNames;
    response.data = {
      boats: { boat, participants },
    };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}

/**
 * Updates a boat's data in the database
 * @param {Object} updateData - The data for the boat update
 * @param {Function} callback - Callback function to send back the response
 */
async function updateBoat(updateData, callback) {
  const response = {};

  try {
    const { boatId, registrationId, name, participantNames, finishTime, dns } =
      updateData;
    if (!boatId) {
      throw new Error("Boat ID is required to update a boat.");
    }

    const boat = await Boat.findById(boatId);

    if (!boat) {
      throw new Error("Boat not found.");
    }

    if (registrationId !== undefined) boat.registrationId = registrationId;
    if (name !== undefined) boat.name = name;
    if (participantNames !== undefined)
      boat.participantNames = participantNames;
    if (finishTime !== undefined) boat.finishTime = finishTime;
    if (dns !== undefined) boat.dns = dns;

    await boat.save();

    response.data = boat;
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}

/**
 * Fetch a boats by ID. The callback is called with an object with a data field
 * that holds the race: { boat: Boat }
 * @param {string} boatId
 * @param {Function} callback
 */
async function getBoatById(boatId, callback) {
  const response = {};

  try {
    const boat = await Boat.findById(boatId).exec();
    response.data = { boat };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}

/**
 * Delete a boat by id.
 * @param {string} boatId
 * @param {Function} callback
 */
async function deleteBoat(boatId, callback) {
  const response = {};

  try {
    if (!boatId) {
      throw new Error("Boat ID is required to delete a boat.");
    }

    const boat = await Boat.findById(boatId);
    if (!boat) {
      throw new Error("Boat not found.");
    }

    const raceId = boat.raceId;

    if (raceId) {
      await Race.updateOne({ _id: raceId }, { $pull: { boatIds: boatId } });
    }

    await Boat.findByIdAndDelete(boatId);

    response.data = { message: "Boat deleted successfully" };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}
