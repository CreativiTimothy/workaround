import * as React from "react";
import { Modal, Paper, Box, Typography, Divider, Button, Stack, TextField, ToggleButton, ToggleButtonGroup, Slider, FormGroup, FormControlLabel, Checkbox, Rating } from "@mui/material";

type LogInModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function LogInModal({ open, onClose }: LogInModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            
            <Paper
                elevation={6}
                sx={{
                    width: 560,
                    maxWidth: "75vw",
                    maxHeight: "75vh",
                    borderRadius: 1,
                    p: 3,
                }}
            >
                <Stack spacing={2}>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: "600" }}>Welcome Back</Typography>

                    <TextField
                        required
                        id="outlined-required"
                        label="Email Address"
                        placeholder="Enter your email address"
                        fullWidth
                    />

                    <TextField
                        required
                        id="outlined-required"
                        label="Password"
                        // Maybe add password invisibility if there's time
                        placeholder="Enter your password"
                        fullWidth
                    />

                    <Button variant="contained">LOG IN</Button>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "1rem", fontWeight: "100" }}>
                            Don't have an account?
                        </Typography>
                        <Button variant="text" sx={{ p: 0, minWidth: "auto", textTransform: "none", textDecoration: "underline", "&:hover": { textDecoration: "underline" }}}>Create an Account</Button>
                    </Box>
                </Stack>
            </Paper>
        </Modal>
    );
}