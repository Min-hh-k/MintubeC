import React, { useState } from "react";
import styled from "styled-components";
import { Typography, Button, Form, message, Input, Icon } from "antd";
import Dropzone from "react-dropzone";
import axios from "axios";
import { useSelector } from "react-redux";

const { TextArea } = Input;
const { Title } = Typography;

const Container = styled.div`
  max-width: 700px;
  margin: 2rem auto;
`;

const TitleContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Display = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Box = styled.div`
  width: 300px;
  height: 240px;
  border: 1px solid lightgray;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PrivateOption = [
  { value: 0, label: "Private" },
  { value: 1, label: "Public" },
];

const CategoryOption = [
  { value: 0, label: "Film & Animation" },
  { value: 1, label: "Auto & Vehicles" },
  { value: 2, label: "Music" },
  { value: 3, label: "Pets" },
];

function VideoUploadPage(props) {
  const user = useSelector((state) => state.user);
  const [videoTitle, setVideoTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState(0);
  const [category, setCategory] = useState("Film & Animation");
  const [filePath, setFilePath] = useState("");
  const [duration, setDuration] = useState("");
  const [thumbnailPath, setThumbnailPath] = useState("");

  const onTitleChange = (e) => {
    setVideoTitle(e.currentTarget.value);
  };

  const onDescriptionChange = (e) => {
    setDescription(e.currentTarget.value);
    // console.log(e.currentTarget.value);
  };

  const onPrivateChange = (e) => {
    setPrivacy(e.currentTarget.value);
    // console.log(e.currentTarget.value);
  };

  const onCategoryChange = (e) => {
    setCategory(e.currentTarget.value);
  };

  const onDrop = (files) => {
    let formData = new FormData();
    const config = {
      header: { "content-type": "multipart/form-data" },
    };
    formData.append("file", files[0]);
    console.log(files);

    axios.post("/api/video/uploadfiles", formData, config).then((response) => {
      if (response.data.success) {
        // console.log(response.data);
        let variables = {
          url: response.data.url,
          fileName: response.data.fileName,
        };
        setFilePath(response.data.url);

        //썸네일 만들고 state 저장
        axios.post("/api/video/thumbnail", variables).then((response) => {
          if (response.data.success) {
            setDuration(response.data.fileDuration);
            setThumbnailPath(response.data.filePath);
            // console.log(response.data.thumbsFilePath);
          } else {
            alert("썸네일 생성에 실패하였습니다.");
          }
        });
      } else {
        alert("비디오 업로드를 실패했습니다.");
      }
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const variables = {
      writer: user.userData._id,
      title: videoTitle,
      description: description,
      privacy: privacy,
      filePath: filePath,
      category: category,
      duration: duration,
      thumbnail: thumbnailPath,
    };

    axios.post("/api/video/uploadVideo", variables).then((response) => {
      if (response.data.success) {
        // console.log(response.data);
        message.success("성공적으로 업로드를 했습니다.");

        setTimeout(() => {
          props.history.push("/");
        }, 3000);
      } else {
        alert("비디오 업로드 실패");
      }
    });
  };

  return (
    <Container>
      <TitleContainer>
        <Title level={2}>video upload</Title>
      </TitleContainer>
      <Form onSubmit={onSubmit}>
        <Display>
          <Dropzone onDrop={onDrop} multiple={false} maxSize={10000000000}>
            {({ getRootProps, getInputProps }) => (
              <Box {...getRootProps()}>
                <input {...getInputProps()} />
                <Icon type="plus" style={{ fontSize: "3rem" }} />
              </Box>
            )}
          </Dropzone>
          {thumbnailPath && (
            <div>
              <img
                src={`http://localhost:5000/${thumbnailPath}`}
                alt="thumbnail"
              />
            </div>
          )}
        </Display>
        <br />
        <br />
        <label>title</label>
        <Input onChange={onTitleChange} value={videoTitle} />
        <br />
        <br />

        <label>Description</label>
        <TextArea onChange={onDescriptionChange} value={description} />
        <br />
        <br />

        <select onChange={onPrivateChange}>
          {PrivateOption.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <br />
        <br />

        <select onChange={onCategoryChange}>
          {CategoryOption.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <br />
        <br />
        <Button type="primary" size="large" onClick={onSubmit}>
          submit
        </Button>
      </Form>
    </Container>
  );
}

export default VideoUploadPage;