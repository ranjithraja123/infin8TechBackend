import RawMaterial from "../models/rawMaterials.model.js";
import Recepie from "../models/recepie.model.js";
import path from 'path';

const addFood = async (req, res) => {
  try {
    const { itemName, description, servings, cuisine, difficulty, price } = req.body;
    const { orgid } = req.params;

    // validate required fields
    if (!orgid || !itemName || !description || !servings || !cuisine || !difficulty) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }

    // check duplicate recipe
    const existing = await Recepie.findOne({
      title: { $regex: new RegExp(`^${itemName}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({
        message: "Recipe already exist"
      });
    }

    // ✅ Save relative paths instead of absolute
    const sourcefilepaths = Array.isArray(req.files)
      ? req.files.map(fil => {
        const relativePath = path.relative(
          path.join(process.cwd(), 'uploads'),
          fil.path
        );
        return {
          filepath: relativePath,  // e.g. "689d9314094d2fecaa8ef68a/food/food_17563xxx.webp"
          size: fil.size
        };
      })
      : [];

    console.log("Saved file(s):", sourcefilepaths);

    // create recipe
    const addFoodDetails = await Recepie.create({
      orgid,
      title: itemName,
      description,
      servings,
      cuisine,
      difficulty,
      image: sourcefilepaths[0] || null, // optional
      price: price
    });

    // send success response
    return res.status(200).json({
      message: "Recipe added successfully",
      data: addFoodDetails,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error in addFood",
      error: error.message,
    });
  }
};


const getOrgFoods = async (req, res) => {
  try {
    const { orgid } = req.params

    const getFoods = await Recepie.find({
      orgid: orgid
    }).lean()

    if (getFoods.length < 1) {
      return res.status(404).json({
        message: "No data found"
      })
    }

    return res.status(200).json({
      message: "Success",
      data: getFoods
    })

  } catch (error) {
    return res.status(500).json({
      message: "Error in getOrgFoods",
      error: error.message,
    });
  }
}

const getAvailableIngredients = async (req, res) => {
  try {
    const { orgid } = req.params
    const getIngredients = await RawMaterial.find({
      orgid: orgid
    }).populate('itemid')
    if (orgid.length < 1) {
      return res.status(404).json({
        message: "No data found"
      })
    }
    return res.status(200).json({
      message: "Success",
      getIngredients
    })

  } catch (error) {
    return res.status(500).json({
      message: "Error in getOrgFoods",
      error: error.message,
    });
  }
}

const updateAvailableIngredients = async (req, res) => {
  try {
    const { orgid } = req.params
    const { recid, ingredients } = req.body

    const existingRecipie = await Recepie.findOne({
      _id: recid,
      orgid: orgid
    })

    if (!existingRecipie) {
      return res.status(404).json({
        message: "No data found"
      })
    }

    let updated = await Recepie.findByIdAndUpdate(
      recid, {
      $set: {
        ingredients: ingredients
      }
    }, {
      new: true
    })

    if (updated.isModified === 0) {
      return res.status(404).json({
        message: "No data updated"
      })
    }

    return res.status(200).json({
      message: "Status updated"
    })

  } catch (error) {
    return res.status(500).json({
      message: "Error in updateAvailableIngredients",
      error: error.message,
    });
  }
}

const deleteFood = async (req, res) => {
  try {
    const { recid, status } = req.body;

    if (!recid) {
      return res.status(404).json({
        message: "No data found"
      });
    }
    let updateInactive
    if (status === "A") {
       updateInactive = await Recepie.findByIdAndUpdate(
        recid,
        { $set: { status: "A" } },
        { new: true } // return updated doc
      );
    } else {
      updateInactive = await Recepie.findByIdAndUpdate(
        recid,
        { $set: { status: "IA" } },
        { new: true } // return updated doc
      );
    }


    if (!updateInactive) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    return res.status(200).json({
      message: "Updated",
      data: updateInactive
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error in deleteFood",
      error: error.message,
    });
  }
};

const updateFood = async (req, res) => {
  try {
    console.log("here")

    const { recid } = req.params; // ✅ Get recipe ID from URL
    console.log(req.body, "here")

    const { itemName, description, servings, cuisine, difficulty, price } = req.body;

    console.log("here")
    // validate required fields
    if (!itemName || !description || !servings || !cuisine || !difficulty) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }

    // check duplicate recipe (excluding the one being updated)
    const existing = await Recepie.findOne({
      title: { $regex: new RegExp(`^${itemName}$`, "i") },
      _id: { $ne: recid },
    });

    if (existing) {
      return res.status(400).json({
        message: "Recipe already exists",
      });
    }

    // ✅ Save relative paths instead of absolute
    const sourcefilepaths = Array.isArray(req.files)
      ? req.files.map((fil) => {
        const relativePath = path.relative(
          path.join(process.cwd(), "uploads"),
          fil.path
        );
        return {
          filepath: relativePath,
          size: fil.size,
        };
      })
      : [];

    console.log("Saved file(s):", sourcefilepaths);

    // ✅ update recipe
    const updatedFood = await Recepie.findByIdAndUpdate(
      recid,
      {
        title: itemName,
        description,
        servings,
        cuisine,
        difficulty,
        image: sourcefilepaths[0] || undefined, // update only if new file uploaded
        price,
      },
      { new: true } // return updated doc
    );

    if (!updatedFood) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // send success response
    return res.status(200).json({
      message: "Recipe updated successfully",
      data: updatedFood,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in updateFood",
      error: error.message,
    });
  }
};


const getFoodById = async (req, res) => {
  try {
    const { recid } = req.params;

    if (!recid) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    const recipe = await Recepie.findById(recid);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    return res.status(200).json({
      message: "Recipe fetched successfully",
      data: recipe,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in getFoodById",
      error: error.message,
    });
  }
};




export default { addFood, getOrgFoods, updateFood, getAvailableIngredients, updateAvailableIngredients, deleteFood, getFoodById }
