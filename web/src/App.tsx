import { Grid, Box } from "@mui/material";
import { TopBar, FilterModal } from "./components";
import { useState } from "react";


export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TopBar onFilterClick={() => setOpen(true)} />
      <FilterModal open={open} onClose={() => setOpen(false)} />
      
      <Grid container spacing={0}>
        <Grid size={5}>
          <Box>Results List</Box>
        </Grid>
        <Grid size={7}>
          <Box>Map</Box>
        </Grid>
      </Grid>
    </>
  );
}