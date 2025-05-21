const { htmlToText } = require("html-to-text");
const nodemailer = require("nodemailer");
const pug = require("pug");

// module.exports = async function (options) {
//   const transport = nodemailer.createTransport({
//     host: process.env.MAIL_HOST,
//     port: process.env.MAIL_PORT,
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS,
//     },
//   });

//   await transport.sendMail({
//     from: "superadmin@test.io <celestine 👻>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   });
// };

module.exports = class Email {
  constructor(user, url) {
    this.firstName = user.name.split(" ").at(0);
    this.to = user.email;
    // this.from = `Celestine Nwachukwu <${process.env.MAIL_FROM}>`;
    this.from = process.env.MAIL_FROM;
    this.url = url;
  }

  createTransport() {
    if (process.env.NODE_ENV === "production")
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const sendOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.createTransport().sendMail(sendOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset() {
    await this.send("passwordReset", " 'Your password reset token (valid for only 10 minutes)'");
  }
};
