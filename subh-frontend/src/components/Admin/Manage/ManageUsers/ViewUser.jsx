import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  CardActions,
} from "@mui/material";

import {
  Email,
  Person,
  CalendarMonth,
  VerifiedUser,
  AdminPanelSettings,
} from "@mui/icons-material";

import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../../../../Hooks/useUsers";
import UpdateBtn from "../../Buttons/UpdateBtn.jsx";
import DeleteButton from "../../Buttons/DeleteBtn";
export default function ViewUser() {
  const { id } = useParams();

  const { user, getUserById } = useUser();

  useEffect(() => {
    if (id) {
      getUserById(id);
    }
  }, [id]);

  if (!user) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={45} />

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: {
              xs: "1.4rem",
              md: "1.8rem",
            },
          }}
        >
          Loading User...
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: {
          xs: 3,
          md: 6,
        },
      }}
    >
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 3,
              md: 5,
            },
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            borderBottom: "1px solid #eaeaea",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Avatar
              sx={{
                width: {
                  xs: 100,
                  md: 130,
                },
                height: {
                  xs: 100,
                  md: 130,
                },
                fontSize: {
                  xs: 40,
                  md: 55,
                },
                fontWeight: "bold",
                bgcolor: "primary.main",
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Box flex={1}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: {
                    xs: "2rem",
                    md: "3rem",
                  },
                  mb: 1,
                }}
              >
                {user.name}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                useFlexGap
                sx={{
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label={user.role}
                  color="primary"
                  icon={<AdminPanelSettings />}
                  sx={{
                    height: 42,
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                />

                <Chip
                  label={user.is_active ? "Active" : "Inactive"}
                  color={user.is_active ? "success" : "error"}
                  icon={<VerifiedUser />}
                  sx={{
                    height: 42,
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                />
              </Stack>
            </Box>
          </Box>
          <CardActions
            sx={{
              justifyContent: "center",
              p: 3,
            }}
          >
            <UpdateBtn />
            <DeleteButton />
          </CardActions>
        </Box>

        <CardContent
          sx={{
            p: {
              xs: 3,
              md: 5,
            },
          }}
        >
          <Grid
            container
            spacing={4}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid xs={12} md={6}>
              <Box
                sx={{
                  border: "1px solid #ececec",
                  borderRadius: 4,
                  p: {
                    xs: 3,
                    md: 4,
                  },
                  height: "100%",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                  mb={3}
                >
                  <Person sx={{ fontSize: 35 }} />

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: {
                        xs: "1.5rem",
                        md: "2rem",
                      },
                    }}
                  >
                    User Information
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 4 }} />

                <Stack spacing={4}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1rem",
                          md: "1.15rem",
                        },
                        fontWeight: 800,
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      Full Name
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.1rem",
                          md: "1.3rem",
                        },
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      {user.name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1rem",
                          md: "1.15rem",
                        },
                        fontWeight: 800,
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      User Type
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.1rem",
                          md: "1.3rem",
                        },
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      {user.user_type}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1rem",
                          md: "1.15rem",
                        },
                        fontWeight: 800,
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      Role
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.1rem",
                          md: "1.3rem",
                        },
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      {user.role}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* CONTACT INFO */}
            <Grid xs={12} md={6}>
              <Box
                sx={{
                  border: "1px solid #ececec",
                  borderRadius: 4,
                  p: {
                    xs: 3,
                    md: 4,
                  },
                  height: "100%",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                  mb={3}
                >
                  <Email sx={{ fontSize: 35 }} />

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: {
                        xs: "1.5rem",
                        md: "2rem",
                      },
                    }}
                  >
                    Contact & Activity
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 4 }} />

                <Stack spacing={4}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1rem",
                          md: "1.15rem",
                        },
                        fontWeight: 800,
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      Email Address
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.1rem",
                          md: "1.3rem",
                        },
                        color: "text.secondary",
                        fontWeight: 500,
                        wordBreak: "break-word",
                      }}
                    >
                      {user.email}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1rem",
                          md: "1.15rem",
                        },
                        fontWeight: 800,
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      Account Status
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.1rem",
                          md: "1.3rem",
                        },
                        fontWeight: 700,
                        color: user.is_active ? "success.main" : "error.main",
                      }}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1rem",
                          md: "1.15rem",
                        },
                        fontWeight: 800,
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      Registered At
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "center" }}
                    >
                      <CalendarMonth
                        sx={{
                          color: "text.secondary",
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: {
                            xs: "1.1rem",
                            md: "1.3rem",
                          },
                          color: "text.secondary",
                          fontWeight: 500,
                        }}
                      >
                        {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
