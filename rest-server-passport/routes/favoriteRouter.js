var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');

var Favorites = require('../models/favorites');

var favoRouter = express.Router();
favoRouter.use(bodyParser.json());

favoRouter.route('/')

.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.find({'postedBy': req.decoded._id})
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorite) {
        if (err) return next(err);
        res.json(favorite[0]);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
  Favorites.find({ 'postedBy': req.decoded._id}, function(err,favorite) {
    if (err) return next(err);

    //fisrt time to add favorite
    if(favorite.length == 0) {
      //req.body.postedBy = req.decoded._id;
      Favorites.create({postedBy: req.decoded._id}, function (err, result) {
          if (err) return next(err);
          result.dishes.push(req.body._id);
          result.save(function (err, resl) {
              if (err) return next(err);
              res.json(resl);
          });
      });
    }
    //else, just push the favorite to dishes
    else {
      var isExist = false;
      for (var i=0;i<favorite[0].dishes.length;i++) {
        if(favorite[0].dishes[i] == req.body._id) {
          isExist = true;
        }
      }
      if(!isExist){
        favorite[0].dishes.push(req.body._id);
        favorite[0].save(function (err, resl) {
            if (err) return next(err);
            res.json(resl);
        });
      }
    }
  });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next){
  Favorites.remove({ 'postedBy': req.decoded._id},function(err,result) {
    if (err) return next(err);
    res.json(result);
  });
});

favoRouter.route('/:dishId')

.delete(Verify.verifyOrdinaryUser, function(req, res, next){
  Favorites.find({ 'postedBy': req.decoded._id},function(err,favorite) {
    if (err) return next(err);
    for(var i=0; i<favorite[0].dishes.length; i++) {
      if(favorite[0].dishes[i] == req.params.dishId) {
        console.log(favorite[0].dishes[i]);
        favorite[0].dishes.splice(i,i+1);
      }
    }


    favorite[0].save(function (err,result) {
      if (err) return next(err);
      res.json(result);
    });
  });
});

module.exports = favoRouter;
