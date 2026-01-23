// components/AddAddressModal.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const initialState = {
  name: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const AddAddressModal = ({ open, onClose, onSave, initialData = null }) => {
  const [address, setAddress] = useState(initialState);

  // Pre-fill form on open or if initialData changes (for edit)
  useEffect(() => {
    if (open) {
      setAddress(initialData || initialState);
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress({
      ...address,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const isValid =
    address.name &&
    PHONE_REGEX.test(address.phone) &&
    address.addressLine &&
    address.city &&
    address.state &&
    PINCODE_REGEX.test(address.pincode);

  const handleSubmit = () => {
    if (!isValid) return;
    onSave(address); // Cart.jsx will decide if it's add or edit
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? "Edit Address" : "Add Delivery Address"}</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={address.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              error={address.phone && !PHONE_REGEX.test(address.phone)}
              helperText={
                address.phone && !PHONE_REGEX.test(address.phone)
                  ? "Enter valid 10-digit mobile number"
                  : ""
              }
              inputProps={{ maxLength: 10 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="addressLine"
              value={address.addressLine}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={address.city}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={address.state}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Pincode"
              name="pincode"
              value={address.pincode}
              onChange={handleChange}
              error={address.pincode && !PINCODE_REGEX.test(address.pincode)}
              helperText={
                address.pincode && !PINCODE_REGEX.test(address.pincode)
                  ? "Enter valid 6-digit pincode"
                  : ""
              }
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="isDefault"
                  checked={address.isDefault}
                  onChange={handleChange}
                />
              }
              label="Set as default address"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid}>
          {initialData ? "Save Changes" : "Add Address"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAddressModal;
