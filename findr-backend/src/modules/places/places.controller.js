const {
  getPlaceById,
  savePlace,
  getSavedPlaces,
  removeSavedPlace,
} = require("./places.service");

async function getPlace(req, res, next) {
  try {
    const place = await getPlaceById(req.params.id);
    res.status(200).json({ place });
  } catch (error) {
    next(error);
  }
}

async function save(req, res, next) {
  try {
    const { placeId, note } = req.body;

    if (!placeId) {
      return res.status(400).json({ error: "placeId is required" });
    }

    const saved = await savePlace(req.userId, placeId, note);
    res.status(201).json({ message: "Place saved successfully", saved });
  } catch (error) {
    next(error);
  }
}

async function getSaved(req, res, next) {
  try {
    const places = await getSavedPlaces(req.userId);
    res.status(200).json({ total: places.length, places });
  } catch (error) {
    next(error);
  }
}

async function removeSaved(req, res, next) {
  try {
    await removeSavedPlace(req.userId, req.params.placeId);
    res.status(200).json({ message: "Place removed from saved" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getPlace, save, getSaved, removeSaved };
