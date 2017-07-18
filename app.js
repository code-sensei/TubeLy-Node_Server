var express = require('express');
var event = require('events');
var evnt = new event.EventEmitter();
var app = express();
var fs = require("fs");
var ytdl = require('youtube-dl');
var gcloud = require('gcloud')({
      projectId: 'tubely-169219',
      keyFilename: 'TubeLy-380d5282acfe.json'
});
var gcs = gcloud.storage();

var storageRef = gcs.bucket('tubely-169219.appspot.com');

app.get('/:id', function (req, res) {
      // Download video by passed id
      var video = ytdl('http://www.youtube.com/watch?v=' + req.params.id,
      // Optional arguments passed to youtube-dl. 
      ['--format=18'],
      // Additional options can be given for calling `child_process.execFile()`. 
      { cwd: __dirname }
      );
      
      // Will be called when the download starts. 
      video.on('info', (info) => {
            console.log('Download started');
            console.log('filename: ' + info.filename);
            console.log('size: ' + info.size);
      });

      video.pipe(fs.createWriteStream('videos/' + req.params.id + '.mp4')) 

      video.on('end', (info) => {
            console.log('Uploading...')
                  storageRef.upload('videos/' + req.params.id + '.mp4', (err, file) => {
                        console.log('Upload started')
                        if(!err)
                              console.log('Upload to storage successful')
                        console.error(err)
                  })
      })
})

var server = app.listen(8081, function () {

      var host = server.address().address
      var port = server.address().port
      console.log("Example app listening at http://%s:%s", host, port)

})