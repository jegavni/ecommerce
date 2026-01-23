// AddressSelector.jsx
import React from "react";
import { Box, Card, CardContent, Typography, Radio, IconButton, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const AddressSelector = ({ addresses, selectedAddressId, onSelect, onAddNew, onEdit }) => {
  return (
    <Box>
      {addresses.map(address => (
        <Card
          key={address._id}
          variant="outlined"
          sx={{
            mb: 2,
            borderColor: address._id === selectedAddressId ? "primary.main" : "#ccc",
            borderWidth: address._id === selectedAddressId ? 2 : 1,
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() => onSelect(address)}
            >
              <Radio
                checked={address._id === selectedAddressId}
                onChange={() => onSelect(address)}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography fontWeight="bold">{address.name}</Typography>
                <Typography>{address.phone}</Typography>
                <Typography color="text.secondary">
                  {address.addressLine}, {address.city}, {address.state} - {address.zip}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => onEdit(address)}>
              <EditIcon />
            </IconButton>
          </CardContent>
        </Card>
      ))}

      <Button variant="outlined" onClick={onAddNew}>
        ➕ Add New Address
      </Button>
    </Box>
  );
};

export default AddressSelector;
