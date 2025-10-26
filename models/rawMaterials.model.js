import mongoose from "mongoose";

const RawMaterialSchema = new mongoose.Schema({
  itemid: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  orgid: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  rcatid: { type: mongoose.Schema.Types.ObjectId, ref: "rawcategory", required: true },

  minimumstock: { type: Number, required: true },
  minimumstockinMilli: { type: Number },
  minsunit: {
    type: String, enum: [
      "l", "ml", "kg", "g", "mg", "pcs", "no", "pkt", "box",
      "dozen", "bottle", "jar", "can", "roll", "tub", "sachet",
      "bag", "m", "cm", "mm", "tray", "tank", "bundle", "carton"
    ], required: true
  },

  maximumstock: { type: Number, required: true },
  maximumstockinMilli: { type: Number },
  maxunit: {
    type: String, enum: [
      "l", "ml", "kg", "g", "mg", "pcs", "no", "pkt", "box",
      "dozen", "bottle", "jar", "can", "roll", "tub", "sachet",
      "bag", "m", "cm", "mm", "tray", "tank", "bundle", "carton"
    ], required: true
  },

  state: { type: String, required: true },
  sgst: { type: Number, required: true },
  cgst: { type: Number, required: true },

  createdby: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdon: { type: Date, default: Date.now },
  timezone: { type: String, required: true },

  description: { type: String, default: "" },
  hsnCode: { type: String, default: "" },

  isExpiry: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },

  nLoss: { type: Number, default: 0 },
  purchaseUnit: { type: [String], required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategories", required: true }
});
const RawMaterial = mongoose.model('RawMaterial', RawMaterialSchema);
export default RawMaterial
