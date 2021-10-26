const zlib = require("zlib");
const aws = require("aws-sdk");
const ses = new aws.SES({ region: "us-east-1" });

const generateEmailContent = (data) => {
  // Split the string by "INFO" and get the stringified JSON. Then parse the JSON content.
  let parsedData = JSON.parse(data.split("INFO")[1].trim());
  let logData = "<br/><h2><u>Application Logs</u></h2>";
  logData += `<p style='color: red; font-size: 16px;'><b>Status:</b>${parsedData.type}</p>`;
  logData += `<p style='font-size: 14px;'><b>Stage:</b>${parsedData.context.stage}</p>`;
  logData += `<p style='font-size: 14px;'><b>IP:</b>${parsedData.context.sourceIp}</p>`;
  logData += `<p style='font-size: 14px;'><b>URL Path:</b>${parsedData.context.path}</p>`;
  logData += `<p style='font-size: 14px;'><b>HTTP Method:</b>${parsedData.context.httpMethod}</p>`;
  logData += `<p style='font-size: 14px;'><b>Message:</b>${parsedData.message}</p>`;
  logData += `<p style='font-size: 14px;'><b>Callstack:</b>${parsedData.callstack || "N/A"}</p>`;

  let subject = `${parsedData.type} Alert - Fib generator API`;

  let emailContent = {
    Destination: {
      ToAddresses: ["manojf.udemy@gmail.com"]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: logData
        },
        Text: {
          Charset: "UTF-8",
          Data: logData
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject
      }
    },
    Source: "manojf.udemy@gmail.com",
    SourceArn: "arn:aws:ses:us-east-1:885121665536:identity/manojf.udemy@gmail.com",
    Tags: [
      {
        Name: "sender",
        Value: "Manoj"
      }
    ]
  };

  return emailContent;
};

exports.handler = function (input, context) {
  let payload = Buffer.from(input.awslogs.data, "base64");
  zlib.gunzip(payload, function (e, result) {
    if (e) {
      context.fail(e);
    } else {
      result = JSON.parse(result.toString("ascii"));
      const latestLogEvent = result.logEvents[0];
      ses.sendEmail(generateEmailContent(latestLogEvent.message), (err, data) => {
        if (err) console.log(err);
        else {
          console.log(data);
          context.succeed();
        }
      });
    }
  });
};
