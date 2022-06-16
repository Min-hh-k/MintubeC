const express = require("express");
const router = express.Router();
const { Comment } = require("../models/Comment");


//=================================
//            Comment
//=================================

  router.post('/saveComment', (req, res) => {


  const comment = new Comment(req.body)

    comment.save((err, comment) => {
      if(err) return res.json({ success: false, err })

      //save() 쓰게 되면 populate을 바로 못씀 >> 코멘트에서 id를 찾아서 populate 해줌
      Comment.find({'_id' : comment._id})
      .populate('writer')
      .exec((err, result) => {
        if(err) return res.json({ success: false, err })
        res.status(200).json({ success : true, result})
      })
    })
  });

  router.post("/getComments", (req, res) => {
    
    Comment.find({"postId" : req.body.videoId})
    .populate("writer")
    .exec((err,comments) => {
        if(err) return res.status(400).send(err)
        res.status(200).json({ success : true, comments})
    })
  });

  module.exports = router;
