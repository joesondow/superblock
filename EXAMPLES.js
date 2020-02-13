var helpers = require(__dirname + '/helpers.js'),
    twitter = require(__dirname + '/twitter.js'),
    res = null;
/*
  This is a more advanced version of the Twitter bot starter project at glitch.com/~twitterbot.
  It comes with a few useful helper functions (see helpers.js) and the Twit functions are abstracted inside twitter.js,
  allowing you to type a bit less code.
  
  See below for example code snippets that you can use. 
*/

/* Example 1: Tweet out "Hello world 👋". */

twitter.tweet('Hello world 👋', function(err, data){
  if (err){
    console.log(err);     
    res.sendStatus(500);
  }
  else{
    console.log('tweeted');
    res.sendStatus(200);
  }
});

/* Example 2: Pick a random image from the assets folder and tweet it. */

helpers.loadImageAssets(function(err, asset_urls){
  if (err){
    console.log(err);     
    res.sendStatus(500);
  }
  else{
    helpers.loadRemoteImage(helpers.randomFromArray(asset_urls), function(err, img_data){
      if (err){
        console.log(err);     
        res.sendStatus(500);
      }
      else{
        twitter.postImage('Hello 👋', img_data, function(err, data){
          if (err){
            console.log(err);     
            res.sendStatus(500);
          }
          else{
            res.sendStatus(200);
          }            
        });
      }
    });
  }
});
