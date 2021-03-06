const express = require("express");
const router = express.Router();
const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber")
const { auth } = require("../middleware/auth");

//=================================
//             Video
//=================================
const multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".mp4") {
      return cb(res.status(400).end("mp4 is allowed"), false);
    }
    cb(null, true);
  },
});

var upload = multer({ storage: storage }).single("file");

//=================================
//             파일 업로드
//=================================

router.post("/uploadfiles", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.json({
      success: true,
      url: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

router.post("/thumbnail", (req, res) => {
  let filePath = "";
  let fileDuration = "";
  //썸네일 생성 및 duration 비디오 러닝타임도 가져옴

  //비디오 정보 가져오기
  ffmpeg.ffprobe(req.body.url, function (err, metadata) {
    console.dir(metadata);
    console.log(metadata.format.duration);

    fileDuration = metadata.format.duration;
  });

    // 환경 변수
    ffmpeg.setFfmpegPath("D:\\ffmpeg-5.0.1-essentials_build\\ffmpeg-5.0.1-essentials_build\\bin\\ffmpeg.exe")
  //썸네일 생성
  ffmpeg(req.body.url)
    .on("filenames", function (filenames) {
      console.log("Will generate " + filenames.join(", "));
      filePath = "uploads/thumbnails/" + filenames[0];
    })
    .on("end", function () {
      console.log("Screenshots taken");
      return res.json({
        success: true,
        filePath: filePath,
        fileDuration: fileDuration,
      });
    })
    .on("error", function (err) {
      console.error(err);
      return res.json({ success: false, err });
    })
    .screenshots({
      // Will take screens at 20%, 40%, 60% and 80% of the video
      count: 3,
      folder: "uploads/thumbnails",
      size: "320x240",
      // %b input basename ( filename w/o extension )
      filename: "thumbnail-%b.png",
    });
});

//  비디오 업로드
router.post("/uploadVideo", (req, res) => {

  const video = new Video(req.body)

  video.save((err, video) => {
      if(err) return res.status(400).json({ success: false, err })
      return res.status(200).json({
          success: true })
      })
  })

  //  구독 비디오
router.post("/getSubscriptionVideos", (req, res) => {

  // 자신의 아이디를 가지고 구독하는 사람들을 찾는다
  Subscriber.find({ userFrom: req.body.userFrom })
  .exec(( err, subscriberInfo ) => {
    if(err) return res.status(400).send(err)

    let subscribedUser = [];

    subscriberInfo.map((subscriber, i) => {
      subscribedUser.push(subscriber.userTo)
    })

    // 찾은 사람들의 비디오를 가지고 온다 $in 여러명 데이터 가져옴
    Video.find({ writer : { $in : subscribedUser } })
    .populate('writer') // id 이외의 것을 받아 올 수 있음 populate()'
    .exec((err, videos) => {
      if(err) return res.status(400).send(err)
      res.status(200).json({ success: true, videos })
    })
  }) 
  })






// 비디오 디테일 화면
router.post("/getVideoDetail", (req, res) => {
  Video.findOne({ _id: req.body.videoId })
    .populate("writer")
    .exec((err, videoDetail) => {
      if (err) return res.status(400).send(err);
      return res.status(200).json({ success: true, videoDetail });
    });
});

// 랜딩 페이지 비디오 나타내기
router.get("/getVideos", (req, res) => {
    
  Video.find()
      .populate('writer')
      .exec((err, videos) => {
        if(err) return res.status(400).send(err);
        return res.status(200).json({ success : true, videos });
      });
});



module.exports = router;