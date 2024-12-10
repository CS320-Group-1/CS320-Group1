import { Race, Regatta, Boat } from "../models/subscribers.js";

export function RaceHandler(io, socket) {
  socket.on("createRace", createRace);
  socket.on("updateRace", updateRace);
  socket.on("deleteRace", deleteRace);
  socket.on("searchRaces", searchRaces);
  socket.on("getRaceById", getRaceById);
}

async function createRace(race, callback) {
  const response = {};

  try {
    const doc = await new Race(race).save();
    const raceId = doc._id;
    
    await Boat.updateMany(
      { _id: { $in: race.boatIds } },
      { $set: { raceId } }
    );

    response.data = { raceId: doc._id };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}

const updateRace = async (updateData) => {
  const { raceId, name, boatIds } = updateData;

  if (!raceId) {
    return { error: "Race ID is required" };
  }

  try {
    let race = await Race.findById(raceId);
    if (!race) {
      return { error: "Race not found" };
    }

    if (name) {
      race.name = name;
    }
    if (boatIds) {
      race.boats = boatIds;
    }

    const updatedRace = await race.save();
    return { data: updatedRace };
  } catch (error) {
    console.error("Error updating race:", error);
    return { error: "An error occurred while updating the race" };
  }
};

async function deleteRace(raceIdData, callback) {
  const response = {};

  try {
    if (!raceIdData) {
      throw new Error("Race ID is required to delete a race.");
    }

    await Boat.updateMany({ "raceId" : raceIdData }, {$unset: {raceId:1} });

    const race = await Race.findByIdAndDelete(raceIdData);

    if (!race) {
      throw new Error("Race not found.");
    }

    response.data = { message: "Race deleted successfully" };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}

/**
 * Searches the database for all races that match the query. The callback is
 * called with an object with a data field that holds the matching races:
 * { races: Race[] }
 * @param {string} query
 * @param {Function} callback
 */
async function searchRaces(query, callback) {
  const response = {};

  try {
    const races = await Race.find({
      name: new RegExp(query, "i"),
    }).exec();

    response.data = { races };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}


async function getRaceById(raceId, callback) {
  const response = {};
  try {
    const race = await Race.findById(raceId).exec();
    const boats = await Boat.find({ raceId }).exec();

    if (!race) {
      throw new Error("Race not found");
    }

    console.log("Boats fetched for race", boats);
    response.data = { race, boats };
  } catch (error) {
    response.error = error.message;
  }

  callback(response);
}