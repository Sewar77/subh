import { Box, Button, Container, Grid } from "@mui/material";
import Subscribe from "./Subscribe";
import ConnectInfo from "./ConnectInfo";
import CopyRight from "./CopyRight";
import Pages from "./Pages";
import Info from "./Info";
import { useLanguage } from "../../../Context/LanguageContext";
export default function Footer() {
  const { language } = useLanguage();
  return (
    <>
      <Container
        sx={{
          direction: language === "ar" ? "rtl" : "ltr",
          position: "static",
          bottom: 0,
          display: "inline-block",
          mx: "auto",
          background: "linear-gradient(90deg, #bb40bf, #613389, #102943)",
          minHeight: "300px",
          mt: 5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 6,
          color: "text.secondary",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <Grid
          container
          spacing={3}
          sx={{
            mb: 2,
          }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Subscribe />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ConnectInfo />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Pages />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Info />
          </Grid>
        </Grid>
        <Box
          sx={{
            left: 0,
            bottom: -6,
            width: "60%",
            height: "4px",
            borderRadius: "4px",
            background: "#41f2c3",
          }}
        />
        <CopyRight />
      </Container>
    </>
  );
}
