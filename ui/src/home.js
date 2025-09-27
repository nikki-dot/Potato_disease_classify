import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Avatar, Container, Card, CardContent, CardActionArea, CardMedia, Grid, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Button, CircularProgress, Paper } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useDropzone } from "react-dropzone";
import axios from "axios";

import plantlogo from "./plantlogo.png";
import bgImage from "./bg.jpg";
import uploadImage from "./upload.png";


// Styled Button
const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText("#fff"),
  backgroundColor: "#fff",
  "&:hover": {
    backgroundColor: "#ffffff7a",
  },
}));

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (files) => {
      if (!files || files.length === 0) return;
      setSelectedFile(files[0]);
      setImage(true);
      setData(null);
    },
  });

  // Preview
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Send file to API
  useEffect(() => {
    if (!preview) return;

    const sendFile = async () => {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await axios.post(process.env.REACT_APP_API_URL, formData);
        console.log("API response:", res.data); 
        if (res.status === 200) setData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    sendFile();
  }, [preview, selectedFile]);

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  const confidence = data ? (parseFloat(data.confidence)).toFixed(2) : 0;

  return (
    <>
      <AppBar position="static" sx={{ background: "linear-gradient(45deg, #3c1053, #ad5389)", boxShadow: 5 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 , fontWeight: "bold",textShadow: "1px 1px 2px rgba(0,0,0,0.3)"}}>
            Potato Disease Classification
          </Typography>
          <Avatar src={plantlogo}  sx={{border: "5px solid #fff",boxShadow:8}}/>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth={false}
        sx={{
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          height: "93vh",
          marginTop: "8px",
        }}
      >
        <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ padding: "4em 1em 0 1em" }}>
          <Grid>
            <Card sx={{ maxWidth: 400, height: 500, margin: "auto", backgroundColor: "transparent", boxShadow: "0px 9px 70px 0px rgb(0 0 0 / 30%)", borderRadius: "15px" }}>
              
              {image && preview && (
                <CardActionArea>
                  <CardMedia component="img" height="400" image={preview} alt="Selected" />
                </CardActionArea>
              )}

              {!image && (
                <CardContent>
                  <div
                    {...getRootProps()}
                    style={{
                      border: "2px dashed #ccc",
                      padding: "20px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundImage: `url(${uploadImage})`,
                      backgroundSize: "100px",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center 90px",
                      width: "300px",   // makes it fill CardContent width
                      height: "250px",
                    }}
                  >
                    <input {...getInputProps()} />
                    <Typography sx={{color:"black",fontWeight: "bold" }}>Drag and drop an image of a Potato leaf here</Typography>
                  </div>
                </CardContent>
              )}

              {data && (
                <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <TableContainer component={Paper} sx={{ boxShadow: 4 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Label:</TableCell>
                          <TableCell align="right">Confidence:</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{data.class_name}</TableCell>
                          <TableCell align="right">{confidence}%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}

              {isLoading && (
                <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <CircularProgress sx={{ color: "#be6a77" }} />
                  <Typography variant="h6">Processing</Typography>
                </CardContent>
              )}
            </Card>
          </Grid>

          {data && (
            <Grid >
              <ColorButton variant="contained" size="small" startIcon={<ClearIcon />} onClick={clearData} sx={{ width: "100%", borderRadius: "15px", padding: "15px 22px" }}>
                Clear
              </ColorButton>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};
