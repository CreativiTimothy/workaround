import { AppBar, Box, Toolbar, Typography, Button} from "@mui/material";
import { FilterList } from "@mui/icons-material";

type TopBarProps = { onFilterClick?: () => void; };

export default function TopBar({ onFilterClick }: TopBarProps) {
  return (
    <AppBar position="sticky" sx={{ top: 0, bgcolor: "#d9d9d9", color: "black", }}>
      <Toolbar sx={{ minHeight: 72, gap: 2 }}>
        {/* Left: logo + brand */}
        <Box sx={{ alignItems: "center", gap: 1 }}>
            {/* If you have a logo image, put it in /public/logo.png */}
            <Box
                component="img"
                src="/logo.png"
                alt="Work Around"
                sx={{ height: 44, width: "auto" }}
                onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
            />
            <Typography sx={{ fontWeight: 800 }}>
                work around
            </Typography>
        </Box>

        {/* Filter button (pill) */}
        <Button
            onClick={onFilterClick}
            variant="contained"
            disableElevation
            startIcon={<FilterList />}
            sx={{
                bgcolor: "#bdbdbd",
                color: "black",
                borderRadius: 999,
                px: 2.5,
                py: 1,
                fontWeight: 800,
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#adadad" },
            }}
        >
          Filter
        </Button>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Login button (pill) */}
        <Button
          variant="contained"
          disableElevation
          sx={{
            bgcolor: "#6f6f6f",
            color: "white",
            borderRadius: 999,
            px: 3,
            py: 1,
            fontWeight: 800,
            textTransform: "uppercase",
            "&:hover": { bgcolor: "#5f5f5f" },
          }}
        >
          Log In
        </Button>
      </Toolbar>
    </AppBar>
  );
}