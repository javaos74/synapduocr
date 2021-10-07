var express = require('express');
var router = express.Router();
var fs = require('fs');
const request = require('request')
const uuid = require('uuid')

/* POST body listing. */
router.post('/', function(req, res, next) {
    //console.log(req.body.requests[0].image.content);
    res.writeContinue();
    let buff = new Buffer( req.body.requests[0].image.content, "base64");
    var filename = uuid.v4();
    fs.writeFileSync( __dirname + "/" + filename+".png", buff);

    const formdata = {
        api_key: req.headers['x-uipath-license'],
        type: 'upload',
        boxes_type: 'block',
        image: fs.createReadStream( __dirname + '/'+ filename+'.png'),
        coord: 'origin',
        skew: 'image',
        langs: 'all',
        textout: 'true'
    }
    const options = {
        url: 'https://ailab.synap.co.kr/sdk/ocr',
        method: 'POST',
        formData: formdata,
    }

    fs.unlink( __dirname + '/' + filename+'.png', (err) => {
        console.log('error on file deletion ');
    });

    request.post( options, function(err, resp) {
        if( err)
            console.log(err);
        //console.log( typeof( resp.body));
        //console.log(resp.body);
        synap = JSON.parse(resp.body);
        //console.log( synap.result.width);
        var du_resp = {
            responses: [
                {
                    angle: 0,
                    textAnnotations: [
                        {
                            description : synap.result.full_text,
                            score: 0,
                            type: 'text',
                            image_hash: '3a3a4f4f3a3a4f4f3a3a4f4f3a3a4f4f',
                            boundingPoly : {
                                vertices: [
                                    {x: 0, y: 0},
                                    {x: synap.result.width, y: 0},
                                    {x: synap.result.width, y: synap.result.height},
                                    {x: 0, x: synap.result.height},
                                ]
                            }
                        }
                    ]
                }
            ]
        }
        synap.result.block_boxes.forEach( p => {
            du_resp.responses[0].textAnnotations.push ({
                description: p[5],
                score: p[4],
                type: 'text',
                boundingPoly: {
                    vertices: [
                        {x: p[0][0], y: p[0][1]},
                        {x: p[1][0], y: p[1][1]},
                        {x: p[2][0], y: p[2][1]},
                        {x: p[3][0], y: p[3][1]}
                    ]
                }
            });
        })
        res.send( du_resp);
    });
});

module.exports = router;