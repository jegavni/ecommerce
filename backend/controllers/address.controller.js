import User from "../models/user.js";

/*GET ALL ADDRESSES*/

export const getAddresses = async (req, res) => {
    console.log("GET /api/users/:userId/addresses called");
  try {
    const user = await User.findById(req.params.userId).select("addresses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ADD ADDRESS */
 
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAddress = req.body;

    const duplicate = user.addresses.some((addr) =>
      addr.name === newAddress.name &&
      addr.phone === newAddress.phone &&
      addr.addressLine === newAddress.addressLine &&
      addr.city === newAddress.city &&
      addr.state === newAddress.state &&
      addr.pincode === newAddress.pincode
    );

    if (duplicate) {
      return res.status(409).json({
        message: "This address already exists",
      });
    }

    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE ADDRESS */

export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    Object.assign(address, req.body);

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = addr._id.equals(address._id);
      });
    }

    await user.save();

    res.json({
      message: "Address updated",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  //  SET DEFAULT ADDRESS

export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === req.params.addressId;
    });

    await user.save();

    res.json({
      message: "Default address updated",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
