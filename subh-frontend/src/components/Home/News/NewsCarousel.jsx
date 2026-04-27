import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRef } from "react";

const newsItems = [
  {
    title: "Aurora Colors Shine",
    description: "Scientists explain vivid aurora hues.",
    image: "/subhlogo.png",
  },
  {
    title: "Tech Conference 2026",
    description: "Highlights from AI innovations.",
    image: "/subhlogo.png",
  },
  {
    title: "Education Center Launch",
    description: "New programs for students.",
    image: "/subhlogo.png",
  },
  {
    title: "Space Discoveries",
    description: "Latest findings from NASA.",
    image: "/subhlogo.png",
  },
];

export default function NewsCarousel() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const { scrollLeft, clientWidth } = scrollRef.current;

    scrollRef.current.scrollTo({
      left:
        direction === "left"
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <Box sx={{ position: "relative", py: 2 }}>
      <IconButton
        onClick={() => scroll("left")}
        sx={{
          position: "absolute",
          top: "50%",
          left: 8,
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "background.default" },
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          px: 6,
          py: 1,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {newsItems.map((item, index) => (
          <Card
            key={index}
            sx={{
              minWidth: { xs: 250, sm: 300, md: 320 },
              flexShrink: 0,
              scrollSnapAlign: "start",
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "background.default",
            }}
          >
            <CardMedia
              component="img"
              height="160"
              image={item.image}
              alt={item.title}
            />
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <IconButton
        onClick={() => scroll("right")}
        sx={{
          position: "absolute",
          top: "50%",
          right: 8,
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "background.default" },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
}
