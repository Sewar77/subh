import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Alert,
  LinearProgress,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LanguageIcon from "@mui/icons-material/Language";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { usePages } from "../../../../Hooks/usePages";
import { useParams } from "react-router-dom";
import CopyButton from "../../../Buttons/CopyBtn";
import AddButton from "../../Buttons/AddBtn";
import Title from "../../Headers/Titles";

export default function ViewPageTranslations() {
  const { pageId } = useParams();
  const { fetchPageTranslations, pageTranslations, loading } = usePages();

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPageTranslations(pageId);
  }, [pageId]);

  const filtered = (pageTranslations || []).filter((t) => {
    const q = search.toLowerCase();
    return (
      t.locale?.toLowerCase().includes(q) ||
      t.title?.toLowerCase().includes(q) ||
      t.slug?.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Title
        title={"Page Translations"}
        caption={
          "This is where you manage different languages of the same page. Each row is one language version (English, Arabic, etc)."
        }
      />

      {/* GUIDANCE BOX */}
      <Alert
        severity="info"
        sx={{
          my: 2,
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        <b>What you can do here:</b>
        <ul style={{ margin: "6px 0 0 18px" }}>
          <li>Edit text in different languages</li>
          <li>Copy content to reuse in another language</li>
          <li>Remove incorrect translations</li>
        </ul>
        <div style={{ marginTop: 6 }}>
          Tip: Each page should only have one translation per language.
        </div>
      </Alert>

      {/* LOADING */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* EMPTY STATE */}
      {!loading && pageTranslations.length === 0 && (
        <Alert
          severity="warning"
          sx={{
            my: 2,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          No translations found for this page.
          <br />
          You can add one by clicking “Add Langugae".
        </Alert>
      )}

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search translations (English, Arabic, title, slug...)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        helperText="Use this to quickly find a language version"
        sx={{ my: 2 }}
      />
      <Box sx={{ my: 4 }}>
        <AddButton
          to={`/admin/add-translations-page/${pageId}`}
          label="Language"
        />
        <Typography variant="body1" sx={{ mt: 2 }}>
          You can only add one translation for each langugae.
        </Typography>
      </Box>
      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "primary.main",
              }}
            >
              <TableCell
                sx={{
                  color: "primary.contrastText",
                  fontWeight: 600,
                  fontSize: "20px",
                }}
              >
                Language
              </TableCell>

              <TableCell
                sx={{
                  color: "primary.contrastText",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "20px",
                }}
              >
                Title
              </TableCell>

              <TableCell
                sx={{
                  color: "primary.contrastText",
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: "20px",
                }}
              >
                Slug
              </TableCell>

              <TableCell
                sx={{
                  color: "primary.contrastText",
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: "20px",
                }}
              >
                SEO Title
              </TableCell>
              <TableCell
                sx={{
                  color: "primary.contrastText",
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: "20px",
                }}
              >
                SEO Description
              </TableCell>

              <TableCell
                sx={{
                  color: "primary.contrastText",
                  fontWeight: 600,
                  fontSize: "20px",
                  textAlign: "center",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id} hover>
                {/* LANGUAGE */}
                <TableCell>
                  <Tooltip title="This is the language of this version">
                    <Chip
                      icon={<LanguageIcon />}
                      label={t.locale === "en" ? "English" : "Arabic"}
                      size="large"
                      color={t.locale === "en" ? "primary" : "secondary"}
                    />
                  </Tooltip>
                </TableCell>

                {/* TITLE */}
                <TableCell>
                  <Typography fontWeight={600}>
                    {t.title || "No title yet"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This is what users will see on the page
                  </Typography>
                </TableCell>

                {/* SLUG */}
                <TableCell sx={{ textAlign: "center" }}>
                  <Chip label={t.slug} size="large" variant="contained" />
                  <br />
                  <Typography variant="caption" display="block">
                    This is the page link (URL) which users see
                  </Typography>
                </TableCell>

                {/* SEO */}
                <TableCell>
                  <Typography variant="body1">
                    {t.seo_title || "No SEO title"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Helps Google understand your page
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {t.seo_description || "No SEO description"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Helps Google understand your page
                  </Typography>
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 0.5,
                    }}
                  >
                    <Tooltip title="Preview how this language version looks">
                      <IconButton>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit this translation">
                      <IconButton>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <CopyButton
                      text={`Locale: ${t.locale}
                        Title: ${t.title}
                        Slug: ${t.slug}
                        SEO Title: ${t.seo_title}`}
                      tooltip="Copy full translation"
                      successMessage="Translation copied"
                    />
                    <Tooltip title="Delete this translation (cannot be undone)">
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    textAlign="center"
                  >
                    Click icons to manage this language version
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
