import { Box, Container, Grid, Typography } from "@mui/material";
import Subscribe from "./Subscribe";
import ConnectInfo from "./ConnectInfo";
import CopyRight from "./CopyRight";
import Pages from "./Pages";
import Info from "./Info";
import { useLanguage } from "../../../Context/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 6, md: 10 },
        color: "common.white",
        background:
          "linear-gradient(125deg, #071a35 0%, #102943 55%, #613389 150%)",
        direction: language === "ar" ? "rtl" : "ltr",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={4}>
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
            borderTop: "1px solid rgba(255,255,255,.16)",
            mt: 4,
            pt: 3,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="rgba(255,255,255,.72)">
            {language === "ar"
              ? "محتوى ومعرفة للجميع"
              : "Knowledge and content for everyone."}
          </Typography>
          <CopyRight />
        </Box>
      </Container>
    </Box>
  );
}
