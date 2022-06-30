# SES Email Sender - Send AWS SES Emails with a simple call
Renders and sends emails through AWS SES with templates stored in S3.


To install:

npm install @srinathkbx/sesemailsender

Example template.html file in S3:
```
<p>
  A simple email with dynamic values!
  Hi {{name1}}, {{name2}} and {{name3}}!
</p>
```
Example snippet to send an email:
```
const AWS = require('aws-sdk');
const sesemailsender = require('@srinathkbx/sesemailsender');
AWS.config.update({
  accessKeyId: YOUR_AWS_CLIENT_ID,
  secretAccessKey: YOUR_AWS_CLIENT_SECRET,
  region: YOUR_AWS_REGION
});

sesemailsender.sendEmail(
  AWS,
  "karthik.appadurai@kbxdigital.com", //From
  ["srinath@kbxdigital.com"], //To
  [], //Cc
  "Example email", //Subject
  "emailtemplates", //BucketName
  "template.html", //BodyTemplate
  {"name1":"John", "name2": "Jane", "name3": "Jacob"}, //BodyData
  "devblujfiles", //AttachmentBucketName
  ["verified.png"] //attachmentKeys 
).then((response)=>{
  console.log(response);
}).catch((error)=>{
  console.log(error);
});
```