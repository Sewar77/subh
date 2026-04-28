import { Card, CardContent, Box, Paper, Typography } from "@mui/material";

export default function About() {
  return (
    <>
      <Box
        sx={{
          textAlign: "center",
          mt: 4,
          // mb: { xs: 0.5, sm: 1.5, md: 2, lg: 3 },
          width: "100%",
          // maxWidth: "1400px",
          mx: "auto",
          p: { xs: 0.5, sm: 1.5, md: 2, lg: 3 },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            position: "relative",
            display: "inline-block",
            fontWeight: 700,
            mb: 2,
            "&::after": {
              content: '""',
              position: "absolute",
              left: 0,
              bottom: -6,
              width: "100%",
              height: "4px",
              borderRadius: "4px",
              background: "linear-gradient(90deg, #bb40bf, #613389, #102943 )",
            },
          }}
        >
          Who We Are?
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          A center dedicated to providing educational curricula and services for
          schools, centers, and individuals across North America
        </Typography>

        <Box sx={{ my: 6, mx: "auto" }}>
          <Typography
            variant="h4"
            sx={{
              position: "relative",
              display: "inline-block",
              fontWeight: 700,
              "&::after": {
                mx: "auto",
                content: '""',
                position: "absolute",
                left: 0,
                bottom: -6,
                width: "100%",
                height: "4px",
                borderRadius: "4px",
                background:
                  "linear-gradient(90deg, #bb40bf, #613389, #102943 )",
              },
            }}
          >
            Mission and Vision
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
              mt: 2,
              flexWrap: {
                xs: "wrap",
                sm: "nowrap",
                md: "nowrap",
                lg: "nowrap",
              },
              textAlign: "center",
              width: "100%",
              // maxWidth: "1300px",
              mx: "auto",
              p: { xs: 0.5, sm: 1.5, md: 2, lg: 3 },
              alignItems: "center",
            }}
          >
            <Box
              size={{ xs: 12, md: 6, lg: 5 }}
              sx={{
                textAlign: "center",
                alignContent: "center",
                color: "text.secondary",
              }}
            >
              <Card
                sx={{
                  textAlign: "center",
                  alignContent: "center",
                  color: "text.secondary",
                  p: 2,
                  minHeight: "10rem",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "white" }}
                  >
                    Vision:
                  </Typography>
                  To offer curricula and learning resources that empower
                  educators and administrators to perform their roles
                  efficiently.
                </CardContent>
              </Card>
            </Box>
            <Box
              size={{ xs: 12, md: 6, lg: 5 }}
              sx={{
                textAlign: "center",
                alignContent: "center",
                color: "text.secondary",
              }}
            >
              <Card
                sx={{
                  textAlign: "center",
                  alignContent: "center",
                  color: "text.secondary",
                  p: 2,
                  minHeight: "10rem",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "white" }}
                  >
                    Mission:
                  </Typography>
                  To enhance the educational process with flexible and
                  professional resources and curricula that meet its evolving
                  requirements.
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
