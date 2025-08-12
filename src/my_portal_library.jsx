import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";

// アイコンのimport
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LaunchIcon from '@mui/icons-material/Launch';
import RefreshIcon from '@mui/icons-material/Refresh';

const RAW_JSON_URL = "https://raw.githubusercontent.com/Riluchi/MyPortalLibrary_data/refs/heads/main/MyPortalLibrary.json";

export default function MyPortalLibraryApp() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetchData を外に出して再利用可能に
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(RAW_JSON_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`fetch failed ${res.status}`);
      const json = await res.json();
      setData(json);

      const cats = Array.isArray(json.Categorys) ? json.Categorys.map(c => c.Category) : [];
      setCategories(cats);
      setActive(cats[0] || null);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openWorld = (worldId) => {
    const url = `https://vrchat.com/home/launch?worldId=${encodeURIComponent(worldId)}`;
    window.open(url, "_blank");
  };

  // Platform indicator component using MUI Box and Tooltip
  const PlatformDots = ({ platform }) => {
    const pc = platform && (platform.PC === true || platform.pc === true || platform.PC === "true");
    const android = platform && (platform.Android === true || platform.android === true || platform.Android === "true");

    return (
      <Stack direction="row" spacing={-1} alignItems="center">
        {pc && (
          <Tooltip title="PC">
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: "#3b82f6",
                borderRadius: "50%",
                border: "1.5px solid rgba(0,0,0,0.12)",
                zIndex: android ? 1 : 0,
              }}
            />
          </Tooltip>
        )}
        {android && (
          <Tooltip title="Android">
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: "#10b981",
                borderRadius: "50%",
                border: "1.5px solid rgba(0,0,0,0.12)",
                ml: pc ? -0.5 : 0,
              }}
            />
          </Tooltip>
        )}
        {!pc && !android && (
          <Typography variant="caption" color="text.secondary">
            N/A
          </Typography>
        )}
      </Stack>
    );
  };

  const renderListForCategory = (cat) => {
    if (!data?.Categorys) return <Typography p={2}>データ構造が不正です。</Typography>;

    const categoryObj = data.Categorys.find(c => c.Category === cat);
    if (!categoryObj) return <Typography p={2}>カテゴリが見つかりません。</Typography>;

    const worlds = Array.isArray(categoryObj.Worlds) ? categoryObj.Worlds : [];

    return (
      <Stack spacing={2} p={2}>
        {worlds.map((world, idx) => {
          const title = world.Name || world.ID || `World ${idx}`;
          const description = world.Description || "説明なし";
          const min = world.RecommendedCapacity || "-";
          const max = world.Capacity || "-";
          const platform = world.Platform || {};

          return (
            <Card key={idx} variant="outlined" sx={{ boxShadow: 1 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                  <Typography variant="h6" component="div" sx={{ mb: { xs: 1, sm: 0 } }}>
                    {title}
                  </Typography>
                  <PlatformDots platform={platform} />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  {description}
                </Typography>

              </CardContent>

              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                  <PersonIcon fontSize="large" color="action" />
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    <strong>{min}</strong>
                  </Typography>
                  <PeopleIcon fontSize="large" color="action" />
                  <Typography variant="body2">
                    <strong>{max}</strong>
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<LaunchIcon />}
                  onClick={() => openWorld(world.ID)}
                >
                  Launch World
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </Stack>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 4 }}>
      <Box maxWidth="md" mx="auto">
        <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              RIluchi MyPortalLibrary Viewer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              VRChatのワールドからお気に入りのやつを共有しようぜ
            </Typography>
          </Box>
          <Tooltip title="データを再読み込み">
            <IconButton onClick={fetchData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          {loading && (
            <Typography variant="body2" color="text.secondary" p={2}>
              読み込み中...
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error" p={2}>
              エラー: {error}
            </Typography>
          )}
          {!loading && !error && categories.length > 0 && (
            <Tabs
              value={categories.indexOf(active)}
              onChange={(e, newIndex) => setActive(categories[newIndex])}
              variant="scrollable"
              scrollButtons="auto"
            >
              {categories.map((c) => (
                <Tab key={c} label={c} />
              ))}
            </Tabs>
          )}
          {!loading && !error && categories.length === 0 && (
            <Typography variant="body2" color="text.secondary" p={2}>
              カテゴリが見つかりません。
            </Typography>
          )}
        </Box>

        <Box mt={3}>
          {!loading && !error && active && renderListForCategory(active)}
        </Box>
      </Box>
    </Box>
  );
}
