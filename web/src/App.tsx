import { Grid, Box } from "@mui/material";
import { TopBar, FilterModal, LogInModal } from "./components";
import { useState } from "react";


export default function App() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <TopBar
        onFilterClick={() => {
          setFilterOpen(true);
          setLoginOpen(false);
        }}
        onLogInClick={() => {
          setLoginOpen(true);
          setFilterOpen(false);
        }}
      />

      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} />
      <LogInModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      
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