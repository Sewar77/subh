import {
  createWorkshop,
  getAllWorkshops,
  getAvailableWorkshops,
  getWorkshopById,
} from "../models/workshop.Model.js";

export const createWorkshopController = async (req, res) => {
  try {
    const data = req.body;
    const requiredFields = [
      "name_en",
      "start_time",
      "workshop_date",
      "trainer_name_en",
      "description_en",
      "duration_h",
      "image",
      "seats_number",  
    ];

    for (const field of requiredFields) {
      if (data[field] == null || data[field] === "") {
        return res.status(400).json({
          message: `${field} is required`,
        });
      }
    }
    if (data.is_online) {
      if (!data.meeting_link) {
        return res.status(400).json({
          message: "Meeting link is required for online workshops",
        });
      }
      data.location_googlemap_link = null;
    } else {
      if (!data.location_googlemap_link) {
        return res.status(400).json({
          message:
            "Location Google Maps link is required for offline workshops",
        });
      }
      data.meeting_link = null;
    }
    if (data.is_free) {
      data.price = null;
      data.is_user_paid = false;
    } else {
      if (data.price == null || data.price <= 0) {
        return res.status(400).json({
          message: "Valid price is required for paid workshops",
        });
      }
    }
    if (data.is_all_ages) {
      data.min_age = null;
      data.max_age = null;
    } else {
      if (
        data.min_age == null ||
        data.max_age == null ||
        data.min_age < 0 ||
        data.min_age > data.max_age
      ) {
        return res.status(400).json({
          message: "Invalid age range",
        });
      }
    }
    data.gender = data.gender || "both";
    data.status = data.status || "available";
    data.is_user_paid = data.is_user_paid || false;
    data.is_free = data.is_free || false;

    const workshop = await createWorkshop(data);
    return res.status(201).json({
      message: "Workshop created successfully",
      workshop,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getAllWorkshopsController = async (req, res) => {
  try {
    const workshops = await getAllWorkshops();

    return res.status(200).json({
      workshops,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAvailabilWorkshopsController = async (req, res) => {
  try {
    const workshops = await getAvailableWorkshops();

    return res.status(200).json({
      workshops,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getWorkshopByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const workshop = await getWorkshopById(id);

    if (!workshop) {
      return res.status(404).json({
        message: "Workshop not found",
      });
    }

    return res.status(200).json({
      workshop,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
