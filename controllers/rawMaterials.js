// const { poolPromise } = require("../config/db");
// const { default: Item } = require("../models/items.model");
import Categories from "../models/categories.model.js";
import Item from "../models/items.model.js";
import Material from "../models/materials.model.js";
import RawCat from "../models/rawCategory.model.js";
import RawMaterial from "../models/rawMaterials.model.js";
import rawMaterialsModel from "../models/rawMaterials.model.js";
import Subcategories from "../models/subcategories.model.js";
import mongoose from "mongoose";


const normalizeStock = (value, unit) => {
    if (typeof value !== 'number') return null;

    switch (unit) {
        case 'kg':
            return value * 1000000;
        case 'g':
            return value * 1000;
        case 'mg':
            return value;
        case 'l':
            return value * 1000;
        case 'ml':
            return value;
        default:
            return value;
    }
};


const newItems = async (req, res) => {
    try {
        let { orgid, item, unit, minimumstock, maximumstock, createdBy } = req.body;

        if (!orgid || !item || !createdBy) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        if (Number(maximumstock) < Number(minimumstock)) {
            return res.status(400).json({ message: "Maximum stock should be more than minimum stock" });
        }

        let minimumstockinmilli;
        let maximumstockinmilli;

        if (unit && typeof unit === "string") {
            unit = unit.toLowerCase();

            // Normalize values
            if (unit === "kg" || unit === "g" || unit === "mg" || unit === "l" || unit === "ml") {
                minimumstockinmilli = normalizeStock(Number(minimumstock), unit);
                maximumstockinmilli = normalizeStock(Number(maximumstock), unit);
            }

            // Optional: Standardize unit name
            // if (unit === "kg" || unit === "g" || unit === "mg") {
            //     unit = "mg";
            // } else if (unit === "l" || unit === "ml") {
            //     unit = "ml";
            // } else {
            //     return res.status(400).json({ message: "Invalid unit type" });
            // }
        }

        // Check if the item already exists in the same org
        const existingItem = await Item.findOne({ orgid, item: item.toLowerCase() });
        if (existingItem) {
            return res.status(400).json({ message: "Item already exists" });
        }

        const newItem = new Item({
            orgid: orgid,
            items: item.toLowerCase(),
            consumUnit: unit,
            minStock: minimumstock,
            maxStock: maximumstock,
            minStockinMilliorExact: minimumstockinmilli || minimumstock,
            maxStockinMilliOrExact: maximumstockinmilli || maximumstock,
            createdby: createdBy,
        });

        await newItem.save();

        return res.status(200).json({ message: `${newItem.items} added successfully`, data: newItem });

    } catch (error) {
        return res.status(400).json({
            message: error.message || "Something went wrong",
        });
    }
};



const getItems = async (req, res) => {
    try {
        const { orgid } = req.params;
        if (!orgid) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        // const pool = await poolPromise
        // const query = `select * from items where orgid = $1`
        // const values = [orgid]
        // const result = await pool.query(query, values)

        const getItemsOfOrg = await Item.find({
            orgid: orgid
        })

        if (getItemsOfOrg.length === 0) {
            return res.status(404).json("No Data found")
        }



        return res.status(200).json({ message: 'Success', data: getItemsOfOrg })
    } catch (error) {
        return res.status(400).json({ message: 'Error in getItems' })
    }
}



const newRawCategories = async (req, res) => {
    try {
        const { orgid, rcat, createdBy } = req.body;
        if (!orgid || !rcat || !createdBy) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const addnewRawCategories = new RawCat({
            orgid: orgid,
            category: rcat,
            createdBy: createdBy
        })

        await addnewRawCategories.save()



        return res.status(200).json({ message: `Category added successfully` });
    } catch (error) {
        if (error) {
            return res.status(400).json({
                message: error.message || "Something went wrong",
                detail: error.detail || null,
            });
        }
        return res.status(400).json({ message: 'Error in newRawCategories' })
    }
}

