import { useEffect } from "react";
import { usePages } from "../../../../Hooks/usePages.js";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
  Chip,
  Divider,
  CardActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ViewTemplates() {
  const { fetchTemplates, templates = [] } = usePages();
  useEffect(() => {
    fetchTemplates();
  }, []);
  const navigate = useNavigate();
  return (
    <Container
      sx={{
        py: 5,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* PAGE HEADER */}
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Page Templates
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Templates are the starting point for creating pages on your website.
        Think of them as page blueprints. They define the layout and purpose of
        a page before content, images, and translations are added.
      </Typography>

      {/* INFO CARD */}
      <Card
        sx={{
          mb: 5,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            How Templates Work
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            A template does not appear on the website by itself. It is only a
            reusable structure that helps you create pages faster and keep the
            website organized.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} gutterBottom>
            Typical Workflow
          </Typography>

          <Typography variant="body1" color="text.secondary">
            1. Select a template below.
            <br />
            2. Create a page using that template.
            <br />
            3. Add page information and translations.
            <br />
            4. Create and arrange page sections.
            <br />
            5. Add content, images, and media.
            <br />
            6. Publish the page when ready.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} gutterBottom>
            About the Internal Reference
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Each template has an internal reference used by the system to
            identify it. This reference is only shown inside the admin panel and
            helps administrators distinguish between templates. Website visitors
            will never see it.
          </Typography>
        </CardContent>
      </Card>

      {/* TEMPLATE CARDS */}
      <Grid container spacing={3}>
        {templates.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight={700}>
                    {item.name}
                  </Typography>
                }
              />

              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Internal Reference
                    </Typography>

                    <Chip label={item.key} size="small" sx={{ mt: 1 }} />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created On
                    </Typography>

                    <Typography variant="body1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <CardActions sx={{ justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/admin/create-page/${item.id}`)}
                    >
                      Use Template
                    </Button>
                  </CardActions>
                  <Divider />

                  <Typography variant="body2" color="text.secondary">
                    This template can be used when creating a new page. After a
                    page is created, you can add translations, sections, media,
                    and publish it to the website.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
