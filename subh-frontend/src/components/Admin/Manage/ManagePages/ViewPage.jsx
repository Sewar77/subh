import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { usePages } from "../../../../Context/pageContext";
import { useEffect, useState } from "react";
import Title from "../../Headers/Titles";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
export default function ViewPage() {
  const { page, fetchPageById, deletePage } = usePages();
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);
  useEffect(() => {
    if (pageId) {
      fetchPageById(pageId);
    }
  }, [pageId]);
  if (!page) return null;
  const handleDelete = async () => {
    await deletePage(page.id);
    setDeleteModal(false);
    navigate("/admin/view-pages");
  };
  const InfoItem = ({ title, description, children }) => (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
        my: 2,
        borderRadius: 3,
        backgroundColor: "background.default",
      }}
    >
      <Typography
        sx={{
          fontSize: {
            xs: "1.4rem",
            md: "1.7rem",
          },
          fontWeight: 900,
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: {
            xs: "0.85rem",
            md: "0.95rem",
          },
          color: "text.secondary",
          mb: 2,
          lineHeight: 1.5,
        }}
      >
        {description}
      </Typography>

      {children}
    </Box>
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Title title={`Page: ${page.name}`} />

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        sx={{
          gap: 2,
          mb: 4,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate(`/admin/page-translations/${page.id}`)}
          sx={{
            fontSize: {
              xs: "1rem",
              md: "1.1rem",
            },
            px: 4,
          }}
        >
          Translations
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => setDeleteModal(true)}
          sx={{
            fontSize: {
              xs: "1rem",
              md: "1.1rem",
            },
            px: 4,
          }}
        >
          Delete Page
        </Button>
      </Stack>

      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 4,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              md: 5,
            },
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "2rem",
                md: "3rem",
              },
              fontWeight: 900,
            }}
          >
            Page Information
          </Typography>

          <Divider
            sx={{
              my: 4,
            }}
          />

          <Stack
            sx={{
              gap: 2,
            }}
          >
            <InfoItem
              title="Page Name"
              description="The display name used by administrators to recognize and manage this page."
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "1.6rem",
                    md: "2rem",
                  },
                  fontWeight: 900,
                }}
              >
                {page.name}
              </Typography>
            </InfoItem>

            <InfoItem
              title="Page Key"
              description="The unique internal identifier used by the system. This value connects the page with backend operations."
            >
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: {
                    xs: "1.4rem",
                    md: "1.8rem",
                  },
                  fontWeight: 800,
                }}
              >
                {page.key}
              </Typography>
            </InfoItem>

            <InfoItem
              title="Publishing Status"
              description="Controls whether this page is visible to website visitors or still under development."
            >
              <Chip
                label={page.status}
                color={page.status === "published" ? "success" : "warning"}
                sx={{
                  fontSize: {
                    xs: "1rem",
                    md: "1.2rem",
                  },
                  fontWeight: 800,
                  px: 2,
                }}
              />
            </InfoItem>

            <InfoItem
              title="Created At"
              description="The date and time when this page was initially created inside the CMS."
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "1.1rem",
                    md: "1.3rem",
                  },
                  fontWeight: 600,
                }}
              >
                {new Date(page.created_at).toLocaleString()}
              </Typography>
            </InfoItem>

            <InfoItem
              title="Last Updated"
              description="The latest modification time of this page information."
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "1.1rem",
                    md: "1.3rem",
                  },
                  fontWeight: 600,
                }}
              >
                {page.updated_at
                  ? new Date(page.updated_at).toLocaleString()
                  : "-"}
              </Typography>
            </InfoItem>
          </Stack>
        </CardContent>
      </Card>

      {deleteModal && (
        <ConfirmDeleteModal
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          onConfirm={handleDelete}
          label="Page"
        />
      )}
    </Container>
  );
}