const getCategories = async (req, res) => {
    try {
        const { orgid } = req.params;
        if (!orgid) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        // const pool = await poolPromise
        // const query = `select * from rawcategory where orgid = $1`
        // const values = [orgid]
        // const result = await pool.query(query, values)

        const getCategoriesOfOrg = await RawCat.find({
            orgid: orgid
        })

        if (getCategoriesOfOrg.length === 0) {
            return res.status(404).json({
                message: "No data found"
            })
        }


        return res.status(200).json({
            message: 'Success',
            data: getCategoriesOfOrg

        })



        // return res.status(200).json({ message: 'Success', data: result.rows })
    } catch (error) {
        return res.status(400).json({ message: 'Error in getItems' })
    }
}

const newRawMaterials = async (req, res) => {
    try {
        const rawArr = req.body;
        const failedMaterials = [];

        await Promise.all(
            rawArr.map(async (raw) => {
                try {
                    let {
                        itemid,
                        orgid,
                        rcatid,
                        minimumstock,
                        minsunit,
                        maximumstock,
                        maxunit,
                        state,
                        sgst,
                        cgst,
                        createdby,
                        createdon,
                        timezone,
                        description,
                        hsnCode,
                        isExpiry,
                        isPrivate,
                        nLoss,
                        purchaseUnit,
                        subCategory,
                        consunit
                    } = raw;


                    console.log(orgid, "orgid")

                    // ✅ Required field check
                    const requiredFields = {
                        itemid,
                        orgid,
                        rcatid,
                        minimumstock,
                        minsunit,
                        maximumstock,
                        maxunit,
                        state,
                        sgst,
                        cgst,
                        createdby,
                        createdon,
                        timezone,
                        isExpiry,
                        isPrivate,
                        purchaseUnit,
                        subCategory,
                        // consunit
                    };

                    const missingFields = Object.entries(requiredFields)
                        .filter(([_, value]) => value === undefined || value === null || value === "")
                        .map(([key]) => key);

                    if (missingFields.length > 0) {
                        console.warn("Skipped raw material (missing fields):", missingFields);
                        failedMaterials.push({ raw, missingFields });
                        return;
                    }

                    const exists = await rawMaterialsModel.findOne({
                        itemid,
                        orgid,
                        rcatid,
                        minsunit: minsunit
                    }).lean();

                    if (exists) {
                        console.warn(`Duplicate skipped: itemid=${itemid}, orgid=${orgid}, rcatid=${rcatid}`);
                        failedMaterials.push({ raw, error: "Duplicate raw material" });
                        return;
                    }
                    let minSinMilli;
                    let maxSinMilli;

                    // ✅ Normalize minimumstock to mg/ml
                    if (minsunit && typeof minsunit === "string") {
                        const unit = minsunit.toLowerCase();
                        if (unit === "kg") {
                            minSinMilli = minimumstock *= 1000000;
                            // minsunit = "mg";
                        } else if (unit === "g") {
                            minSinMilli = minimumstock *= 1000;
                            // minsunit = "mg";
                        } else if (unit === "l") {
                            minSinMilli = minimumstock *= 1000;
                            // minsunit = "ml";
                        }
                    }

                    // ✅ Normalize maximumstock to mg/ml
                    if (maxunit && typeof maxunit === "string") {
                        const unit = maxunit.toLowerCase();
                        if (unit === "kg") {
                            maxSinMilli = maximumstock *= 1000000;
                            // maxunit = "mg";
                        } else if (unit === "g") {
                            maxSinMilli = maximumstock *= 1000;
                            // maxunit = "mg";
                        } else if (unit === "l") {
                            maxSinMilli = maximumstock *= 1000;
                            // maxunit = "ml";
                        }
                    }

                    // ✅ Save raw material
                    const rawMaterial = new rawMaterialsModel({
                        itemid,
                        orgid,
                        rcatid,
                        minimumstock,
                        maximumstock,
                        minsunit,
                        minimumstockinMilli: minSinMilli,
                        maxunit,
                        maximumstockinMilli: maxSinMilli,
                        state,
                        sgst,
                        cgst,
                        createdby,
                        createdon: new Date(createdon).toISOString(),
                        timezone,
                        description: description || "",
                        hsnCode: hsnCode || "",
                        isExpiry,
                        isPrivate,
                        nLoss: nLoss || 0,
                        purchaseUnit,
                        subCategory,
                    });

                    await rawMaterial.save();
                } catch (err) {
                    console.error("Error saving raw material:", err.message);
                    failedMaterials.push({ raw, error: err.message });
                }
            })
        );

        return res.status(200).json({
            message: "Raw materials saved successfully",
            failedMaterials,
        });
    } catch (error) {
        console.error("Error inserting raw materials:", error);
        return res.status(400).json({ message: "Error in newRawMaterials", error: error.message });
    }
};




