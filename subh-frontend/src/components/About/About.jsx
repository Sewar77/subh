import { Box, Container, Typography } from "@mui/material";

const sections = [
  {
    title: "Our Vision",
    text: "Providing curricula and learning resources to help those in charge of the educational and pedagogical process.",
    img: "/vision.png",
    reverse: false,
  },
  {
    title: "Who Are We?",
    text: "Enhancing the educational and pedagogical process with resources and curricula, making it more flexible and professional.",
    img: "/girl.png",
    reverse: true,
  },
  {
    title: "Our Team",
    text: "Our platform was established to provide a modern learning experience that combines fun and knowledge.",
    img: "/whiteLogo.png",
    reverse: false,
  },
  {
    title: "When was Subh Founded?",
    text: "Our team consists of experts in education and technology working together to provide outstanding educational content.",
    img: "/people.svg",
    reverse: true,
  },
];

export default function About() {
  return (
    <Container
      sx={{
        minHeight: "100vh",
        mt: 5,
      }}
    >
      {sections.map((section, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: section.reverse ? "row-reverse" : "row",
            },
            alignItems: "center",
            justifyContent: "space-evenly",
            gap: 6,
            py: 6,
            textAlign: "center",
          }}
        >
          {/* Image */}
          <Box
            component="img"
            src={section.img}
            sx={{
              width: { xs: "70%", md: "30%" },
              transition: "all 0.4s ease",
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
              "&:hover": {
                transform: "scale(1.08) rotate(2deg)",
              },
            }}
          />

          {/* Content */}
          <Box
            sx={{
              width: { xs: "90%", md: "40%" },
              p: 5,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",

              background: "linear-gradient(135deg, #613389, #bb40bf)",
              color: "white",

              transition: "all 0.4s ease",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",

              "&:hover": {
                transform: "translateY(-10px) scale(1.02)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              },
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
              {section.title}
            </Typography>

            <Typography variant="body1">{section.text}</Typography>
          </Box>
        </Box>
      ))}
    </Container>
  );
}
