import { useState } from "react";
import { Button } from "@mui/material";
import RegisterModal from "./registerModal";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const { user, logout } = useUser();

  return (
    <nav>
      {user ? (
        <>
          <span>Hello, {user.name}</span>
          <Button onClick={logout}>Logout</Button>
        </>
      ) : (
        <Button onClick={() => setOpenRegister(true)}>Register</Button>
      )}

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
      />
    </nav>
  );
};

export default Navbar;
