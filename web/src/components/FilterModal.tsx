import * as React from "react";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Slider from "@mui/material/Slider";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Rating from "@mui/material/Rating";

type FilterModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function FilterModal({ open, onClose }: FilterModalProps) {
  const [price, setPrice] = React.useState<string | null>("$$");
  const [spaceType, setSpaceType] = React.useState<string | null>("Cafe");

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: undefined }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      BackdropProps={{
        sx: { bgcolor: "rgba(0,0,0,0.45)" }, // dim background like screenshot
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: 560,
          maxWidth: "92vw",
          maxHeight: "85vh",
          overflowY: "auto",
          borderRadius: 1,
          p: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Filters
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          {/* Rating */}
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Rating</Typography>
            <Rating />
          </Box>

          {/* Price */}
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Price</Typography>
            <ToggleButtonGroup
              value={price}
              exclusive
              onChange={(_, v) => setPrice(v)}
              fullWidth
            >
              <ToggleButton value="$">$</ToggleButton>
              <ToggleButton value="$$">$$</ToggleButton>
              <ToggleButton value="$$$">$$$</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Type of Space */}
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Type of Space</Typography>
            <ToggleButtonGroup
              value={spaceType}
              exclusive
              onChange={(_, v) => setSpaceType(v)}
              fullWidth
            >
              <ToggleButton value="Cafe">Cafe</ToggleButton>
              <ToggleButton value="Library">Library</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Open at */}
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Open at…</Typography>
            <TextField
              placeholder="hh:mm aa"
              size="small"
              fullWidth
            />
          </Box>

          {/* Sliders */}
          <Box>
            <Typography sx={{ fontWeight: 700 }}>Noise Level</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2">Quiet</Typography>
              <Slider defaultValue={20} />
              <Typography variant="body2">Loud</Typography>
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700 }}>Lighting</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2">Dim</Typography>
              <Slider defaultValue={30} />
              <Typography variant="body2">Bright</Typography>
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700 }}>Seating Availability</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2">Empty</Typography>
              <Slider defaultValue={25} />
              <Typography variant="body2">Crowded</Typography>
            </Box>
          </Box>

          {/* Features */}
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Features</Typography>
            <Box sx={{ display: "flex", gap: 4 }}>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="Free Wi-Fi" />
                <FormControlLabel control={<Checkbox />} label="Paid Wi-Fi" />
                <FormControlLabel control={<Checkbox />} label="Electrical Outlets Available" />
              </FormGroup>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="Garage Parking" />
                <FormControlLabel control={<Checkbox />} label="Street Parking" />
                <FormControlLabel control={<Checkbox />} label="Private Parking Lot" />
              </FormGroup>
            </Box>
          </Box>

          {/* Footer buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
            <Button onClick={onClose} sx={{ color: "text.secondary" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{ bgcolor: "#6f6f6f", "&:hover": { bgcolor: "#5f5f5f" } }}
            >
              Save
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Modal>
  );
}