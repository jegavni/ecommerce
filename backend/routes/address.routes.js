import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";

const router = express.Router();

router.get("/:userId/addresses", getAddresses);
router.post("/:userId/addresses", addAddress);
router.put("/:userId/addresses/:addressId", updateAddress);
router.put("/:userId/addresses/:addressId/default", setDefaultAddress);

export default router;