const addSubCategories = async (req, res) => {
    try {
        const { orgid, rcatid, rsubcat, createdBy } = req.body;

        // Validation
        if (!orgid || !rcatid || !rsubcat || !createdBy) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        // Check if subcategory already exists (optional but good to avoid duplicates)
        const existing = await Subcategories.findOne({
            orgid: orgid,
            catId: rcatid,
            subcatname: rsubcat
        });
        if (existing) {
            return res.status(400).json({ message: "Subcategory already exists" });
        }

        // Create new subcategory
        const newSubCategory = new Subcategories({
            orgid: orgid,
            catId: rcatid,
            subcatname: rsubcat,
            createdBy: createdBy,
            // createdAt: new Date()
        });

        await newSubCategory.save();

        return res.status(200).json({
            message: `${rsubcat} added successfully`,
            data: newSubCategory
        });

    } catch (error) {
        console.error("DB Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const getSubcategories = async (req, res) => {
    try {
        const { orgid, rcatid } = req.params;

        if (!orgid || !rcatid) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        console.log(orgid, rcatid);

        // Find all subcategories for given orgid + rcatid
        const subcategories = await Subcategories.find({ orgid, catId: rcatid });

        return res.status(200).json({
            message: "Success",
            data: subcategories
        });

    } catch (error) {
        console.error("Error in getSubcategories:", error);
        return res.status(500).json({ message: "Error in getSubcategories" });
    }
};

const getItemById = async (req, res) => {
    try {
        const { itemid, orgid } = req.params;

        if (!orgid || !itemid) {
            return res.status(400).json({ message: "Please give the required details" });
        }

        // Fetch item from MongoDB (assuming orgid and itemid are stored in collection)
        const item = await Item.findOne({ orgid: orgid, _id: itemid });

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        const min = parseFloat(item.minStockinMilliorExact);
        const max = parseFloat(item.maxStockinMilliOrExact);
        let minexact = min;
        let maxexact = max;

        switch (item.consumUnit) {
            case "kg":
                minexact = min / 1000000;
                maxexact = max / 1000000;
                break;
            case "g":
                minexact = min / 1000;
                maxexact = max / 1000;
                break;
            case "l":
                minexact = min / 1000;
                maxexact = max / 1000;
                break;
            case "ml":
            case "mg":
                // No conversion
                break;
            default:
                // pcs, pkt, no, etc.
                break;
        }

        return res.status(200).json({
            message: "Success",
            data: {
                ...item.toObject(),
                minexact,
                maxexact,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error in getItemById" });
    }
};


const itemsData = async (req, res) => {
    try {
        const { orgid, itemid } = req.body

    } catch (error) {
        return res.status(500).json({ message: 'Error in itemsData' });

    }
}

const getMaterials = async (req, res) => {
    try {
        const { orgid } = req.params;

        if (!orgid) {
            return res.status(400).json({ message: "Please provide orgid." });
        }

        console.log("Received orgid:", orgid);

        // Query MongoDB collection
        const materials = await RawMaterial.find({ orgid })
            .populate("rcatid subCategory orgid itemid");

        // Process each material
        const materialHistory = await Promise.all(
            materials.map(async (mat) => {
                // Aggregate to calculate total material available
                const totalMaterial = await Material.aggregate([
                    { $match: { rawmaterial: mat._id } },
                    {
                        $group: {
                            _id: null,
                            totalQty: {
                                $sum: {
                                    $multiply: [
                                        "$quantityAsConsumption",
                                        { $toDouble: "$quantity" }   // safely cast string to number
                                    ]
                                }
                            }
                        }
                    }
                ]);


                const totalMaterialAvailable = totalMaterial.length > 0 ? totalMaterial[0].totalQty : 0;

                // Check if history exists
                const historyExists = await Material.exists({ rawmaterial: mat._id });

                return {
                    ...mat.toObject(),   // convert mongoose doc to plain object
                    isHistory: historyExists ? 1 : 0,
                    totalMaterialAvailable
                };
            })
        );

        console.log("Materials result:", materialHistory);

        return res.status(200).json(materialHistory);
    } catch (error) {
        console.error("Error in getMaterials:", error);
        return res.status(500).json({ message: "Error in getMaterials", error: error.message });
    }
};



// ✅ Unit conversion helper
const convertUnits = (value, fromUnit, toUnit) => {
    if (!value || !fromUnit || !toUnit) return null;

    fromUnit = fromUnit.toLowerCase();
    toUnit = toUnit.toLowerCase();

    // ✅ First convert from "fromUnit" → base unit
    let baseValue;
    let baseUnit;

    // Liquids → base ml
    if (["l", "ml"].includes(fromUnit)) {
        if (fromUnit === "l") baseValue = value * 1000;
        else baseValue = value;
        baseUnit = "ml";
    }

    // Solids → base g
    else if (["kg", "g", "mg"].includes(fromUnit)) {
        if (fromUnit === "kg") baseValue = value * 1000;
        else if (fromUnit === "mg") baseValue = value / 1000;
        else baseValue = value;
        baseUnit = "g";
    }

    // Unknown → return same
    else {
        return value;
    }

    // ✅ Convert base unit → target unit
    if (baseUnit === "ml") {
        if (toUnit === "l") return baseValue / 1000;
        if (toUnit === "ml") return baseValue;
    }

    if (baseUnit === "g") {
        if (toUnit === "kg") return baseValue / 1000;
        if (toUnit === "mg") return baseValue * 1000;
        if (toUnit === "g") return baseValue;
    }

    return value; // fallback
};



const addMaterials = async (req, res) => {
    try {
        let {
            rawmatid,
            date,
            invoice,
            merchant,
            quantity,
            unit,
            total,
            sgst,
            cgst,
            consumptionUnit,
            maxStock,
            minStock,
            quantityAsConsumption,
            item,
            category,
            subcategory,
            orgid,
            createdBy
        } = req.body;

        // ✅ Basic validation
        if (!item || !category || !subcategory || !date || !merchant || !quantity || !unit || !total || !consumptionUnit) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // ✅ Correct unit price calculation
        const unitPrice = quantity > 0 ? (total / quantity) : 0;

        // ✅ Convert quantity → consumption unit
        if (!quantityAsConsumption) {
            quantityAsConsumption = convertUnits(quantity, unit, consumptionUnit);

        }

        // ✅ Stock status logic
        let stock = "NA"; // default
        if (maxStock && minStock && quantityAsConsumption !== null) {
            if (quantityAsConsumption > maxStock) stock = "IS"; // Over Stock
            else if (quantityAsConsumption < minStock) stock = "OS"; // Under Stock
            else stock = "IS"; // In Stock
        }

        let inConsumUnit = quantity * quantityAsConsumption
        let pricePerConsumptionUnit = quantityAsConsumption && quantity > 0
            ? total / inConsumUnit
            : 0;

        // ✅ Create new material entry
        const newMaterial = new Material({
            rawmaterial: rawmatid,
            item,
            category,
            subcategory,
            date,
            invoiceNumber: invoice,
            merchant,
            quantity,
            unit,
            unitPrice,
            totalAmount: total,
            sgst,
            cgst,
            quantityAsConsumption,
            consumptionUnit,
            pricePerConsumptionUnit,
            remainingQuantity: inConsumUnit,
            stock,
            createdBy,
            orgid,
            inConsumUnit

        });

        const savedMaterial = await newMaterial.save();

        return res.status(201).json({
            message: "Success, data saved",
            data: savedMaterial
        });

    } catch (error) {
        console.error("Error in addMaterials:", error);
        return res.status(500).json({
            message: "Error in addMaterials",
            error: error.message
        });
    }

};

const getaddedMaterials = async (req, res) => {
    try {
        const { item, category, subcategory, orgid } = req.body;

        // ✅ Validate required fields
        if (!item || !category || !subcategory || !orgid) {
            return res.status(400).json({
                success: false,
                message: "All fields (item, category, subcategory, orgid) are required",
            });
        }

        // ✅ Build query dynamically (more flexible in future)
        const query = { item, category, subcategory, orgid };

        // ✅ Fetch materials
        const materials = await Material.find(query).lean().populate('merchant');

        // ✅ Handle case: no materials found
        if (!materials || materials.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No materials found with the given criteria",
            });
        }

        return res.status(200).json({
            success: true,
            count: materials.length,
            message: "Materials fetched successfully",
            data: materials,
        });

    } catch (error) {
        console.error("Error in getaddedMaterials:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching materials",
            error: error.message,
        });
    }
};


const deleteInventoryRawMaterials = async (req, res) => {
    try {
        const { rawmaterialid } = req.body;

        // 1. Validate input
        if (!rawmaterialid || !mongoose.Types.ObjectId.isValid(rawmaterialid)) {
            return res.status(400).json({
                message: "Invalid or missing rawmaterialid",
            });
        }

        // 2. Check if raw material exists
        const rawMaterial = await RawMaterial.findById(rawmaterialid);
        if (!rawMaterial) {
            return res.status(404).json({
                message: "Raw material not found",
            });
        }

        // 3. Delete raw material
        await RawMaterial.deleteOne({ _id: rawmaterialid });

        // 4. Delete dependent materials
        const deletedMaterials = await Material.deleteMany({ rawmaterial: rawmaterialid });

        // 5. Send success response
        return res.status(200).json({
            message: "Raw material and related materials deleted successfully",
            deletedRawMaterialId: rawmaterialid,
            deletedMaterialsCount: deletedMaterials.deletedCount,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error in deleteInventoryRawMaterials",
            error: error.message,
        });
    }
};


const deleteMaterialsByid = async (req, res) => {
    try {
        const { materialId } = req.body

        if (!materialId || !mongoose.Types.ObjectId.isValid(materialId)) {
            return res.status(400).json({
                message: "Invalid or missing materialId",
            });
        }


        const existingMaterial = await Material.findById(materialId);
        if (!existingMaterial) {
            return res.status(404).json({
                message: "Raw material not found",
            });
        }

        await Material.deleteOne({ _id: materialId });
        return res.status(200).json({
            message: "Raw material and related materials deleted successfully"
        });


    } catch (error) {
        return res.status(500).json({
            message: "Error in deleteMaterialsByid",
            error: error.message,
        });
    }
}

const updateRawMaterials = async (req, res) => {
    try {
        const {
            rawmat_id,
            itemid,
            minstock,
            maxstock,
            consunit,
            sgst,
            cgst,
            state,
            isprivate,
            natloss,
            purunits
        } = req.body;

        // Check if item exists
        const existingItem = await Item.findById(itemid).lean();
        if (!existingItem) {
            return res.status(400).json({ message: "No item exist" });
        }

        // Check if raw material exists
        const existingRawMaterial = await rawMaterialsModel.findById(rawmat_id).lean();
        if (!existingRawMaterial) {
            return res.status(400).json({ message: "No raw material exist" });
        }

        let minimumstockinmilli = existingItem.minStockinMilliorExact || null;
        let maximumstockinmilli = existingItem.maxStockinMilliOrExact || null;
        const normalizedUnit = consunit.toLowerCase();

        // Handle stock normalization
        if ((minstock || maxstock) && consunit) {
            console.log(normalizedUnit, "NL")
            if (["kg", "g", "mg", "l", "ml"].includes(normalizedUnit)) {
                if (minstock) minimumstockinmilli = normalizeStock(Number(minstock), normalizedUnit);
                if (maxstock) maximumstockinmilli = normalizeStock(Number(maxstock), normalizedUnit);
            }

            // Update Item document
            await Item.updateOne(
                { _id: itemid },
                {
                    $set: {
                        minStock: minstock,
                        maxStock: maxstock,
                        consumUnit: normalizedUnit,
                        minStockinMilliorExact: minimumstockinmilli,
                        maxStockinMilliOrExact: maximumstockinmilli,
                    },
                },
                { new: true }
            );
        }

        // Update RawMaterial document
        await rawMaterialsModel.updateOne(
            { _id: rawmat_id },
            {
                $set: {
                    sgst,
                    cgst,
                    state,
                    isPrivate: isprivate,
                    nLoss: natloss,
                    purchaseUnit: purunits,
                    minsunit: normalizedUnit,
                    maxunit: normalizedUnit
                },
            },
            { new: true }
        );

        return res.status(200).json({ message: "Raw material updated successfully" });

    } catch (error) {
        return res.status(500).json({
            message: "Error in updateRawMaterials",
            error: error.message,
        });
    }
};

const deductmaterials = async (req, res) => {
    try {
        const { rawmaterialId, requiredQuantity } = req.body
        if (!rawmaterialId || !requiredQuantity) {
            return res.status(400).json({ message: "Material name and quantity required" });
        }

        const stockItems = await Material.find({
            // item: itemid,
            rawmaterial: rawmaterialId
        }).sort({ date: 1 })

        let remainingQty = requiredQuantity;

        for (let item of stockItems) {
            if (remainingQty <= 0) break;

            if (item.remainingQuantity >= remainingQty) {
                item.remainingQuantity -= remainingQty;
                remainingQty = 0
            } else {
                remainingQty -= item.remainingQuantity;
                item.remainingQuantity = 0;
            }
            await item.save()
        }


        if (remainingQty > 0) {
            return res.status(400).json({ message: "Insufficient stock to fulfill order" });
        }

        return res.status(200).json({ message: "Materials deducted successfully" });

    } catch (error) {
        console.error("Error in addMaterials:", error);
        return res.status(500).json({
            message: "Error in addMaterials",
            error: error.message
        });
    }
}


const served = async (req, res) => {
    try {
        const { servingsArr } = req.body;
        //[{rawmaterial, item, category, subcategory, unitstoreduce}]

        if (!servingsArr || servingsArr.length === 0) {
            return res.status(200).json({ message: "Please provide some data" });
        }

        for (const serving of servingsArr) {
            let { rawmaterial, orgid, unitstoreduce } = serving;

            // Fetch all matching materials with remainingQuantity > 0, sorted by date
            const materials = await Material.find({
                rawmaterial,
                orgid,
                // item,
                // category,
                // subcategory,
                remainingQuantity: { $gt: 0 }
            }).sort({ date: 1 }).lean(); // lean() for faster read, returns plain JS objects

            if (!materials.length) {
                console.log(`Material ${rawmaterial} not found or out of stock. Skipping.`);
                continue;
            }

            let bulkOps = [];
            for (const material of materials) {
                if (unitstoreduce <= 0) break;

                const reducible = Math.min(material.remainingQuantity, unitstoreduce);
                unitstoreduce -= reducible;

                bulkOps.push({
                    updateOne: {
                        filter: { _id: material._id },
                        update: { $inc: { remainingQuantity: -reducible } }
                    }
                });
            }

            if (bulkOps.length > 0) {
                await Material.bulkWrite(bulkOps);
            }

            if (unitstoreduce > 0) {
                console.log(`Warning: Not enough ${rawmaterial} to reduce ${serving.unitstoreduce}. Remaining: ${unitstoreduce}`);
            }
        }

        return res.status(200).json({ message: "Materials updated successfully" });

    } catch (error) {
        console.error("Error in addMaterials:", error);
        return res.status(500).json({
            message: "Error in addMaterials",
            error: error.message
        });
    }
};




// const addMaterialItems = async (req, res) => {
//     try {
//         const {
//             rawid,
//             orgid,
//             itemid,
//             merchantid,
//             qtyPurchased,
//             purchasedUnit,
//             quantityasConUnit,
//             purchasedate,
//             createdBy,
//             timezone
//         } = req.body;

//         const pool = await poolPromise;

//         const query = `
//             SELECT addmaterial($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//         `;

//         const values = [
//             rawid,
//             orgid,
//             itemid,
//             merchantid,
//             qtyPurchased,
//             purchasedUnit,
//             quantityasConUnit,
//             purchasedate,
//             createdBy,
//             timezone
//         ];

//         await pool.query(query, values);

//         return res.status(200).json({ message: 'Material item added successfully' });

//     } catch (error) {
//         console.error('Error in addMaterialItems:', error);
//         return res.status(500).json({ message: 'Error in addMaterialItems' });
//     }
// };



// module.exports = { addMaterialItems, getMaterials, addSubCategories, newItems, newRawCategories, newRawMaterials, getItems, getCategories, getSubcategories, getItemById, itemsData }

export default { served, deductmaterials, updateRawMaterials, deleteMaterialsByid, deleteInventoryRawMaterials, getaddedMaterials, addMaterials, newItems, getItems, getCategories, newRawCategories, getItemById, addSubCategories, getSubcategories, newRawMaterials, getMaterials }