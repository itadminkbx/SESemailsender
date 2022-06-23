const nodemailer = require("nodemailer");

/**
  * @param {String} FromEmailAddress 
  * @param {Array.<string>} ToAddresses 
  * @param {Array.<string>} CcAddresses 
  * @param {String} Subject
  * @param {String} BucketName
  * @param {String} BodyTemplate
  * @param {Object} BodyData
  * @param {String} AttachmentBucketName
  * @param {Array.<string>} attachmentKeys
  * @returns {Object}
*/
exports.sendEmail = async function(AWS, FromEmailAddress, ToAddresses, CcAddresses, Subject, BucketName, BodyTemplate, BodyData, AttachmentBucketName, attachmentKeys){
  return new Promise(async (resolve, reject)=>{
    try{
      const s3 = new AWS.S3();
      var params = {
        Bucket: BucketName,
        Key: BodyTemplate
      };
      let s3Response = await s3.getObject(params).promise();
      const template = s3Response.Body.toString('utf-8');
      const replacements = BodyData;
      const result = template.replace(/{{(.*?)}}/g, (match, key) => {
        if (replacements[key]) {
          return replacements[key];
        }
        else {
          return "";
        }
      });
      if(Array.isArray(attachmentKeys) && attachmentKeys.length > 0)
      {
        var ses = new AWS.SES();
        var transporter = nodemailer.createTransport({
          SES: ses
        });
        let fileAttachments = []
        for(let i=0; i<attachmentKeys.length; i++){
          let fileData = await s3.getObject({Bucket: AttachmentBucketName, Key: attachmentKeys[i]}).promise();
          fileAttachments.push({
            filename: attachmentKeys[i],
            content: fileData.Body
          })
        }
        var mailOptions = {
          from: FromEmailAddress,
          subject: Subject,
          html: result,
          to: ToAddresses,
          cc: CcAddresses,
          // bcc: Any BCC address you want here in an array,
          attachments: fileAttachments
        };
        try{
          let sendMailResponse = await transporter.sendMail(mailOptions);
          resolve({statusCode: 200, message: "Success", messageID: sendMailResponse.messageId})
        }
        catch(error){
          reject({statusCode: 400, message: "Error occurred while sending email", error: error});
        }
      }
      else{
        var params = {
          Content: {
            Simple: {
              Body: {
                Html: {
                  Data: result,
                  Charset: 'UTF-8',
                }
              },
              Subject: {
                Data: Subject,
                Charset: 'UTF-8',
              }
            }
          },
          Destination: {
            CcAddresses: CcAddresses,
            ToAddresses: ToAddresses
          },
          FromEmailAddress: FromEmailAddress
        };
        
        var sesv2 = new AWS.SESV2();
        let data = await sesv2.sendEmail(params).promise();
        
        resolve({statusCode: 200, message: "Success", messageID: data.MessageId})
      }
    }
    catch(error){
      reject({statusCode: 400, message: "Error occurred while sending email", error: error})
    }
  })
}